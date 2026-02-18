export type TimerType = 'simple' | 'complex';

export interface TimerStep {
  id: string;
  name: string;
  duration: number; // in seconds
  color?: string;
  imageUrl?: string;       // Per-step image (single, backward compat)
  images?: string[];       // Multiple images per step (e.g. forward bend + backward bend)
  instructions?: string;   // Text instructions for this step
  ttsText?: string;        // Text for text-to-speech (defaults to instructions if not set)
}

export interface Timer {
  id: string;
  name: string;
  type: TimerType;
  tags: string[];
  imageUrl?: string;
  color?: string;

  // Settings
  repetitions: number; // -1 for continuous, 1+ for specific
  steps: TimerStep[];

  // State (for Firestore/Sync)
  order: number;
  userId: string;
  isPreset?: boolean;
}

export interface TimerSession {
  timerId: string;
  isActive: boolean;
  currentStepIndex: number;
  currentRepetition: number;
  remainingTime: number; // current step remaining
  totalElapsed: number;
}
