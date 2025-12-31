import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Edit2, Trash2, Copy, Square, MoreVertical, SkipBack, SkipForward } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Timer } from '../types/timer';
import { useTimer } from '../hooks/useTimer';
import { toast } from 'sonner';
import { playTimerSound } from '../utils/sound';

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

    // Helper to darken color for better visibility (for Title)
    const darkenColor = (hex: string | undefined, percent: number) => {
        if (!hex) return 'var(--text)';
        let r = parseInt(hex.substring(1, 3), 16);
        let g = parseInt(hex.substring(3, 5), 16);
        let b = parseInt(hex.substring(5, 7), 16);

        r = Math.floor(r * (100 - percent) / 100);
        g = Math.floor(g * (100 - percent) / 100);
        b = Math.floor(b * (100 - percent) / 100);

        r = (r < 255) ? r : 255;
        g = (g < 255) ? g : 255;
        b = (b < 255) ? b : 255;

        // Ensure we handle single digit hex
        const rr = ((r.toString(16).length === 1) ? "0" + r.toString(16) : r.toString(16));
        const gg = ((g.toString(16).length === 1) ? "0" + g.toString(16) : g.toString(16));
        const bb = ((b.toString(16).length === 1) ? "0" + b.toString(16) : b.toString(16));

        return "#" + rr + gg + bb;
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
        reset,
        nextStep,
        prevStep
    } = useTimer({
        steps: timer.steps,
        repetitions: timer.repetitions ?? 1,
        isActive,
        onComplete: () => {
            playTimerSound('complete');
            if (isActive) onPause(timer.id);
        },
        onCycleComplete: () => {
            playTimerSound('complete');
        },
        onStepChange: () => {
            playTimerSound('step');
        }
    });

    const totalDuration = useMemo(() => {
        const cycleTime = timer.steps.reduce((acc, step) => acc + step.duration, 0);
        return timer.repetitions === -1 ? cycleTime : cycleTime * (timer.repetitions || 1);
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
    }, [currentStepIndex, currentRepetition, timeLeft, timer, totalDuration, currentStep]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleReset = () => {
        reset();
        onStart(timer.id);
    };

    // Calculate readable title color
    const titleColor = timer.color ? darkenColor(timer.color, 15) : 'var(--text)';

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
            {/* Top Section: Info (Left) + Image (Right) */}
            {/* Info Area - Grid Layout (Force) */}
            <div className="timer-info relative mb-4">
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: '16px', alignItems: 'start' }}>

                    {/* Left Side: Text Content */}
                    <div style={{ minWidth: 0, paddingRight: '0.5rem' }}>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="timer-title text-xl font-bold leading-tight" style={{ color: titleColor }}>
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

                        <div className="timer-tags mb-3">
                            {timer.tags.map(tag => (
                                <span key={tag} className="tag">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <div className="text-xs font-bold text-text-dim uppercase tracking-widest flex flex-col gap-0.5">
                            <span className="opacity-80">{currentStep.name}</span>
                            <span className="text-[10px] opacity-60">Step {currentStepIndex + 1}/{timer.steps.length}
                                {timer.repetitions !== 1 && ` • Rep ${currentRepetition}${timer.repetitions === -1 ? '/∞' : '/' + timer.repetitions}`}</span>
                        </div>
                    </div>

                    {/* Right Side: Big Circular Image */}
                    <div style={{ position: 'relative' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            border: '3px solid rgba(255,255,255,0.08)',
                            background: 'rgba(255,255,255,0.05)',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                        }}>
                            <img
                                src={timer.imageUrl || 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=250&q=80'}
                                alt={timer.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=250&q=80';
                                }}
                            />
                        </div>

                        {/* Menu Button - Absolute top right of the Image area */}
                        <div style={{ position: 'absolute', top: '-6px', right: '-10px', zIndex: 20 }}>
                            <div className="relative" ref={menuRef}>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                                    className="p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-all shadow-md border border-white/10"
                                >
                                    <MoreVertical size={14} />
                                </button>

                                {showMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        className="dropdown-menu"
                                        style={{ width: '160px', right: 0 }}
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
                                            style={{ color: timer.isPreset ? 'inherit' : '#ef4444' }}
                                        >
                                            <Trash2 size={16} />
                                            <span>Delete</span>
                                        </button>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </div>
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
            <div className="timer-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>

                <button
                    onClick={prevStep}
                    className="stop-btn icon-btn-large"
                    aria-label="Previous Step"
                    title="Previous"
                    style={{ color: 'var(--text-dim)' }}
                >
                    <SkipBack size={20} />
                </button>

                {!isActive ? (
                    <button
                        onClick={() => onStart(timer.id)}
                        className="primary-btn control-btn-main"
                        aria-label={`Start ${timer.name}`}
                        style={{
                            backgroundColor: timer.color || undefined,
                            color: timer.color ? getTextColor(timer.color) : undefined,
                            border: 'none',
                            flex: 1, // Make it main
                            maxWidth: '120px'
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
                            border: 'none',
                            flex: 1,
                            maxWidth: '120px'
                        }}
                    >
                        <Pause size={20} fill="currentColor" />
                        <span>Pause</span>
                    </button>
                )}

                <button
                    onClick={nextStep}
                    className="stop-btn icon-btn-large"
                    aria-label="Next Step"
                    title="Next"
                >
                    <SkipForward size={20} />
                </button>

                <div style={{ width: '1px', height: '20px', background: 'var(--text-dim)', opacity: 0.2, margin: '0 4px' }}></div>

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
