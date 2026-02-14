import { useState, useEffect, useRef } from 'react';
import type { TimerStep } from '../types/timer';

interface UseTimerProps {
    steps: TimerStep[];
    repetitions: number; // -1 for continuous
    isActive: boolean;
    onComplete?: () => void;
    onCycleComplete?: () => void;
    onStepChange?: (index: number, repetition: number) => void;
}

export const useTimer = ({
    steps,
    repetitions,
    isActive,
    onComplete,
    onCycleComplete,
    onStepChange
}: UseTimerProps) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [currentRepetition, setCurrentRepetition] = useState(1);
    const [timeLeft, setTimeLeft] = useState(steps[0]?.duration || 0);
    const workerRef = useRef<Worker | null>(null);

    // Store callbacks in refs to avoid stale closures and unnecessary effect reruns
    const onCompleteRef = useRef(onComplete);
    const onCycleCompleteRef = useRef(onCycleComplete);
    const onStepChangeRef = useRef(onStepChange);
    onCompleteRef.current = onComplete;
    onCycleCompleteRef.current = onCycleComplete;
    onStepChangeRef.current = onStepChange;

    // Initialize Worker
    useEffect(() => {
        workerRef.current = new Worker(new URL('./timerWorker.ts', import.meta.url), { type: 'module' });

        workerRef.current.onmessage = (e: MessageEvent) => {
            const { type, timeLeft: remaining } = e.data;
            if (type === 'TICK') {
                setTimeLeft(remaining);
            } else if (type === 'COMPLETE') {
                // Force time to 0 to trigger logic effect
                setTimeLeft(0);
            }
        };

        return () => {
            workerRef.current?.terminate();
        };
    }, []);

    // Initialize/Reset when steps change
    useEffect(() => {
        setCurrentStepIndex(0);
        setCurrentRepetition(1);
        const initialDuration = steps[0]?.duration || 0;
        setTimeLeft(initialDuration);

        // If active, restart worker with new duration
        if (isActive && workerRef.current) {
            workerRef.current.postMessage({ action: 'STOP' });
            workerRef.current.postMessage({
                action: 'START',
                payload: { durationInSeconds: initialDuration }
            });
        }
    }, [steps]);

    // Worker Control Effect
    useEffect(() => {
        if (!workerRef.current) return;

        if (isActive) {
            // Start worker with current timeLeft
            workerRef.current.postMessage({
                action: 'START',
                payload: { durationInSeconds: timeLeft }
            });
        } else {
            workerRef.current.postMessage({ action: 'STOP' });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isActive]); // Don't add timeLeft, otherwise loop!

    // Logic Effect - handles transitions when time reaches 0
    useEffect(() => {
        if (timeLeft === 0 && isActive) {
            // Step complete
            if (currentStepIndex < steps.length - 1) {
                // Next step in current rep
                const nextIndex = currentStepIndex + 1;
                const nextDuration = steps[nextIndex]?.duration || 0;
                setCurrentStepIndex(nextIndex);
                setTimeLeft(nextDuration);
                onStepChangeRef.current?.(nextIndex, currentRepetition);

                // Restart worker for next step
                workerRef.current?.postMessage({
                    action: 'START',
                    payload: { durationInSeconds: nextDuration }
                });

            } else {
                // Last step complete, check reps
                if (repetitions === -1 || currentRepetition < repetitions) {
                    // Next repetition
                    const nextRep = currentRepetition + 1;
                    const nextDuration = steps[0]?.duration || 0;
                    setCurrentRepetition(nextRep);
                    setCurrentStepIndex(0);
                    setTimeLeft(nextDuration);
                    onCycleCompleteRef.current?.();
                    onStepChangeRef.current?.(0, nextRep);

                    // Restart worker for next rep
                    workerRef.current?.postMessage({
                        action: 'START',
                        payload: { durationInSeconds: nextDuration }
                    });

                } else {
                    // Timer finished - stop and reset to beginning
                    workerRef.current?.postMessage({ action: 'STOP' });
                    setCurrentStepIndex(0);
                    setCurrentRepetition(1);
                    setTimeLeft(steps[0]?.duration || 0);
                    onCompleteRef.current?.();
                }
            }
        }
    }, [timeLeft, isActive, currentStepIndex, steps, repetitions, currentRepetition]);

    const reset = (shouldRestart = false) => {
        workerRef.current?.postMessage({ action: 'STOP' });
        setCurrentStepIndex(0);
        setCurrentRepetition(1);
        const initialDuration = steps[0]?.duration || 0;
        setTimeLeft(initialDuration);

        // If shouldRestart is true and timer should be active, restart worker
        if (shouldRestart && isActive) {
            workerRef.current?.postMessage({
                action: 'START',
                payload: { durationInSeconds: initialDuration }
            });
        }
    };

    const nextStep = () => {
        // Only move forward within current repetition
        if (currentStepIndex < steps.length - 1) {
            const nextIdx = currentStepIndex + 1;
            const nextDuration = steps[nextIdx].duration;

            setCurrentStepIndex(nextIdx);
            setTimeLeft(nextDuration);
            onStepChangeRef.current?.(nextIdx, currentRepetition);

            if (isActive) {
                workerRef.current?.postMessage({
                    action: 'START',
                    payload: { durationInSeconds: nextDuration }
                });
            }
        }
        // If already at last step, do nothing (stay at last step)
    };

    const prevStep = () => {
        // Only move backward within current repetition
        if (currentStepIndex > 0) {
            const prevIdx = currentStepIndex - 1;
            const prevDuration = steps[prevIdx].duration;

            setCurrentStepIndex(prevIdx);
            setTimeLeft(prevDuration);
            onStepChangeRef.current?.(prevIdx, currentRepetition);

            if (isActive) {
                workerRef.current?.postMessage({
                    action: 'START',
                    payload: { durationInSeconds: prevDuration }
                });
            }
        }
        // If already at first step, do nothing (stay at first step)
    };

    const jumpToStep = (index: number) => {
        if (index < 0 || index >= steps.length) return;

        setCurrentStepIndex(index);
        const newDuration = steps[index].duration;
        setTimeLeft(newDuration);
        onStepChangeRef.current?.(index, currentRepetition);

        if (isActive) {
            workerRef.current?.postMessage({
                action: 'START',
                payload: { durationInSeconds: newDuration }
            });
        }
    };

    return { timeLeft, currentStepIndex, currentRepetition, reset, setTimeLeft, nextStep, prevStep, jumpToStep };
};
