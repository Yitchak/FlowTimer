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
    {
        id: 'preset-evening-stretch',
        name: 'Evening Wind Down',
        type: 'complex',
        tags: ['yoga', 'sleep', 'relax'],
        color: '#8b5cf6', // Violet
        repetitions: 1,
        steps: [
            { id: '1', name: 'Child\'s Pose', duration: 120 },
            { id: '2', name: 'Thread the Needle (R)', duration: 60 },
            { id: '3', name: 'Thread the Needle (L)', duration: 60 },
            { id: '4', name: 'Happy Baby', duration: 90 },
            { id: '5', name: 'Savasana', duration: 180 },
        ],
        order: 3, // Same order group
        userId: 'system',
        isPreset: true,
        imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=300&q=80'
    },
    {
        id: 'preset-power-yoga',
        name: 'Power Yoga Core',
        type: 'complex',
        tags: ['yoga', 'workout', 'core'],
        color: '#ea580c', // Orange
        repetitions: 3,
        steps: [
            { id: '1', name: 'Boat Pose', duration: 30 },
            { id: '2', name: 'Plank Hold', duration: 45 },
            { id: '3', name: 'Side Plank (R)', duration: 30 },
            { id: '4', name: 'Side Plank (L)', duration: 30 },
            { id: '5', name: 'Rest', duration: 15 },
        ],
        order: 3,
        userId: 'system',
        isPreset: true,
        imageUrl: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?auto=format&fit=crop&w=300&q=80'
    },
    {
        id: 'preset-yin-yoga',
        name: 'Yin Yoga Deep',
        type: 'complex',
        tags: ['yoga', 'stretch', 'flexibility'],
        color: '#14b8a6', // Teal
        repetitions: 1,
        steps: [
            { id: '1', name: 'Dragon Pose (R)', duration: 180 }, // 3 min
            { id: '2', name: 'Dragon Pose (L)', duration: 180 },
            { id: '3', name: 'Sleeping Swan (R)', duration: 180 },
            { id: '4', name: 'Sleeping Swan (L)', duration: 180 },
            { id: '5', name: 'Butterfly', duration: 240 }, // 4 min
        ],
        order: 3,
        userId: 'system',
        isPreset: true,
        imageUrl: 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?auto=format&fit=crop&w=300&q=80'
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
    },
    {
        id: 'preset-sat-kriya',
        name: 'SAT KRIYA',
        type: 'complex',
        tags: ['meditation', 'yoga', 'kundalini'],
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
        order: 8,
        userId: 'system',
        isPreset: true,
        imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=300&q=80'
    },
    {
        id: 'preset-alt-breath',
        name: 'Alternate Breathing',
        type: 'complex',
        tags: ['breathwork', 'pranayama', 'calm'],
        color: '#26c6da', // Cyan
        repetitions: 4,
        steps: [
            { id: 'b1', name: 'Inhale', duration: 4 },
            { id: 'b2', name: 'Hold', duration: 16 },
            { id: 'b3', name: 'Exhale', duration: 8 }
        ],
        order: 9,
        userId: 'system',
        isPreset: true,
        imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=300&q=80'
    },
    {
        id: 'preset-1min',
        name: '1 Minute Flow',
        type: 'complex',
        tags: ['quick', 'flow'],
        color: '#66bb6a', // Green
        repetitions: -1,
        steps: [
            { id: '1m1', name: 'Preparation', duration: 15 },
            { id: '1m2', name: '1 minute', duration: 60 }
        ],
        order: 10,
        userId: 'system',
        isPreset: true,
        imageUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=300&q=80' // Clock/time
    },
    {
        id: 'preset-3min',
        name: '3 Minutes Flow',
        type: 'complex',
        tags: ['focus', 'flow'],
        color: '#42a5f5', // Blue
        repetitions: -1,
        steps: [
            { id: '3m1', name: 'Preparation', duration: 15 },
            { id: '3m2', name: '3 minutes', duration: 180 }
        ],
        order: 11,
        userId: 'system',
        isPreset: true,
        imageUrl: 'https://images.unsplash.com/photo-1501139083538-0139583c61df?auto=format&fit=crop&w=300&q=80'
    },
    {
        id: 'preset-11min',
        name: '11 Minutes Flow',
        type: 'complex',
        tags: ['deep focus', 'flow'],
        color: '#7e57c2', // Deep Purple
        repetitions: -1,
        steps: [
            { id: '11m1', name: 'Preparation', duration: 15 },
            { id: '11m2', name: '11 minutes', duration: 660 }
        ],
        order: 12,
        userId: 'system',
        isPreset: true,
        imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=300&q=80'
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
