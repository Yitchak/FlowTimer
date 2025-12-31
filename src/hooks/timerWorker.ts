/* eslint-disable no-restricted-globals */
// Web Worker for accurate timing running in background
let intervalId: number | null = null;
let expectedEnd: number | null = null;

self.onmessage = (e) => {
    const { action, payload } = e.data;

    if (action === 'START') {
        const { durationInSeconds } = payload;

        // Calculate expected end time based on current time
        // This makes it resilient to throttling - we check "real time" vs target
        expectedEnd = Date.now() + (durationInSeconds * 1000);

        // Clear any existing interval
        if (intervalId) clearInterval(intervalId);

        // Run interval
        intervalId = self.setInterval(() => {
            if (!expectedEnd) return;

            const now = Date.now();
            const remaining = Math.ceil((expectedEnd - now) / 1000);

            if (remaining <= 0) {
                // Timer finished
                if (intervalId) clearInterval(intervalId);
                intervalId = null;
                self.postMessage({ type: 'COMPLETE' });
            } else {
                // Tick
                self.postMessage({ type: 'TICK', timeLeft: remaining });
            }
        }, 1000) as unknown as number; // Type assertion for TS worker environment

    } else if (action === 'STOP' || action === 'PAUSE') {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
        expectedEnd = null;
    }
};

export { };
