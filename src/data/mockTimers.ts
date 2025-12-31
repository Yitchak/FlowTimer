import type { Timer } from '../types/timer';

export const presets: Timer[] = [
    {
        id: 'preset-sat-kriya',
        name: 'SAT KRIYA',
        type: 'complex',
        tags: ['Meditation', 'Yoga'],
        color: '#ff7043', // Deep Orange
        repetitions: 1,
        steps: [
            { id: 'p1', name: 'Preparation', duration: 15 },
            { id: 'p2', name: 'Sat kriya', duration: 180 },
            { id: 'p3', name: 'Breath in and out', duration: 5 },
            { id: 'p4', name: 'Hold', duration: 20 },
            { id: 'p5', name: 'Preparation', duration: 15 },
            { id: 'p6', name: 'Relaxation', duration: 60 }
        ],
        order: 100,
        userId: 'system',
        isPreset: true,
        imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: 'preset-alt-breath',
        name: 'Alternate breathing',
        type: 'complex',
        tags: ['Pranayama', 'Calm'],
        color: '#26c6da', // Cyan
        repetitions: 4,
        steps: [
            { id: 'b1', name: 'Inhale', duration: 4 },
            { id: 'b2', name: 'Hold', duration: 16 },
            { id: 'b3', name: 'Exhale', duration: 8 }
        ],
        order: 101,
        userId: 'system',
        isPreset: true,
        imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: 'preset-1min',
        name: '1 Minute Flow',
        type: 'complex',
        tags: ['Quick'],
        color: '#66bb6a', // Green
        repetitions: -1,
        steps: [
            { id: '1m1', name: 'Preparation', duration: 15 },
            { id: '1m2', name: '1 minute', duration: 60 }
        ],
        order: 102,
        userId: 'system',
        isPreset: true
    },
    {
        id: 'preset-3min',
        name: '3 Minutes Flow',
        type: 'complex',
        tags: ['Focus'],
        color: '#42a5f5', // Blue
        repetitions: -1,
        steps: [
            { id: '3m1', name: 'Preparation', duration: 15 },
            { id: '3m2', name: '3 minutes', duration: 180 }
        ],
        order: 103,
        userId: 'system',
        isPreset: true
    },
    {
        id: 'preset-11min',
        name: '11 Minutes Flow',
        type: 'complex',
        tags: ['Deep Focus'],
        color: '#7e57c2', // Deep Purple
        repetitions: -1,
        steps: [
            { id: '11m1', name: 'Preparation', duration: 15 },
            { id: '11m2', name: '11 minutes', duration: 660 }
        ],
        order: 104,
        userId: 'system',
        isPreset: true
    }
];

export const mockTimers: Timer[] = [
    {
        id: '1',
        name: 'Morning Meditation',
        type: 'simple',
        tags: ['Focus'],
        color: '#ffa726', // Orange
        repetitions: 1,
        steps: [
            { id: 's1', name: 'Focus', duration: 600 }
        ],
        order: 0,
        userId: 'user1',
        imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800'
    },
    ...presets
];
