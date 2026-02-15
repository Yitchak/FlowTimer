import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    volume
}) => {
    const { t, language } = useLanguage();
    const currentStep = timer.steps[currentStepIndex];
    const containerRef = useRef<HTMLDivElement>(null);

    // Helper to resolve text (translation key or plain text)
    const resolveText = (text: string | undefined): string | undefined => {
        if (!text) return undefined;
        const translated = t(text);
        return translated !== text ? translated : text;
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            // Just stop TTS - parent TimerCard handles fullscreen exit via event listener
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
                    // Small delay to ensure smooth transition
                    const timeout = setTimeout(() => {
                        speak(text, language, volume);
                    }, 300);
                    return () => clearTimeout(timeout);
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentStepIndex, isActive]);

    // ESC key and fullscreen change listener
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        const handleFullscreenChange = () => {
            // If user manually exits fullscreen (e.g., pressing Esc), close the component
            if (!document.fullscreenElement) {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEsc);

        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getTextColor = (hexColor: string) => {
        const r = parseInt(hexColor.substr(1, 2), 16);
        const g = parseInt(hexColor.substr(3, 2), 16);
        const b = parseInt(hexColor.substr(5, 2), 16);
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (yiq >= 128) ? '#000000' : '#ffffff';
    };

    const stepColor = currentStep?.color || timer.color || '#6366f1';
    const textColor = getTextColor(stepColor);

    return (
        <div
            ref={containerRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 999999,
                background: '#000000',
                backgroundColor: 'rgb(0, 0, 0)',
                opacity: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
            }}
        >
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                {/* Background Image - Blurred */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `url(${currentStep?.imageUrl || timer.imageUrl || 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=1200&q=80'})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'blur(40px) brightness(0.3)',
                        transform: 'scale(1.1)',
                        opacity: 0.6
                    }}
                />

                {/* Close Button */}
                <button
                    onClick={async () => {
                        onClose();
                    }}
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
                <div
                    style={{
                        position: 'relative',
                        zIndex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        maxWidth: '900px',
                        padding: 'clamp(12px, 3vw, 20px)',
                        gap: 'clamp(16px, 4vw, 30px)'
                    }}
                >
                    {/* Timer Name & Step Name */}
                    <motion.div
                        key={`step-${currentStepIndex}`}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        style={{
                            textAlign: 'center',
                            color: '#fff'
                        }}
                    >
                        <h1 style={{
                            fontSize: 'clamp(18px, 5vw, 32px)',
                            fontWeight: 700,
                            marginBottom: 'clamp(4px, 1vw, 8px)',
                            color: stepColor,
                            textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                            lineHeight: 1.2
                        }}>
                            {t(timer.name)}
                        </h1>
                        <h2 style={{
                            fontSize: 'clamp(14px, 3.5vw, 24px)',
                            fontWeight: 500,
                            opacity: 0.9,
                            textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                            lineHeight: 1.3
                        }}>
                            {t(currentStep.name)}
                        </h2>
                        {timer.repetitions !== -1 && timer.repetitions > 1 && (
                            <p style={{
                                fontSize: 'clamp(11px, 2.5vw, 14px)',
                                opacity: 0.7,
                                marginTop: 'clamp(4px, 1vw, 8px)'
                            }}>
                                {t('timer.repeats')} {currentRepetition} / {timer.repetitions}
                            </p>
                        )}
                    </motion.div>

                    {/* Main Image */}
                    <motion.div
                        key={`image-${currentStepIndex}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.5 }}
                        style={{
                            position: 'relative',
                            width: '100%',
                            maxWidth: 'min(400px, 90vw)',
                            aspectRatio: '16/10',
                            borderRadius: 'clamp(12px, 3vw, 20px)',
                            overflow: 'hidden',
                            boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 0 2px ${stepColor}40`,
                            border: `clamp(2px, 0.5vw, 3px) solid ${stepColor}80`
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
                    </motion.div>

                    {/* Timer Display */}
                    <motion.div
                        key={`time-${timeLeft}`}
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        style={{
                            fontSize: 'clamp(48px, 15vw, 140px)',
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

                    {/* Instructions */}
                    {currentStep?.instructions && (
                        <motion.div
                            key={`instructions-${currentStepIndex}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.4 }}
                            style={{
                                background: 'rgba(0, 0, 0, 0.6)',
                                backdropFilter: 'blur(10px)',
                                border: `1px solid ${stepColor}40`,
                                borderRadius: 'clamp(12px, 2vw, 16px)',
                                padding: 'clamp(12px, 3vw, 20px) clamp(16px, 4vw, 30px)',
                                maxWidth: 'min(700px, 90vw)',
                                textAlign: 'center',
                                color: '#fff',
                                fontSize: 'clamp(12px, 2.5vw, 18px)',
                                lineHeight: 1.6,
                                boxShadow: '0 8px 30px rgba(0,0,0,0.4)'
                            }}
                        >
                            {resolveText(currentStep.instructions)}
                        </motion.div>
                    )}

                    {/* Controls */}
                    <div style={{
                        display: 'flex',
                        gap: 'clamp(10px, 2vw, 16px)',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: 'clamp(10px, 3vw, 20px)',
                        flexWrap: 'wrap'
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
                            aria-label={t('actions.previous')}
                        >
                            <SkipBack size={window.innerWidth < 640 ? 18 : 24} />
                        </button>

                        {/* Play/Pause */}
                        {!isActive ? (
                            <button
                                onClick={() => onStart(timer.id)}
                                style={{
                                    background: stepColor,
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: 'clamp(60px, 12vw, 80px)',
                                    height: 'clamp(60px, 12vw, 80px)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: textColor,
                                    transition: 'all 0.2s',
                                    boxShadow: `0 8px 30px ${stepColor}60`
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.1)';
                                    e.currentTarget.style.boxShadow = `0 12px 40px ${stepColor}80`;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = `0 8px 30px ${stepColor}60`;
                                }}
                                aria-label={t('actions.start')}
                            >
                                <Play size={window.innerWidth < 640 ? 24 : 32} fill="currentColor" style={{ marginLeft: '4px' }} />
                            </button>
                        ) : (
                            <button
                                onClick={() => onPause(timer.id)}
                                style={{
                                    background: stepColor,
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: 'clamp(60px, 12vw, 80px)',
                                    height: 'clamp(60px, 12vw, 80px)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: textColor,
                                    transition: 'all 0.2s',
                                    boxShadow: `0 8px 30px ${stepColor}60`
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.1)';
                                    e.currentTarget.style.boxShadow = `0 12px 40px ${stepColor}80`;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = `0 8px 30px ${stepColor}60`;
                                }}
                                aria-label={t('actions.pause')}
                            >
                                <Pause size={window.innerWidth < 640 ? 24 : 32} fill="currentColor" />
                            </button>
                        )}

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
                            aria-label={t('actions.next')}
                        >
                            <SkipForward size={window.innerWidth < 640 ? 18 : 24} />
                        </button>

                        {/* Stop */}
                        <button
                            onClick={() => {
                                onPause(timer.id);
                                reset();
                            }}
                            style={{
                                background: 'rgba(239, 68, 68, 0.2)',
                                border: '1px solid rgba(239, 68, 68, 0.4)',
                                borderRadius: '50%',
                                width: 'clamp(40px, 8vw, 56px)',
                                height: 'clamp(40px, 8vw, 56px)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: '#ef4444',
                                transition: 'all 0.2s',
                                backdropFilter: 'blur(10px)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
                                e.currentTarget.style.transform = 'scale(1.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                            aria-label={t('actions.stop')}
                        >
                            <Square size={window.innerWidth < 640 ? 16 : 20} fill="currentColor" />
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
                            aria-label={t('actions.reset')}
                        >
                            <RotateCcw size={window.innerWidth < 640 ? 18 : 22} />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default FullscreenTimer;
