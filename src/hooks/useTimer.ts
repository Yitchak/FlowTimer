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
                setCurrentStepIndex(nextIndex);
                const nextDuration = steps[nextIndex].duration;
                setTimeLeft(nextDuration);
                onStepChange?.(nextIndex, currentRepetition);

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
                    setCurrentRepetition(nextRep);
                    setCurrentStepIndex(0);
                    const nextDuration = steps[0].duration;
                    setTimeLeft(nextDuration);
                    onCycleComplete?.();
                    onStepChange?.(0, nextRep);

                    // Restart worker for next rep
                    workerRef.current?.postMessage({
                        action: 'START',
                        payload: { durationInSeconds: nextDuration }
                    });

                } else {
                    // Timer finished
                    workerRef.current?.postMessage({ action: 'STOP' });
                    onComplete?.();
                }
            }
        }
    }, [timeLeft, isActive, currentStepIndex, steps, repetitions, currentRepetition, onComplete, onCycleComplete, onStepChange]);

    const reset = () => {
        workerRef.current?.postMessage({ action: 'STOP' });
        setCurrentStepIndex(0);
        setCurrentRepetition(1);
        setTimeLeft(steps[0]?.duration || 0);
    };

    const nextStep = () => {
        // Logic to move indices...
        let nextIdx = currentStepIndex;
        let nextRep = currentRepetition;
        let nextDuration = 0;
        let shouldContinue = true;

        if (currentStepIndex < steps.length - 1) {
            nextIdx = currentStepIndex + 1;
            nextDuration = steps[nextIdx].duration;
            onStepChange?.(nextIdx, currentRepetition);
        } else {
            // Last step
            if (repetitions === -1 || currentRepetition < repetitions) {
                nextRep = currentRepetition + 1;
                nextIdx = 0;
                nextDuration = steps[0].duration;
                onCycleComplete?.();
                onStepChange?.(0, nextRep);
            } else {
                onComplete?.();
                shouldContinue = false;
            }
        }

        if (shouldContinue) {
            setCurrentStepIndex(nextIdx);
            setCurrentRepetition(nextRep);
            setTimeLeft(nextDuration);
            if (isActive) {
                workerRef.current?.postMessage({
                    action: 'START',
                    payload: { durationInSeconds: nextDuration }
                });
            }
        }
    };

    const prevStep = () => {
        let prevIdx = currentStepIndex;
        let prevRep = currentRepetition;

        if (currentStepIndex > 0) {
            prevIdx = currentStepIndex - 1;
        } else if (currentRepetition > 1) {
            prevRep = currentRepetition - 1;
            prevIdx = steps.length - 1;
        } else {
            // Start
            reset();
            return;
        }

        const prevDuration = steps[prevIdx].duration;
        setCurrentStepIndex(prevIdx);
        setCurrentRepetition(prevRep);
        setTimeLeft(prevDuration);
        onStepChange?.(prevIdx, prevRep);

        if (isActive) {
            workerRef.current?.postMessage({
                action: 'START',
                payload: { durationInSeconds: prevDuration }
            });
        }
    };

    const jumpToStep = (index: number) => {
        if (index < 0 || index >= steps.length) return;

        setCurrentStepIndex(index);
        const newDuration = steps[index].duration;
        setTimeLeft(newDuration);
        onStepChange?.(index, currentRepetition);

        if (isActive) {
            workerRef.current?.postMessage({
                action: 'START',
                payload: { durationInSeconds: newDuration }
            });
        }
    };

    return { timeLeft, currentStepIndex, currentRepetition, reset, setTimeLeft, nextStep, prevStep, jumpToStep };
};
