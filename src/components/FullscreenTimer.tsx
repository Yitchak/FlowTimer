import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Play, Pause, SkipForward, SkipBack, RotateCcw, Square } from 'lucide-react';
import type { Timer } from '../types/timer';
import { useLanguage } from '../contexts/LanguageContext';
import { speak, stop as stopTTS } from '../utils/tts';

interface FullscreenTimerProps {
    timer: Timer;
    isActive: boolean;
    timeLeft: number;
    currentStepIndex: number;
    currentRepetition: number;
    onClose: () => void;
    onStart: (id: string) => void;
    onPause: (id: string) => void;
    nextStep: () => void;
    prevStep: () => void;
    reset: () => void;
    volume: number;
    jumpToStep?: (index: number) => void;
}

const FullscreenTimer: React.FC<FullscreenTimerProps> = ({
    timer,
    isActive,
    timeLeft,
    currentStepIndex,
    currentRepetition,
    onClose,
    onStart,
    onPause,
    nextStep,
    prevStep,
    reset,
    volume,
    jumpToStep
}) => {
    const { t, language } = useLanguage();
    const currentStep = timer.steps[currentStepIndex];
    const activeStepRef = useRef<HTMLButtonElement>(null);

    // Helper to resolve text
    const resolveText = (text: string | undefined): string | undefined => {
        if (!text) return undefined;
        const translated = t(text);
        return translated !== text ? translated : text;
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopTTS();
        };
    }, []);

    // Auto TTS on step change
    useEffect(() => {
        if (isActive && currentStep) {
            const rawText = currentStep.ttsText || currentStep.instructions;
            if (rawText) {
                const text = resolveText(rawText);
                if (text) {
                    const timeout = setTimeout(() => {
                        speak(text, language, volume);
                    }, 300);
                    return () => clearTimeout(timeout);
                }
            }
        }
    }, [currentStepIndex, isActive]);

    // ESC key listener
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // Format time
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Get step color
    const getStepColor = (step: typeof currentStep): string => {
        if (step.type === 'inhale') return '#3b82f6';
        if (step.type === 'exhale') return '#8b5cf6';
        if (step.type === 'hold') return '#10b981';
        return '#06b6d4';
    };

    const stepColor = getStepColor(currentStep);

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 999999,
                background: '#000000',
                backgroundColor: 'rgb(0, 0, 0)',
                opacity: 1,
                display: 'flex',
                flexDirection: 'column',
                fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
        >
            {/* Background blur */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `url(${currentStep?.imageUrl || timer.imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'blur(40px) brightness(0.3)',
                    transform: 'scale(1.1)',
                    opacity: 0.6
                }}
            />

            {/* Close Button */}
            <button
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: 'clamp(12px, 3vw, 20px)',
                    right: 'clamp(12px, 3vw, 20px)',
                    background: 'rgba(0, 0, 0, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '50%',
                    width: 'clamp(40px, 8vw, 48px)',
                    height: 'clamp(40px, 8vw, 48px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#fff',
                    zIndex: 10,
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)';
                    e.currentTarget.style.transform = 'scale(1)';
                }}
                aria-label={t('actions.exitFullscreen')}
            >
                <X size={window.innerWidth < 640 ? 20 : 24} />
            </button>

            {/* Content Container */}
            <div style={{
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                height: '100%',
                overflow: 'hidden'
            }}>
                {/* Large Image Section */}
                <motion.div
                    key={`image-${currentStepIndex}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    style={{
                        position: 'relative',
                        width: '100%',
                        height: 'clamp(280px, 45vh, 600px)',
                        flexShrink: 0,
                        overflow: 'hidden'
                    }}
                >
                    <img
                        src={currentStep?.imageUrl || timer.imageUrl || 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=1200&q=80'}
                        alt={t(currentStep?.name || timer.name)}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }}
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=1200&q=80';
                        }}
                    />
                    {/* Gradient overlay */}
                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '50%',
                        background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.7))',
                        pointerEvents: 'none'
                    }} />
                </motion.div>

                {/* Middle Section: Content */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: 'clamp(16px, 4vh, 40px)',
                    paddingBottom: 'clamp(80px, 15vh, 140px)',
                    gap: 'clamp(16px, 3vh, 32px)',
                    overflow: 'auto'
                }}>
                    {/* Timer Name & Current Step */}
                    <motion.div
                        key={`title-${currentStepIndex}`}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            textAlign: 'center',
                            color: '#fff'
                        }}
                    >
                        <h1 style={{
                            fontSize: 'clamp(20px, 4vw, 36px)',
                            fontWeight: 700,
                            marginBottom: '8px',
                            color: stepColor,
                            textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                            lineHeight: 1.2
                        }}>
                            {t(timer.name)}
                        </h1>
                        <h2 style={{
                            fontSize: 'clamp(16px, 3vw, 24px)',
                            fontWeight: 500,
                            opacity: 0.9,
                            textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                            lineHeight: 1.3
                        }}>
                            {t(currentStep.name)}
                        </h2>
                    </motion.div>

                    {/* Steps Timeline */}
                    {timer.steps && timer.steps.length > 1 && (
                        <div style={{
                            width: '100%',
                            maxWidth: '900px',
                            padding: '0 clamp(16px, 4vw, 32px)'
                        }}>
                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 'clamp(8px, 2vw, 12px)',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                {timer.steps.map((step, index) => {
                                    const isActive = index === currentStepIndex;
                                    const isPast = index < currentStepIndex;
                                    const stepCol = getStepColor(step);

                                    return (
                                        <button
                                            ref={isActive ? activeStepRef : null}
                                            key={index}
                                            onClick={() => {
                                                jumpToStep?.(index);
                                            }}
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '8px',
                                                padding: 'clamp(8px, 2vw, 12px)',
                                                background: isActive
                                                    ? `${stepCol}40`
                                                    : isPast
                                                        ? 'rgba(255,255,255,0.1)'
                                                        : 'rgba(255,255,255,0.05)',
                                                border: isActive
                                                    ? `2px solid ${stepCol}`
                                                    : '2px solid rgba(255,255,255,0.1)',
                                                borderRadius: '12px',
                                                cursor: 'pointer',
                                                minWidth: 'clamp(60px, 15vw, 100px)',
                                                transition: 'all 0.2s',
                                                color: '#fff',
                                                opacity: isActive ? 1 : isPast ? 0.7 : 0.5,
                                                flexShrink: 0
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.background = isActive ? `${stepCol}60` : 'rgba(255,255,255,0.15)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.background = isActive
                                                    ? `${stepCol}40`
                                                    : isPast
                                                        ? 'rgba(255,255,255,0.1)'
                                                        : 'rgba(255,255,255,0.05)';
                                            }}
                                        >
                                            <div style={{
                                                width: 'clamp(24px, 6vw, 32px)',
                                                height: 'clamp(24px, 6vw, 32px)',
                                                borderRadius: '50%',
                                                background: isActive
                                                    ? stepCol
                                                    : isPast
                                                        ? 'rgba(255,255,255,0.3)'
                                                        : 'rgba(255,255,255,0.1)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: 'clamp(10px, 2.5vw, 14px)',
                                                fontWeight: 700
                                            }}>
                                                {index + 1}
                                            </div>
                                            <span style={{
                                                fontSize: 'clamp(9px, 2vw, 12px)',
                                                fontWeight: isActive ? 600 : 500,
                                                textAlign: 'center',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                maxWidth: '100%',
                                                textShadow: '0 1px 3px rgba(0,0,0,0.5)'
                                            }}>
                                                {t(step.name).split(' ').slice(0, 2).join(' ')}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Timer Display */}
                    <motion.div
                        key={`time-${Math.floor(timeLeft / 5)}`}
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        style={{
                            fontSize: 'clamp(60px, 12vw, 120px)',
                            fontWeight: 900,
                            color: stepColor,
                            textShadow: `0 4px 20px ${stepColor}60, 0 0 40px ${stepColor}40`,
                            letterSpacing: '-0.02em',
                            fontVariantNumeric: 'tabular-nums',
                            lineHeight: 1
                        }}
                    >
                        {formatTime(timeLeft)}
                    </motion.div>

                    {/* Repetitions */}
                    {timer.repetitions !== -1 && timer.repetitions > 1 && (
                        <p style={{
                            fontSize: 'clamp(12px, 2.5vw, 16px)',
                            opacity: 0.7,
                            color: '#fff',
                            textShadow: '0 1px 3px rgba(0,0,0,0.5)'
                        }}>
                            {t('timer.repeats')} {currentRepetition} / {timer.repetitions}
                        </p>
                    )}

                    {/* Instructions */}
                    {currentStep?.instructions && (
                        <motion.div
                            key={`instructions-${currentStepIndex}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            style={{
                                maxWidth: '600px',
                                textAlign: 'center',
                                fontSize: 'clamp(13px, 2.5vw, 16px)',
                                color: 'rgba(255,255,255,0.8)',
                                lineHeight: 1.6,
                                padding: '0 16px'
                            }}
                        >
                            {resolveText(currentStep.instructions)}
                        </motion.div>
                    )}
                </div>

                {/* Bottom Controls */}
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 'clamp(12px, 3vw, 24px)',
                    padding: 'clamp(16px, 4vh, 32px)',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                    zIndex: 2
                }}>
                    {/* Previous */}
                    <button
                        onClick={prevStep}
                        style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '50%',
                            width: 'clamp(40px, 8vw, 56px)',
                            height: 'clamp(40px, 8vw, 56px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: '#fff',
                            transition: 'all 0.2s',
                            backdropFilter: 'blur(10px)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                            e.currentTarget.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                            e.currentTarget.style.transform = 'scale(1)';
                        }}
                    >
                        <SkipBack size={window.innerWidth < 640 ? 18 : 24} />
                    </button>

                    {/* Play/Pause */}
                    <button
                        onClick={() => isActive ? onPause(timer.id) : onStart(timer.id)}
                        style={{
                            background: `${stepColor}`,
                            border: `2px solid ${stepColor}`,
                            borderRadius: '50%',
                            width: 'clamp(56px, 12vw, 72px)',
                            height: 'clamp(56px, 12vw, 72px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: '#fff',
                            transition: 'all 0.2s',
                            boxShadow: `0 4px 12px ${stepColor}60`
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.1)';
                            e.currentTarget.style.boxShadow = `0 6px 16px ${stepColor}80`;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = `0 4px 12px ${stepColor}60`;
                        }}
                    >
                        {isActive ?
                            <Pause size={window.innerWidth < 640 ? 24 : 32} fill="currentColor" /> :
                            <Play size={window.innerWidth < 640 ? 24 : 32} fill="currentColor" style={{ marginLeft: '4px' }} />
                        }
                    </button>

                    {/* Next */}
                    <button
                        onClick={nextStep}
                        style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '50%',
                            width: 'clamp(40px, 8vw, 56px)',
                            height: 'clamp(40px, 8vw, 56px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: '#fff',
                            transition: 'all 0.2s',
                            backdropFilter: 'blur(10px)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                            e.currentTarget.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                            e.currentTarget.style.transform = 'scale(1)';
                        }}
                    >
                        <SkipForward size={window.innerWidth < 640 ? 18 : 24} />
                    </button>

                    {/* Reset */}
                    <button
                        onClick={() => {
                            reset();
                            onStart(timer.id);
                        }}
                        style={{
                            background: `${stepColor}40`,
                            border: `1px solid ${stepColor}60`,
                            borderRadius: '50%',
                            width: 'clamp(40px, 8vw, 56px)',
                            height: 'clamp(40px, 8vw, 56px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: stepColor,
                            transition: 'all 0.2s',
                            backdropFilter: 'blur(10px)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = `${stepColor}60`;
                            e.currentTarget.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = `${stepColor}40`;
                            e.currentTarget.style.transform = 'scale(1)';
                        }}
                    >
                        <RotateCcw size={window.innerWidth < 640 ? 18 : 22} />
                    </button>

                    {/* Stop - ביטול כי לא נדרש */}
                </div>
            </div>
        </div>
    );
};

export default FullscreenTimer;
