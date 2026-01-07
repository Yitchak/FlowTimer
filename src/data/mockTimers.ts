import type { Timer } from '../types/timer';

export const presets: Timer[] = [
    // --- BREATHWORK ---
    {
        id: 'preset-box-breathing',
        name: 'presets.boxBreathing',
        type: 'complex',
        tags: ['breathwork', 'calm', 'focus'],
        color: '#4ADE80', // Green
        repetitions: -1, // Infinite
        steps: [
            { id: '1', name: 'steps.inhale', duration: 4 },
            { id: '2', name: 'steps.hold', duration: 4 },
            { id: '3', name: 'steps.exhale', duration: 4 },
            { id: '4', name: 'steps.hold', duration: 4 },
        ],

        order: 0,
        userId: 'system',
        isPreset: true,
        imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=300&q=80'
    },
    {
        id: 'preset-478',
        name: 'presets.478',
        type: 'complex',
        tags: ['breathwork', 'sleep', 'anxiety'],
        color: '#818cf8', // Indigo
        repetitions: 4,
        steps: [
            { id: '1', name: 'steps.inhaleNose', duration: 4 },
            { id: '2', name: 'steps.hold', duration: 7 },
            { id: '3', name: 'steps.exhaleMouth', duration: 8 },
        ],

        order: 1,
        userId: 'system',
        isPreset: true,
        imageUrl: 'https://images.unsplash.com/photo-1528319725582-ddc096101511?auto=format&fit=crop&w=300&q=80' // Calm water
    },



    // --- WORKOUT ---
    {
        id: 'preset-tabata',
        name: 'presets.tabata',
        type: 'complex',
        tags: ['workout', 'hiit', 'intense'],
        color: '#ef4444', // Red
        repetitions: 8,
        steps: [
            { id: '1', name: 'steps.sprint', duration: 20 },
            { id: '2', name: 'steps.rest', duration: 10 },
        ],

        order: 4,
        userId: 'system',
        isPreset: true,
        imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=300&q=80' // Gym/Weights
    },
    {
        id: 'preset-hiit-40-20',
        name: 'presets.hiit4020',
        type: 'complex',
        tags: ['workout', 'hiit', 'cardio'],
        color: '#f87171', // Light Red
        repetitions: 10,
        steps: [
            { id: '1', name: 'steps.highIntensity', duration: 40 },
            { id: '2', name: 'steps.recovery', duration: 20 },
        ],

        order: 5,
        userId: 'system',
        isPreset: true,
        imageUrl: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?auto=format&fit=crop&w=300&q=80' // Cardio/Run
    },
    {
        id: 'preset-emom',
        name: 'presets.emom',
        type: 'complex',
        tags: ['workout', 'crossfit', 'strength'],
        color: '#dc2626', // Dark Red
        repetitions: 10,
        steps: [
            { id: '1', name: 'steps.performTask', duration: 60 },
        ],

        order: 6,
        userId: 'system',
        isPreset: true,
        imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=300&q=80' // Gym/Dumbbells
    },
    {
        id: 'preset-boxing',
        name: 'presets.boxing',
        type: 'complex',
        tags: ['workout', 'boxing', 'sport'],
        color: '#991b1b', // Maroon
        repetitions: 3,
        steps: [
            { id: '1', name: 'steps.fightRound', duration: 180 }, // 3 min
            { id: '2', name: 'steps.rest', duration: 60 }, // 1 min
        ],

        order: 7,
        userId: 'system',
        isPreset: true,
        imageUrl: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?auto=format&fit=crop&w=300&q=80' // Boxing gloves
    },
    {
        id: 'preset-pomodoro',
        name: 'presets.pomodoro',
        type: 'complex',
        tags: ['focus', 'productivity', 'study'],
        color: '#f43f5e', // Rose
        repetitions: 4,
        steps: [
            { id: '1', name: 'steps.focusWork', duration: 1500 }, // 25 min
            { id: '2', name: 'steps.shortBreak', duration: 300 }, // 5 min
        ],

        order: 5,
        userId: 'system',
        isPreset: true,
        imageUrl: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=300&q=80' // Desk/Computer
    },
    {
        id: 'preset-sat-kriya',
        name: 'presets.satKriya',
        type: 'complex',
        tags: ['meditation', 'yoga', 'kundalini'],
        color: '#ff7043', // Deep Orange
        repetitions: 1,
        steps: [
            { id: 'p1', name: 'steps.preparation', duration: 15 },
            { id: 'p2', name: 'steps.satKriya', duration: 180 },
            { id: 'p3', name: 'steps.breathInOut', duration: 5 },
            { id: 'p4', name: 'steps.hold', duration: 20 },
            { id: 'p5', name: 'steps.preparation', duration: 15 },
            { id: 'p6', name: 'steps.relaxation', duration: 60 }
        ],

        order: 8,
        userId: 'system',
        isPreset: true,
        imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=300&q=80'
    },
    {
        id: 'preset-alt-breath',
        name: 'presets.altBreath',
        type: 'complex',
        tags: ['breathwork', 'pranayama', 'calm', 'yoga'],
        color: '#26c6da', // Cyan
        repetitions: 4,
        steps: [
            { id: 'b1', name: 'steps.inhale', duration: 4 },
            { id: 'b2', name: 'steps.hold', duration: 16 },
            { id: 'b3', name: 'steps.exhale', duration: 8 },
            { id: 'b4', name: 'steps.inhale', duration: 4 },
            { id: 'b5', name: 'steps.hold', duration: 16 },
            { id: 'b6', name: 'steps.exhale', duration: 8 }
        ],

        order: 9,
        userId: 'system',
        isPreset: true,
        imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=300&q=80'
    },
    {
        id: 'preset-1min',
        name: 'presets.1min',
        type: 'complex',
        tags: ['quick', 'flow', 'yoga'],
        color: '#66bb6a', // Green
        repetitions: -1,
        steps: [
            { id: '1m1', name: 'steps.preparation', duration: 15 },
            { id: '1m2', name: 'steps.1min', duration: 60 }
        ],

        order: 10,
        userId: 'system',
        isPreset: true,
        imageUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=300&q=80' // Clock/time
    },
    {
        id: 'preset-3min',
        name: 'presets.3min',
        type: 'complex',
        tags: ['focus', 'flow', 'yoga'],
        color: '#42a5f5', // Blue
        repetitions: -1,
        steps: [
            { id: '3m1', name: 'steps.preparation', duration: 15 },
            { id: '3m2', name: 'steps.3min', duration: 180 }
        ],

        order: 11,
        userId: 'system',
        isPreset: true,
        imageUrl: 'https://images.unsplash.com/photo-1501139083538-0139583c61df?auto=format&fit=crop&w=300&q=80'
    },
    {
        id: 'preset-11min',
        name: 'presets.11min',
        type: 'complex',
        tags: ['deep focus', 'flow', 'yoga'],
        color: '#7e57c2', // Deep Purple
        repetitions: -1,
        steps: [
            { id: '11m1', name: 'steps.preparation', duration: 15 },
            { id: '11m2', name: 'steps.11min', duration: 660 }
        ],

        order: 12,
        userId: 'system',
        isPreset: true,
        imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=300&q=80'
    },
    {
        id: 'preset-6-plus-1',
        name: 'presets.6plus1',
        type: 'complex',
        tags: ['yoga', 'meditation'],
        color: '#14b8a6', // Teal
        repetitions: 1,
        steps: [
            { id: '6p1s1', name: 'steps.preparation', duration: 15, color: '#14b8a6' }, // Teal
            { id: '6p1s2', name: 'steps.sixMinutes', duration: 360, color: '#22c55e' }, // Green
            { id: '6p1s3', name: 'steps.1min', duration: 60, color: '#84cc16' }, // Lime
            { id: '6p1s4', name: 'steps.inhale', duration: 5, color: '#0ea5e9' }, // Sky
            { id: '6p1s5', name: 'steps.hold', duration: 20, color: '#ef4444' } // Red
        ],

        order: 13,
        userId: 'system',
        isPreset: true,
        imageUrl: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?auto=format&fit=crop&w=300&q=80'
    }
];

// Initial user timers (My Timers)
export const mockTimers: Timer[] = [
    // Just one basic example custom timer
    {
        id: 'custom-meditation',
        name: 'presets.quickReset',
        type: 'simple',
        tags: ['mindfulness'],
        color: '#22d3ee', // Cyan
        repetitions: 1,
        steps: [
            { id: '1', name: 'steps.breathe', duration: 60 },
        ],

        order: 100,
        userId: 'user-1',
        isPreset: false,
        imageUrl: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=300&q=80'
    },
    ...presets
];
