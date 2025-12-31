import type { Timer } from '../types/timer';

export const presets: Timer[] = [
    // --- BREATHWORK ---
    {
        id: 'preset-box-breathing',
        name: 'Box Breathing',
        type: 'complex',
        tags: ['breathwork', 'calm', 'focus'],
        color: '#4ADE80', // Green
        repetitions: -1, // Infinite
        steps: [
            { id: '1', name: 'Inhale', duration: 4 },
            { id: '2', name: 'Hold', duration: 4 },
            { id: '3', name: 'Exhale', duration: 4 },
            { id: '4', name: 'Hold', duration: 4 },
        ],
        order: 0,
        userId: 'system',
        isPreset: true,
        imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=300&q=80'
    },
    {
        id: 'preset-478',
        name: '4-7-8 Relaxing Breath',
        type: 'complex',
        tags: ['breathwork', 'sleep', 'anxiety'],
        color: '#818cf8', // Indigo
        repetitions: 4,
        steps: [
            { id: '1', name: 'Inhale (Nose)', duration: 4 },
            { id: '2', name: 'Hold', duration: 7 },
            { id: '3', name: 'Exhale (Mouth)', duration: 8 },
        ],
        order: 1,
        userId: 'system',
        isPreset: true,
        imageUrl: 'https://images.unsplash.com/photo-1528319725582-ddc096101511?auto=format&fit=crop&w=300&q=80' // Calm water
    },

    // --- YOGA ---
    {
        id: 'preset-sun-salutation',
        name: 'Sun Salutation A',
        type: 'complex',
        tags: ['yoga', 'morning', 'stretch'],
        color: '#F59E0B', // Amber/Orange
        repetitions: 5,
        steps: [
            { id: '1', name: 'Mountain Pose', duration: 5 },
            { id: '2', name: 'Forward Fold', duration: 5 },
            { id: '3', name: 'Plank', duration: 5 },
            { id: '4', name: 'Chaturanga', duration: 5 },
            { id: '5', name: 'Upward Dog', duration: 5 },
            { id: '6', name: 'Downward Dog', duration: 15 }, // Longer hold
        ],
        order: 2,
        userId: 'system',
        isPreset: true,
        imageUrl: 'https://images.unsplash.com/photo-1544367563-121910aa6e31?auto=format&fit=crop&w=300&q=80' // Yoga pose
    },
    {
        id: 'preset-morning-flow',
        name: 'Morning Flow',
        type: 'complex',
        tags: ['yoga', 'flow', 'morning'],
        color: '#fbbf24', // Yellow
        repetitions: 1,
        steps: [
            { id: '1', name: 'Child\'s Pose', duration: 60 },
            { id: '2', name: 'Cat-Cow', duration: 60 },
            { id: '3', name: 'Downward Dog', duration: 60 },
            { id: '4', name: 'Warrior I (Right)', duration: 45 },
            { id: '5', name: 'Warrior I (Left)', duration: 45 },
            { id: '6', name: 'Mountain Pose', duration: 60 },
        ],
        order: 3,
        userId: 'system',
        isPreset: true,
        imageUrl: 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?auto=format&fit=crop&w=300&q=80' // Girl doing yoga
    },

    // --- WORKOUT ---
    {
        id: 'preset-tabata',
        name: 'Tabata HIIT',
        type: 'complex',
        tags: ['workout', 'hiit', 'intense'],
        color: '#ef4444', // Red
        repetitions: 8,
        steps: [
            { id: '1', name: 'Sprint / Work', duration: 20 },
            { id: '2', name: 'Rest', duration: 10 },
        ],
        order: 4,
        userId: 'system',
        isPreset: true,
        imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=300&q=80' // Gym/Weights
    },
    {
        id: 'preset-hiit-40-20',
        name: 'HIIT 40/20',
        type: 'complex',
        tags: ['workout', 'hiit', 'cardio'],
        color: '#f87171', // Light Red
        repetitions: 10,
        steps: [
            { id: '1', name: 'High Intensity', duration: 40 },
            { id: '2', name: 'Recovery', duration: 20 },
        ],
        order: 5,
        userId: 'system',
        isPreset: true,
        imageUrl: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?auto=format&fit=crop&w=300&q=80' // Cardio/Run
    },
    {
        id: 'preset-emom',
        name: 'EMOM 10 Min',
        type: 'complex',
        tags: ['workout', 'crossfit', 'strength'],
        color: '#dc2626', // Dark Red
        repetitions: 10,
        steps: [
            { id: '1', name: 'Perform Task', duration: 60 },
        ],
        order: 6,
        userId: 'system',
        isPreset: true,
        imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=300&q=80' // Gym/Dumbbells
    },
    {
        id: 'preset-boxing',
        name: 'Boxing Rounds',
        type: 'complex',
        tags: ['workout', 'boxing', 'sport'],
        color: '#991b1b', // Maroon
        repetitions: 3,
        steps: [
            { id: '1', name: 'Fight Round', duration: 180 }, // 3 min
            { id: '2', name: 'Rest', duration: 60 }, // 1 min
        ],
        order: 7,
        userId: 'system',
        isPreset: true,
        imageUrl: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?auto=format&fit=crop&w=300&q=80' // Boxing gloves
    },
    {
        id: 'preset-pomodoro',
        name: 'Pomodoro',
        type: 'complex',
        tags: ['focus', 'productivity', 'study'],
        color: '#f43f5e', // Rose
        repetitions: 4,
        steps: [
            { id: '1', name: 'Focus Work', duration: 1500 }, // 25 min
            { id: '2', name: 'Short Break', duration: 300 }, // 5 min
        ],
        order: 5,
        userId: 'system',
        isPreset: true,
        imageUrl: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=300&q=80' // Desk/Computer
    }
];

// Initial user timers (My Timers)
export const mockTimers: Timer[] = [
    // Just one basic example custom timer
    {
        id: 'custom-meditation',
        name: 'Quick Reset',
        type: 'simple',
        tags: ['mindfulness'],
        color: '#22d3ee', // Cyan
        repetitions: 1,
        steps: [
            { id: '1', name: 'Breathe', duration: 60 },
        ],
        order: 100,
        userId: 'user-1',
        isPreset: false,
        imageUrl: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=300&q=80'
    },
    ...presets
];
