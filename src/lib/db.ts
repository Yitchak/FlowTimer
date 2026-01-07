import { supabase } from './supabase';
import type { Timer } from '../types/timer';

export const TimerDB = {
    // Fetch all timers for the current user
    async getAll(): Promise<Timer[]> {
        const { data, error } = await supabase
            .from('timers')
            .select('*')
            .order('order', { ascending: true });

        if (error) throw error;

        return (data || []).map(row => ({
            id: row.id,
            name: row.name,
            type: row.type as any,
            tags: row.tags || [],
            imageUrl: row.image_url,
            color: row.color,
            repetitions: row.repetitions,
            steps: row.steps,
            order: row.order,
            userId: row.user_id,
            isPreset: row.is_preset
        }));
    },

    // Create a new timer
    async create(timer: Timer): Promise<Timer> {
        // Exclude local ID if it's a temp ID, but Supabase generates generic UUIDs.
        // If the timer already has a UUID (generated locally), we can use it, OR let Supabase generate one.
        // Usually, we generate UUID locally so UI is optimistic.

        const row = {
            id: timer.id,
            user_id: timer.userId,
            name: timer.name,
            type: timer.type,
            tags: timer.tags,
            image_url: timer.imageUrl,
            color: timer.color,
            repetitions: timer.repetitions,
            steps: timer.steps,
            "order": timer.order,
            is_preset: timer.isPreset
        };

        const { data, error } = await supabase
            .from('timers')
            .insert(row)
            .select()
            .single();

        if (error) throw error;

        return {
            ...timer,
            id: data.id // confirm ID
        };
    },

    // Update an existing timer
    async update(timer: Timer): Promise<void> {
        const row = {
            name: timer.name,
            type: timer.type,
            tags: timer.tags,
            image_url: timer.imageUrl,
            color: timer.color,
            repetitions: timer.repetitions,
            steps: timer.steps,
            "order": timer.order,
            is_preset: timer.isPreset
        };

        const { error } = await supabase
            .from('timers')
            .update(row)
            .eq('id', timer.id);

        if (error) throw error;
    },

    // Delete a timer
    async delete(timerId: string): Promise<void> {
        const { error } = await supabase
            .from('timers')
            .delete()
            .eq('id', timerId);

        if (error) throw error;
    },

    // Sync array of timers (e.g. reorder or bulk update) mechanism is complex, 
    // for now we stick to individual CRUD or "Save All" if necessary.
    // For reorder, we might need a batch update RPC, but let's keep it simple.
    async saveAll(timers: Timer[], userId: string): Promise<void> {
        // This is a naive "upsert" approach for initial sync
        const rows = timers.map(t => ({
            id: t.id,
            user_id: userId,
            name: t.name,
            type: t.type,
            tags: t.tags,
            image_url: t.imageUrl,
            color: t.color,
            repetitions: t.repetitions,
            steps: t.steps,
            "order": t.order,
            is_preset: t.isPreset
        }));

        const { error } = await supabase
            .from('timers')
            .upsert(rows, { onConflict: 'id' });

        if (error) throw error;
    }
};
