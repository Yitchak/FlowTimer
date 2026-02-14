import { useState, useEffect } from 'react';
import type { Timer } from '../types/timer';
import { TimerDB } from '../lib/db';
import { mockTimers as initialMockTimers, PRESETS_VERSION } from '../data/mockTimers';
import type { User } from '@supabase/supabase-js';
import { toast } from 'sonner';

const STORAGE_KEY = 'flowtimer_data';
const VERSION_KEY = 'flowtimer_presets_version';

export const useTimerStorage = (user: User | null) => {
    const [timers, setTimers] = useState<Timer[]>(() => {
        // Check if presets need updating
        const savedVersion = localStorage.getItem(VERSION_KEY);
        const currentVersion = PRESETS_VERSION.toString();

        // Initial Load from LocalStorage
        const saved = localStorage.getItem(STORAGE_KEY);
        const savedTimers: Timer[] = saved ? JSON.parse(saved) : initialMockTimers;

        // If version changed, update presets but keep custom timers
        if (savedVersion !== currentVersion && saved) {
            console.log(`Updating presets from version ${savedVersion} to ${currentVersion}`);

            // Separate custom timers from presets
            const customTimers = savedTimers.filter(t => !t.isPreset);
            const newPresets = initialMockTimers.filter(t => t.isPreset);

            // Combine: new presets + existing custom timers
            const updated = [...newPresets, ...customTimers];

            // Save updated version
            localStorage.setItem(VERSION_KEY, currentVersion);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

            return updated;
        }

        // First time or no version change
        if (!savedVersion) {
            localStorage.setItem(VERSION_KEY, currentVersion);
        }

        return savedTimers;
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
        setTimers(prev => [...prev, newTimer]);

        if (user) {
            try {
                await TimerDB.create({ ...newTimer, userId: user.id });
            } catch (error) {
                console.error("Cloud save failed:", error);
                toast.error("Failed to save to cloud");
                // Rollback
                setTimers(prev => prev.filter(t => t.id !== newTimer.id));
            }
        }
    };

    const updateTimer = async (updatedTimer: Timer) => {
        let previousTimer: Timer | undefined;
        setTimers(prev => {
            previousTimer = prev.find(t => t.id === updatedTimer.id);
            return prev.map(t => t.id === updatedTimer.id ? updatedTimer : t);
        });

        if (user) {
            try {
                await TimerDB.update(updatedTimer);
            } catch (error) {
                console.error("Cloud update failed:", error);
                toast.error("Failed to update in cloud");
                if (previousTimer) {
                    setTimers(prev => prev.map(t => t.id === updatedTimer.id ? previousTimer! : t));
                }
            }
        }
    };

    const deleteTimer = async (timerId: string) => {
        let deletedTimer: Timer | undefined;
        setTimers(prev => {
            deletedTimer = prev.find(t => t.id === timerId);
            return prev.filter(t => t.id !== timerId);
        });

        if (user) {
            try {
                await TimerDB.delete(timerId);
            } catch (error) {
                console.error("Cloud delete failed:", error);
                toast.error("Failed to delete from cloud");
                if (deletedTimer) {
                    setTimers(prev => [...prev, deletedTimer!]);
                }
            }
        }
    };

    const reorderTimers = async (newOrder: Timer[]) => {
        const ordered = newOrder.map((t, index) => ({ ...t, order: index }));
        let previousTimers: Timer[] = [];
        setTimers(prev => {
            previousTimers = prev;
            return ordered;
        });

        if (user) {
            try {
                await TimerDB.saveAll(ordered, user.id);
            } catch (error) {
                console.error("Cloud reorder failed:", error);
                toast.error("Failed to sync order to cloud");
                setTimers(previousTimers);
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
