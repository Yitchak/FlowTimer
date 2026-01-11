export const playTimerSound = (type: 'step' | 'complete', volumeScale: number = 1.0) => {
    // Check for AudioContext support
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();

    const playTone = (freq: number, type: 'sine' | 'triangle' | 'square', duration: number, startTime: number, volume: number = 1.0) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, startTime);

        // Envelope for bell-like sound
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(volume * volumeScale, startTime + 0.01); // Attack
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration); // Decay

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;

    if (type === 'step') {
        // High pitched "Ping" for step change
        playTone(880, 'sine', 1.0, now, 2.5); // Boosted to ~90% of cycle sound
        playTone(1760, 'sine', 0.8, now, 1.5); // Matching harmonic level
    } else {
        // LOUD Alarm / Bell for completion
        // Pattern: Ding... Ding... Ding...

        const playBell = (timeOffset: number) => {
            // Fundamental (stronger)
            playTone(880, 'triangle', 0.8, now + timeOffset, 2.5); // A5 - Very Loud
            playTone(1760, 'sine', 0.8, now + timeOffset, 1.5); // A6 - High Brilliance
            playTone(440, 'square', 0.8, now + timeOffset, 0.5); // A4 - Strong Body
        };

        // Repeat 2 times
        playBell(0);
        playBell(0.6);
    }
};
