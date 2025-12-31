import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Edit2, Trash2, Copy, Square, MoreVertical } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Timer } from '../types/timer';
import { useTimer } from '../hooks/useTimer';
import { toast } from 'sonner';

interface TimerCardProps {
    timer: Timer;
    isActive?: boolean;
    onStart: (id: string) => void;
    onPause: (id: string) => void;
    onEdit: (timer: Timer) => void;
    onDuplicate: (timer: Timer) => void;
    onDelete: (id: string) => void;
}

const TimerCard: React.FC<TimerCardProps> = ({
    timer,
    isActive = false,
    onStart,
    onPause,
    onEdit,
    onDuplicate,
    onDelete
}) => {
    // Helper for contrast text color
    const getTextColor = (hexColor: string) => {
        const r = parseInt(hexColor.substr(1, 2), 16);
        const g = parseInt(hexColor.substr(3, 2), 16);
        const b = parseInt(hexColor.substr(5, 2), 16);
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (yiq >= 128) ? '#000000' : '#ffffff';
    };

    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };

        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMenu]);

    const {
        timeLeft,
        currentStepIndex,
        currentRepetition,
        reset
    } = useTimer({
        steps: timer.steps,
        repetitions: timer.repetitions,
        isActive,
        onComplete: () => onPause(timer.id)
    });

    // ... (keep useMemos same, just shorthand here for clarity in tool call if needed, but I'll replace the full component start to be safe)
    const totalDuration = useMemo(() => {
        const cycleTime = timer.steps.reduce((acc, step) => acc + step.duration, 0);
        return timer.repetitions === -1 ? cycleTime : cycleTime * timer.repetitions;
    }, [timer]);

    const currentStep = timer.steps[currentStepIndex];

    const progress = useMemo(() => {
        const cycleTime = timer.steps.reduce((acc, step) => acc + step.duration, 0);
        const completedCycles = (currentRepetition - 1) * cycleTime;
        const completedStepsInCurrentCycle = timer.steps
            .slice(0, currentStepIndex)
            .reduce((acc, step) => acc + step.duration, 0);
        const elapsedInCurrentStep = currentStep.duration - timeLeft;

        const totalElapsed = completedCycles + completedStepsInCurrentCycle + elapsedInCurrentStep;
        return timer.repetitions === -1 ? (totalElapsed % cycleTime) / cycleTime : totalElapsed / totalDuration;
    }, [currentStepIndex, currentRepetition, timeLeft, timer, totalDuration]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleReset = () => {
        reset();
        onStart(timer.id);
    };

    return (
        <motion.div
            className="timer-card glass-card group"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
                background: timer.color
                    ? `linear-gradient(135deg, ${timer.color}15 0%, rgba(255,255,255,0.05) 100%)`
                    : undefined,
                borderColor: timer.color ? `${timer.color}30` : undefined
            }}
        >
            {/* Info Area */}
            <div className="timer-info">
                <div className="timer-header">
                    <div className="flex flex-col gap-1 w-full pr-8">
                        <div className="flex items-center gap-2">
                            <h3 className="timer-title" style={{ color: timer.color || 'var(--text)' }}>
                                {timer.name}
                            </h3>
                            {timer.isPreset && (
                                <span
                                    className="px-1.5 py-0.5 rounded text-[9px] uppercase font-black tracking-tighter"
                                    style={{
                                        backgroundColor: timer.color ? `${timer.color}20` : 'rgba(var(--primary-rgb), 0.2)',
                                        borderColor: timer.color ? `${timer.color}40` : 'rgba(var(--primary-rgb), 0.3)',
                                        borderWidth: '1px',
                                        color: timer.color || 'var(--primary)'
                                    }}
                                >
                                    Preset
                                </span>
                            )}
                        </div>
                        <div className="timer-tags">
                            {timer.tags.map(tag => (
                                <span key={tag} className="tag">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* 3-Dot Menu - Absolute Positioned */}
                    <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 20 }}>
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                                className="p-1.5 rounded-full hover:bg-white/10 text-text-dim hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <MoreVertical size={20} />
                            </button>

                            {showMenu && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className="dropdown-menu"
                                    style={{ width: '160px' }} // Slightly smaller than global
                                >
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDuplicate(timer); setShowMenu(false); }}
                                        className="dropdown-item"
                                    >
                                        <Copy size={16} />
                                        <span>Duplicate</span>
                                    </button>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowMenu(false);
                                            onEdit(timer);
                                        }}
                                        className="dropdown-item"
                                    >
                                        <Edit2 size={16} />
                                        <span>Edit</span>
                                    </button>

                                    <div className="dropdown-divider"></div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowMenu(false);
                                            if (timer.isPreset) {
                                                toast.info("Cannot delete built-in presets.");
                                            } else {
                                                onDelete(timer.id);
                                            }
                                        }}
                                        className={`dropdown-item ${timer.isPreset ? 'opacity-50 cursor-not-allowed hover:bg-transparent hover:text-text-dim' : ''}`}
                                        style={{ color: timer.isPreset ? 'inherit' : '#ef4444' }} // Only red if deletable
                                    >
                                        <Trash2 size={16} />
                                        <span>Delete</span>
                                    </button>


                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="text-xs font-bold text-text-dim uppercase tracking-widest pt-4 flex items-center justify-between">
                    <span>{currentStep.name}</span>
                    <span>Step {currentStepIndex + 1}/{timer.steps.length}
                        {timer.repetitions !== 1 && ` • Rep ${currentRepetition}${timer.repetitions === -1 ? '/∞' : '/' + timer.repetitions}`}</span>
                </div>
            </div>

            {/* Big Timer Display */}
            <div className="timer-display">
                <span className="time-value">
                    {formatTime(timeLeft)}
                </span>
                <span className="time-label">Remaining</span>
            </div>

            {/* Progress Bar */}
            <div className="progress-container">
                <motion.div
                    className="progress-bar"
                    animate={{ width: `${progress * 100}%` }}
                    transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
                />
            </div>

            {/* Controls */}
            <div className="timer-controls">
                {!isActive ? (
                    <button
                        onClick={() => onStart(timer.id)}
                        className="primary-btn control-btn-main"
                        aria-label={`Start ${timer.name}`}
                        style={{
                            backgroundColor: timer.color || undefined,
                            color: timer.color ? getTextColor(timer.color) : undefined,
                            border: 'none'
                        }}
                    >
                        <Play size={20} fill="currentColor" />
                        <span>Start</span>
                    </button>
                ) : (
                    <button
                        onClick={() => onPause(timer.id)}
                        className="pause-btn control-btn-main"
                        aria-label={`Pause ${timer.name}`}
                        style={{
                            backgroundColor: timer.color || undefined,
                            color: timer.color ? getTextColor(timer.color) : undefined,
                            border: 'none'
                        }}
                    >
                        <Pause size={20} fill="currentColor" />
                        <span>Pause</span>
                    </button>
                )}

                <button
                    onClick={() => {
                        onPause(timer.id);
                        reset();
                    }}
                    className="stop-btn icon-btn-large"
                    aria-label={`Stop ${timer.name}`}
                    title="Stop"
                >
                    <Square size={20} fill="currentColor" />
                </button>

                <button
                    onClick={handleReset}
                    className="reset-btn icon-btn-large"
                    aria-label={`Reset ${timer.name}`}
                    title="Restart"
                >
                    <RotateCcw size={20} />
                </button>
            </div>
        </motion.div>
    );
};

export default TimerCard;
