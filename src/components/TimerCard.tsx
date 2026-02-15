import React, { useMemo, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Play, Pause, RotateCcw, Edit2, Trash2, Copy, Square, MoreVertical, SkipBack, SkipForward, Infinity, Repeat, XCircle, GripVertical, BookOpen, Volume2, Maximize2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';


import { motion, AnimatePresence, DragControls } from 'framer-motion';
import type { Timer } from '../types/timer';
import { useTimer } from '../hooks/useTimer';
import { toast } from 'sonner';
import { playTimerSound } from '../utils/sound';
import { speak, stop as stopTTS, isSpeaking, isSupported as ttsSupported } from '../utils/tts';
import { Tooltip } from './Tooltip';
import FullscreenTimer from './FullscreenTimer';

interface TimerCardProps {
    timer: Timer;
    isActive?: boolean;
    onStart: (id: string) => void;
    onPause: (id: string) => void;
    onEdit: (timer: Timer) => void;
    onDuplicate: (timer: Timer) => void;
    onDelete: (id: string) => void;
    onRemove?: (id: string) => void;
    dragControls?: DragControls;
    volume?: number;
    showFullscreen?: boolean;
    onFullscreenChange?: (timerId: string | null) => void;
}

const TimerCard: React.FC<TimerCardProps> = ({
    timer,
    volume = 1.0,
    isActive = false,
    onStart,
    onPause,
    onEdit,
    onDuplicate,
    onDelete,
    onRemove,
    dragControls,
    showFullscreen = false,
    onFullscreenChange
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
    const [showInstructions, setShowInstructions] = useState(false);
    const [ttsActive, setTtsActive] = useState(false);
    const [autoTts, setAutoTts] = useState(false);
    // showFullscreen is now controlled by parent via props
    const fullscreenRequestedRef = useRef(false);
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

    // Listen for fullscreenchange events to synchronize state
    useEffect(() => {
        const handleFullscreenChange = () => {
            if (document.fullscreenElement && fullscreenRequestedRef.current) {
                // Successfully entered fullscreen - notify parent
                onFullscreenChange?.(timer.id);
                fullscreenRequestedRef.current = false;
            } else if (!document.fullscreenElement && showFullscreen) {
                // Exited fullscreen - notify parent
                onFullscreenChange?.(null);
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, [showFullscreen, timer.id, onFullscreenChange]);



    const { language } = useLanguage();

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
            playTimerSound('complete', volume);
            stopTTS();
            setTtsActive(false);
            // Always pause when complete, regardless of current isActive state
            onPause(timer.id);
        },
        onCycleComplete: () => {
            playTimerSound('complete', volume);
        },
        onStepChange: (index: number) => {
            playTimerSound('step', volume);
            // Auto TTS on step change
            if (autoTts && timer.steps[index]) {
                const step = timer.steps[index];
                const rawText = step.ttsText || step.instructions;
                if (rawText) {
                    const text = t(rawText) !== rawText ? t(rawText) : rawText;
                    speak(text, language, volume);
                    setTtsActive(true);
                }
            }
        }
    });

    // Stop TTS when timer stops or component unmounts
    useEffect(() => {
        if (!isActive) {
            stopTTS();
            setTtsActive(false);
        }
    }, [isActive]);

    useEffect(() => {
        return () => { stopTTS(); };
    }, []);

    // Helper to resolve text (translation key or plain text)
    const resolveText = (text: string | undefined): string | undefined => {
        if (!text) return undefined;
        const translated = t(text);
        return translated !== text ? translated : text;
    };

    const handleTTS = () => {
        if (isSpeaking()) {
            stopTTS();
            setTtsActive(false);
        } else {
            const step = timer.steps[currentStepIndex];
            const text = resolveText(step?.ttsText) || resolveText(step?.instructions);
            if (text) {
                speak(text, language, volume);
                setTtsActive(true);
            } else {
                toast.info(t('guidance.noInstructions'));
            }
        }
    };

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
        reset(true); // Pass true to restart the worker
        if (!isActive) {
            onStart(timer.id);
        }
    };

    // Calculate readable title color
    const titleColor = timer.color ? darkenColor(timer.color, 15) : 'var(--text)';

    const renderLoopTag = () => {
        if (!timer.repetitions || (timer.repetitions <= 1 && timer.repetitions !== -1)) return null;

        return (
            <span
                key="loop-tag"
                className="tag flex items-center gap-1 flex-shrink-0"
                title={timer.repetitions === -1 ? t('timer.loops') : `${t('timer.repeats')} ${timer.repetitions} ${t('timer.times')}`}
                style={{ marginRight: 0 }}
            >
                {timer.repetitions === -1 ? (
                    <Infinity size={12} />
                ) : (
                    <>
                        <Repeat size={10} />
                        <span>{timer.repetitions}</span>
                    </>
                )}
            </span>
        );
    };

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
                            <h3
                                className="timer-title font-bold leading-[1.05] tracking-tight line-clamp-3"
                                style={{
                                    color: titleColor,
                                    fontSize: 'clamp(24px, 5vw, 38px)',
                                    lineHeight: 1.1
                                }}
                            >
                                {t(timer.name)}
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
                                    {t('timer.preset')}
                                </span>
                            )}

                            {/* Loop Icon */}

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
                            {renderLoopTag()}
                            {timer.tags.map(tag => (
                                <span key={tag} className="tag flex-shrink-0 whitespace-nowrap" style={{ marginRight: '0' }}>
                                    {tag}
                                </span>
                            ))}
                        </div>

                        {/* Stats Removed */}
                        {/* Step Tags Visualization - Horizontal Scroll with Mask */}

                    </div>

                    {/* Right Side: Big Circular Image + Guidance Buttons */}
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
                                src={currentStep?.imageUrl || timer.imageUrl || 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=250&q=80'}
                                alt={currentStep ? t(currentStep.name) : timer.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=250&q=80';
                                }}
                            />
                        </div>

                        {/* Guidance Buttons - below image */}
                        {(currentStep?.instructions || currentStep?.ttsText) && (
                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginTop: '6px' }}>
                                {currentStep?.instructions && (
                                    <Tooltip content={t('guidance.instructions')}>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setShowInstructions(!showInstructions); }}
                                            className="p-1 rounded-full hover:bg-white/10 transition-all"
                                            style={{
                                                color: showInstructions ? (timer.color || 'var(--primary)') : 'var(--text-dim)',
                                                fontSize: '11px'
                                            }}
                                        >
                                            <BookOpen size={14} />
                                        </button>
                                    </Tooltip>
                                )}
                                {ttsSupported() && (currentStep?.ttsText || currentStep?.instructions) && (
                                    <Tooltip content={ttsActive ? t('guidance.stopTTS') : t('guidance.playTTS')}>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleTTS(); }}
                                            className="p-1 rounded-full hover:bg-white/10 transition-all"
                                            style={{
                                                color: ttsActive ? (timer.color || 'var(--primary)') : 'var(--text-dim)',
                                                fontSize: '11px'
                                            }}
                                        >
                                            <Volume2 size={14} />
                                        </button>
                                    </Tooltip>
                                )}
                            </div>
                        )}

                        {/* Drag Handle (if provided) - Absolute top left */}
                        {dragControls && (
                            <div style={{ position: 'absolute', top: '-8px', left: '-12px', zIndex: 30 }}>
                                <Tooltip content={t('actions.dragToReorder') || "Drag to reorder"}>
                                    <div
                                        onPointerDown={(e) => dragControls.start(e)}
                                        // Add touch start for better mobile support if pointer events are iffy
                                        onTouchStart={(e) => dragControls.start(e as any)}
                                        className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-all shadow-md border border-white/10 cursor-grab active:cursor-grabbing"
                                        style={{ touchAction: 'none' }}
                                    >
                                        <GripVertical size={18} />
                                    </div>
                                </Tooltip>
                            </div>
                        )}

                        {/* Menu Button - Absolute top right of the Image area */}
                        <div style={{ position: 'absolute', top: '-6px', right: '-10px', zIndex: 20 }}>
                            <div className="relative" ref={menuRef}>
                                <Tooltip content={t('actions.moreOptions') || "More options"}>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                                        className="p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-all shadow-md border border-white/10"
                                    >
                                        <MoreVertical size={14} />
                                    </button>
                                </Tooltip>

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
                                            title={t('actions.duplicate')}
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
                                            title={t('actions.edit')}
                                        >
                                            <Edit2 size={16} />
                                            <span>{t('actions.edit')}</span>
                                        </button>


                                        {onRemove && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowMenu(false);
                                                    onRemove(timer.id);
                                                }}
                                                className="dropdown-item text-red-400 hover:text-red-500"
                                                title={t('actions.removeFromList')}
                                            >
                                                <XCircle size={16} />
                                                <span>{t('actions.removeFromList')}</span>
                                            </button>
                                        )}

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
                                            title={timer.isPreset ? "Cannot delete built-in presets" : t('actions.delete')}
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
                {/* Instructions Panel */}
                <AnimatePresence>
                    {showInstructions && currentStep?.instructions && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            style={{
                                overflow: 'hidden',
                                marginTop: '8px',
                                padding: '10px 14px',
                                borderRadius: '12px',
                                background: 'rgba(255,255,255,0.05)',
                                border: `1px solid ${timer.color ? `${timer.color}30` : 'rgba(255,255,255,0.1)'}`,
                                fontSize: '13px',
                                lineHeight: 1.6,
                                color: 'var(--text)',
                                whiteSpace: 'pre-wrap'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', opacity: 0.6, fontSize: '11px', fontWeight: 600 }}>
                                <BookOpen size={12} />
                                {t('guidance.instructions')}
                            </div>
                            {resolveText(currentStep.instructions)}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Spacer for mobile */}
            <div className="h-4 md:h-2" />

            {/* Big Timer Display with Inline Action */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '16px',
                    width: '100%'
                }}
            >
                <span className="time-value" style={{ fontSize: 'clamp(40px, 8vw, 60px)', fontWeight: 800, lineHeight: 1 }}>
                    {formatTime(timeLeft)}
                </span>

                {/* Primary Action Button - Play/Pause */}
                {!isActive ? (
                    <Tooltip content={t('actions.start')} position="bottom">
                        <button
                            onClick={(e) => { e.stopPropagation(); onStart(timer.id); }}
                            className="primary-btn flex-shrink-0"
                            aria-label={`${t('actions.start')} ${t(timer.name)}`}
                            style={{
                                backgroundColor: timer.color || undefined,
                                color: timer.color ? getTextColor(timer.color) : undefined,
                                border: 'none',
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 0,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                            }}
                        >
                            <Play size={24} fill="currentColor" className="ml-1" /> {/* ml-1 to visually enter the triangle */}
                        </button>
                    </Tooltip>
                ) : (
                    <Tooltip content={t('actions.pause')} position="bottom">
                        <button
                            onClick={(e) => { e.stopPropagation(); onPause(timer.id); }}
                            className="pause-btn flex-shrink-0"
                            aria-label={`${t('actions.pause')} ${t(timer.name)}`}
                            style={{
                                backgroundColor: timer.color || undefined,
                                color: timer.color ? getTextColor(timer.color) : undefined,
                                border: 'none',
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 0,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                            }}
                        >
                            <Pause size={24} fill="currentColor" />
                        </button>
                    </Tooltip>
                )}

                {/* Fullscreen Button - With Visible Label */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <Tooltip content={t('actions.fullscreen')} position="bottom">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();

                                // Request fullscreen on documentElement (maintains user gesture)
                                if (!document.fullscreenElement) {
                                    fullscreenRequestedRef.current = true;
                                    document.documentElement.requestFullscreen().catch(err => {
                                        console.error('Failed to enter fullscreen:', err);
                                        fullscreenRequestedRef.current = false;
                                    });
                                }
                                // Component will show automatically when fullscreenchange event fires
                            }}
                            className="icon-btn-large flex-shrink-0"
                            aria-label={t('actions.fullscreen')}
                            style={{
                                backgroundColor: `${timer.color || 'var(--primary)'}20`,
                                color: timer.color || 'var(--primary)',
                                border: `1px solid ${timer.color || 'var(--primary)'}40`,
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 0,
                                transition: 'all 0.2s',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                            }}
                        >
                            <Maximize2 size={22} />
                        </button>
                    </Tooltip>
                </div>
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

                <Tooltip content={t('actions.previous')} position="bottom">
                    <button
                        onClick={prevStep}
                        className="stop-btn icon-btn-large"
                        aria-label="Previous Step"
                        style={{ color: 'var(--text-dim)' }}
                    >
                        <SkipBack size={20} />
                    </button>
                </Tooltip>

                <Tooltip content={t('actions.next')} position="bottom">
                    <button
                        onClick={nextStep}
                        className="stop-btn icon-btn-large"
                        aria-label="Next Step"
                    >
                        <SkipForward size={20} />
                    </button>
                </Tooltip>



                <Tooltip content={t('actions.stop')} position="bottom">
                    <button
                        onClick={() => {
                            onPause(timer.id);
                            reset();
                        }}
                        className="stop-btn icon-btn-large"
                        aria-label={`${t('actions.stop')} ${t(timer.name)}`}
                    >
                        <Square size={20} fill="currentColor" />
                    </button>
                </Tooltip>


                <Tooltip content={t('actions.reset')} position="bottom">
                    <button
                        onClick={handleReset}
                        className="reset-btn icon-btn-large"
                        aria-label={`${t('actions.reset')} ${t(timer.name)}`}
                        style={{
                            backgroundColor: timer.color || undefined,
                            color: timer.color ? getTextColor(timer.color) : undefined,
                            borderRadius: '50%',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                        }}
                    >
                        <RotateCcw size={20} />
                    </button>
                </Tooltip>

            </div>

            {/* Auto TTS Toggle - only if any step has instructions */}
            {ttsSupported() && timer.steps.some(s => s.instructions || s.ttsText) && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4px' }}>
                    <button
                        onClick={(e) => { e.stopPropagation(); setAutoTts(!autoTts); }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: 500,
                            background: autoTts ? `${timer.color || 'var(--primary)'}20` : 'rgba(255,255,255,0.05)',
                            color: autoTts ? (timer.color || 'var(--primary)') : 'var(--text-dim)',
                            border: `1px solid ${autoTts ? `${timer.color || 'var(--primary)'}40` : 'rgba(255,255,255,0.1)'}`,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Volume2 size={12} />
                        {t('guidance.autoTTS')}
                    </button>
                </div>
            )}

            {/* Fullscreen Timer - Rendered via Portal to document.body */}
            {showFullscreen && createPortal(
                <FullscreenTimer
                    timer={timer}
                    isActive={isActive}
                    timeLeft={timeLeft}
                    currentStepIndex={currentStepIndex}
                    currentRepetition={currentRepetition}
                    onClose={() => onFullscreenChange?.(null)}
                    onStart={onStart}
                    onPause={onPause}
                    nextStep={nextStep}
                    prevStep={prevStep}
                    reset={reset}
                    volume={volume}
                />,
                document.body
            )}
        </motion.div >
    );
};

export default TimerCard;
