let sharedCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;

    if (!sharedCtx || sharedCtx.state === 'closed') {
        sharedCtx = new AudioContextClass();
    }
    // Resume if suspended (e.g. after user interaction policy)
    if (sharedCtx.state === 'suspended') {
        sharedCtx.resume();
    }
    return sharedCtx;
};

export const playTimerSound = (type: 'step' | 'complete', volumeScale: number = 1.0) => {
    const ctx = getAudioContext();
    if (!ctx) return;

    const playTone = (freq: number, oscType: OscillatorType, duration: number, startTime: number, volume: number = 1.0) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = oscType;
        osc.frequency.setValueAtTime(freq, startTime);

        // Clamp volume to [0, 1] to avoid clipping
        const clampedVolume = Math.min(Math.max(volume * volumeScale, 0), 1);

        // Envelope for bell-like sound
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(clampedVolume, startTime + 0.01); // Attack
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration); // Decay

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;

    if (type === 'step') {
        // High pitched "Ping" for step change
        playTone(880, 'sine', 1.0, now, 0.7);
        playTone(1760, 'sine', 0.8, now, 0.4);
    } else {
        // Bell for completion
        const playBell = (timeOffset: number) => {
            playTone(880, 'triangle', 0.8, now + timeOffset, 0.8);
            playTone(1760, 'sine', 0.8, now + timeOffset, 0.5);
            playTone(440, 'square', 0.8, now + timeOffset, 0.2);
        };

        playBell(0);
        playBell(0.6);
    }
};
