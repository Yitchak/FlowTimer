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
    const timerRef = useRef<number | null>(null);

    // Initialize/Reset when steps change
    useEffect(() => {
        setCurrentStepIndex(0);
        setCurrentRepetition(1);
        setTimeLeft(steps[0]?.duration || 0);
    }, [steps]);

    // Tick Effect - separate from logic to prevent interval churn
    useEffect(() => {
        if (!isActive) return;

        timerRef.current = window.setInterval(() => {
            setTimeLeft((prev) => {
                // If time is up, we don't decrement below 0 here
                // We let the logic effect handle the transition
                if (prev <= 0) return 0;
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) window.clearInterval(timerRef.current);
        };
    }, [isActive]);

    // Logic Effect - handles transitions when time reaches 0
    useEffect(() => {
        if (timeLeft === 0 && isActive) {
            // Step complete
            if (currentStepIndex < steps.length - 1) {
                // Next step in current rep
                const nextIndex = currentStepIndex + 1;
                setCurrentStepIndex(nextIndex);
                setTimeLeft(steps[nextIndex].duration);
                onStepChange?.(nextIndex, currentRepetition);
            } else {
                // Last step complete, check reps
                if (repetitions === -1 || currentRepetition < repetitions) {
                    // Next repetition
                    const nextRep = currentRepetition + 1;
                    setCurrentRepetition(nextRep);
                    setCurrentStepIndex(0);
                    setTimeLeft(steps[0].duration);
                    onCycleComplete?.(); // Trigger cycle complete
                    onStepChange?.(0, nextRep);
                } else {
                    // Timer finished
                    onComplete?.();
                }
            }
        }
    }, [timeLeft, isActive, currentStepIndex, steps, repetitions, currentRepetition, onComplete, onStepChange]);

    const reset = () => {
        setCurrentStepIndex(0);
        setCurrentRepetition(1);
        setTimeLeft(steps[0]?.duration || 0);
    };

    const nextStep = () => {
        if (currentStepIndex < steps.length - 1) {
            const nextIndex = currentStepIndex + 1;
            setCurrentStepIndex(nextIndex);
            setTimeLeft(steps[nextIndex].duration);
            onStepChange?.(nextIndex, currentRepetition);
        } else {
            // Last step
            if (repetitions === -1 || currentRepetition < repetitions) {
                const nextRep = currentRepetition + 1;
                setCurrentRepetition(nextRep);
                setCurrentStepIndex(0);
                setTimeLeft(steps[0].duration);
                onCycleComplete?.();
                onStepChange?.(0, nextRep);
            } else {
                onComplete?.();
            }
        }
    };

    const prevStep = () => {
        if (currentStepIndex > 0) {
            const prevIndex = currentStepIndex - 1;
            setCurrentStepIndex(prevIndex);
            setTimeLeft(steps[prevIndex].duration);
            onStepChange?.(prevIndex, currentRepetition);
        } else if (currentRepetition > 1) {
            // Go to end of previous repetition
            const prevRep = currentRepetition - 1;
            const lastIndex = steps.length - 1;
            setCurrentRepetition(prevRep);
            setCurrentStepIndex(lastIndex);
            setTimeLeft(steps[lastIndex].duration);
            onStepChange?.(lastIndex, prevRep);
        } else {
            // First step of first rep - just reset
            reset();
        }
    };

    return { timeLeft, currentStepIndex, currentRepetition, reset, setTimeLeft, nextStep, prevStep };
};
