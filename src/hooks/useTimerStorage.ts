import { useState, useEffect, useCallback } from 'react';
import type { Timer } from '../types/timer';
import { TimerDB } from '../lib/db';
import { mockTimers as initialMockTimers } from '../data/mockTimers';
import type { User } from '@supabase/supabase-js';
import { toast } from 'sonner';

const STORAGE_KEY = 'flowtimer_data';

export const useTimerStorage = (user: User | null) => {
    const [timers, setTimers] = useState<Timer[]>(() => {
        // Initial Load from LocalStorage
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : initialMockTimers;
    });
    const [loading, setLoading] = useState(false);

    // Sync with Cloud when User changes
    useEffect(() => {
        if (!user) return;

        const loadCloudTimers = async () => {
            setLoading(true);
            try {
                const cloudTimers = await TimerDB.getAll();

                if (cloudTimers.length === 0 && timers.length > 0) {
                    // Migration: Cloud is empty, but we have local data. Upload it.
                    console.log("Migrating local timers to cloud...");
                    toast.info("Syncing your timers to the cloud...");
                    await TimerDB.saveAll(timers, user.id);
                    // No need to setTimers, we already have them.
                } else if (cloudTimers.length > 0) {
                    // Cloud has data, overwrite local (Source of Truth)
                    // Optional: Merge strategy (advanced), for now Cloud wins.
                    setTimers(cloudTimers);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudTimers)); // Sync local mirror
                }
            } catch (error) {
                console.error("Failed to load cloud timers:", error);
                toast.error("Failed to sync with cloud");
            } finally {
                setLoading(false);
            }
        };

        loadCloudTimers();
    }, [user]); // Only run when user login state changes

    // Save to LocalStorage whenever timers change (for offline/backup)
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
    }, [timers]);

    const addTimer = async (newTimer: Timer) => {
        // Optimistic Update
        setTimers(prev => [...prev, newTimer]);

        if (user) {
            try {
                // Background sync
                await TimerDB.create({ ...newTimer, userId: user.id });
            } catch (error) {
                console.error("Cloud save failed:", error);
                toast.error("Failed to save to cloud");
            }
        }
    };

    const updateTimer = async (updatedTimer: Timer) => {
        setTimers(prev => prev.map(t => t.id === updatedTimer.id ? updatedTimer : t));

        if (user) {
            try {
                await TimerDB.update(updatedTimer);
            } catch (error) {
                console.error("Cloud update failed:", error);
            }
        }
    };

    const deleteTimer = async (timerId: string) => {
        setTimers(prev => prev.filter(t => t.id !== timerId));

        if (user) {
            try {
                await TimerDB.delete(timerId);
            } catch (error) {
                console.error("Cloud delete failed:", error);
            }
        }
    };

    const reorderTimers = async (newOrder: Timer[]) => {
        // Update order field in objects
        const ordered = newOrder.map((t, index) => ({ ...t, order: index }));
        setTimers(ordered);

        if (user) {
            try {
                await TimerDB.saveAll(ordered, user.id); // Bulk upsert to update orders
            } catch (error) {
                console.error("Cloud reorder failed:", error);
            }
        }
    };

    // Import (Replace all)
    const importTimers = async (newTimers: Timer[]) => {
        setTimers(newTimers);
        if (user) {
            // Maybe delete old ones? Or upsert?
            // Simplest for now: overwrite all via saveAll (upsert).
            // But saveAll doesn't delete removed ones.
            // Ideally: Delete all for user, then Insert all.
            try {
                // For now just upsert, proper sync is hard.
                await TimerDB.saveAll(newTimers, user.id);
            } catch (e) {
                console.error(e);
            }
        }
    };

    return {
        timers,
        loading,
        addTimer,
        updateTimer,
        deleteTimer,
        reorderTimers,
        importTimers,
        setTimers // Expose raw setter if needed (e.g. for simple non-cloud logic)
    };
};
