import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Edit2, Trash2, Copy, Square, MoreVertical, SkipBack, SkipForward, Infinity, Repeat } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';


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
    const { t } = useLanguage();
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
    const stepsContainerRef = useRef<HTMLDivElement>(null);

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
        prevStep,
        jumpToStep
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

    // Auto-scroll removed as per user request
    /*
    useEffect(() => {
        if (stepsContainerRef.current) {
            const activeStep = stepsContainerRef.current.querySelector('.step-pill.active');
            if (activeStep) {
                activeStep.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'center'
                });
            }
        }
    }, [currentStepIndex]);
    */

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
            className="timer-card glass-card group flex flex-col h-full"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
                background: timer.color
                    ? `linear-gradient(135deg, ${timer.color}15 0%, rgba(255,255,255,0.05) 100%)`
                    : undefined,
                borderColor: isActive
                    ? (timer.color || 'var(--primary)')
                    : (timer.color ? `${timer.color}30` : undefined),
                boxShadow: isActive
                    ? `0 0 0 2px ${timer.color || 'var(--primary)'}, 0 8px 30px -10px ${timer.color || 'var(--primary)'}50`
                    : undefined,
                zIndex: isActive ? 10 : 1
            }}
        >
            {/* Top Section: Info (Left) + Image (Right) */}
            {/* Info Area - Grid Layout (Force) */}
            <div className="timer-info relative mb-4 flex-grow">
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: '8px', alignItems: 'start' }}>

                    {/* Left Side: Text Content */}
                    <div style={{ minWidth: 0, paddingRight: '0.5rem' }}>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="timer-title text-3xl md:text-4xl font-bold leading-tight line-clamp-2" style={{ color: titleColor }}>
                                {t(timer.name)}
                            </h3>

                            <button
                                onClick={(e) => { e.stopPropagation(); onEdit(timer); }}
                                className="p-1 rounded-full hover:bg-white/10 text-text-dim hover:text-primary transition-colors ml-1"
                                title={t('actions.edit')}
                            >
                                <Edit2 size={14} />
                            </button>
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
                                    {t('timer.preset')}
                                </span>
                            )}

                            {/* Loop Icon */}
                            {(timer.repetitions === -1 || (timer.repetitions && timer.repetitions > 1)) && (
                                <div
                                    className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-white/5 border border-white/10 text-text-dim"
                                    title={timer.repetitions === -1 ? t('timer.loops') : `${t('timer.repeats')} ${timer.repetitions} ${t('timer.times')}`}
                                >
                                    {timer.repetitions === -1 ? (

                                        <Infinity size={12} />
                                    ) : (
                                        <>
                                            <Repeat size={10} />
                                            <span>{timer.repetitions}</span>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        <div
                            className="timer-tags mb-3 flex flex-nowrap overflow-x-auto gap-2 no-scrollbar"
                            style={{
                                msOverflowStyle: 'none',
                                scrollbarWidth: 'none',
                                WebkitOverflowScrolling: 'touch',
                                display: 'flex',
                                flexWrap: 'nowrap',
                                gap: '8px', /* Standard gap */
                                marginBottom: '8px', /* Standard spacing */
                                paddingBottom: '2px'
                            }}
                        >
                            <style>{`
                                .timer-tags::-webkit-scrollbar { display: none; }
                            `}</style>
                            {timer.tags.map(tag => (
                                <span key={tag} className="tag flex-shrink-0 whitespace-nowrap" style={{ marginRight: '0' }}>
                                    {tag}
                                </span>
                            ))}
                        </div>

                        {/* Stats Removed */}
                        {/* Step Tags Visualization - Horizontal Scroll with Mask */}

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
                                            <span>{t('actions.duplicate')}</span>
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
                                            <span>{t('actions.edit')}</span>
                                        </button>


                                        <div className="dropdown-divider"></div>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowMenu(false);
                                                if (timer.isPreset) {
                                                    toast.error("Cannot delete built-in presets");
                                                } else {
                                                    onDelete(timer.id);
                                                }

                                            }}
                                            className={`dropdown-item ${timer.isPreset ? 'opacity-50 cursor-not-allowed hover:bg-transparent hover:text-text-dim' : ''}`}
                                            style={{ color: timer.isPreset ? 'inherit' : '#ef4444' }}
                                        >
                                            <Trash2 size={16} />
                                            <span>{t('actions.delete')}</span>
                                        </button>

                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Steps Section - Moved below grid for Full Width */}
                {timer.steps.length > 0 && (
                    <div className="relative mt-2 mb-1" style={{ marginTop: '12px' }}>
                        <div
                            ref={stepsContainerRef}
                            className="steps-scroll-container flex flex-wrap gap-2 pb-2"
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '8px',
                                paddingBottom: '4px'
                            }}
                        >
                            {timer.steps.map((step, idx) => {
                                const highlight = idx === currentStepIndex;
                                const bgCol = step.color || timer.color || '#6366f1';
                                const isHex = (typeof bgCol === 'string' && bgCol.startsWith('#'));
                                const txtCol = (highlight && isHex) ? getTextColor(bgCol) : '#ffffff';

                                return (
                                    <button
                                        key={idx}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            jumpToStep(idx);
                                        }}
                                        className={`step-pill flex-shrink-0 ${highlight ? 'active' : ''} cursor-pointer hover:scale-105 transition-transform`}
                                        style={{
                                            backgroundColor: highlight
                                                ? (timer.color || 'var(--primary)')
                                                : 'rgba(255,255,255,0.05)',
                                            color: highlight
                                                ? txtCol
                                                : 'var(--text-dim)',
                                            borderColor: highlight
                                                ? 'transparent'
                                                : 'rgba(255,255,255,0.15)',
                                            opacity: highlight ? 1 : 0.7,
                                            borderWidth: '1px',
                                            borderStyle: 'solid',
                                            borderRadius: '9999px',
                                            padding: '6px 14px', /* Larger touch area */
                                            fontSize: '12px', /* Slightly larger font */
                                            fontWeight: highlight ? 'bold' : 'normal',
                                            whiteSpace: 'nowrap'
                                        }}
                                        title={`${t(step.name)} (${step.duration}s) - Click to jump`}
                                    >
                                        {t(step.name)}
                                    </button>
                                );
                            })}
                        </div>
                        {/* Fade Mask Indicator */}
                        <div className="absolute right-0 top-0 bottom-1 w-8 pointer-events-none bg-gradient-to-l from-black/10 to-transparent rounded-r-full" />
                    </div>
                )}
            </div>

            {/* Spacer for mobile */}
            <div className="h-4 md:h-2" />

            {/* Big Timer Display */}
            <div className="timer-display">
                <span className="time-value">
                    {formatTime(timeLeft)}
                </span>
                <span className="time-label">{t('timer.remaining')}</span>
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
            <div className="timer-controls flex items-center justify-center gap-1 md:gap-2">

                <button
                    onClick={prevStep}
                    className="stop-btn icon-btn-large"
                    aria-label="Previous Step"
                    title={t('actions.previous')}
                    style={{ color: 'var(--text-dim)' }}

                >
                    <SkipBack size={20} />
                </button>

                {!isActive ? (
                    <button
                        onClick={() => onStart(timer.id)}
                        className="primary-btn control-btn-main"
                        aria-label={`${t('actions.start')} ${t(timer.name)}`}
                        style={{

                            backgroundColor: timer.color || undefined,
                            color: timer.color ? getTextColor(timer.color) : undefined,
                            border: 'none',
                            flex: 1, // Make it main
                            maxWidth: '120px'
                        }}
                    >
                        <Play size={20} fill="currentColor" />
                        <span>{t('actions.start')}</span>
                    </button>

                ) : (
                    <button
                        onClick={() => onPause(timer.id)}
                        className="pause-btn control-btn-main"
                        aria-label={`${t('actions.pause')} ${t(timer.name)}`}
                        style={{

                            backgroundColor: timer.color || undefined,
                            color: timer.color ? getTextColor(timer.color) : undefined,
                            border: 'none',
                            flex: 1,
                            maxWidth: '120px'
                        }}
                    >
                        <Pause size={20} fill="currentColor" />
                        <span>{t('actions.pause')}</span>
                    </button>

                )}

                <button
                    onClick={nextStep}
                    className="stop-btn icon-btn-large"
                    aria-label="Next Step"
                    title={t('actions.next')}
                >

                    <SkipForward size={20} />
                </button>



                <button
                    onClick={() => {
                        onPause(timer.id);
                        reset();
                    }}
                    className="stop-btn icon-btn-large"
                    aria-label={`${t('actions.stop')} ${t(timer.name)}`}
                    title={t('actions.stop')}
                >

                    <Square size={20} fill="currentColor" />
                </button>


                <button
                    onClick={handleReset}
                    className="reset-btn icon-btn-large"
                    aria-label={`${t('actions.reset')} ${t(timer.name)}`}
                    title={t('actions.reset')}
                >

                    <RotateCcw size={20} />
                </button>

            </div>
        </motion.div>
    );
};

export default TimerCard;
