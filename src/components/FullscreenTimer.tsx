import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Play, Pause, SkipForward, SkipBack, RotateCcw } from 'lucide-react';
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

// ─── Breakpoint Hook ──────────────────────────────────────
type Breakpoint = 'phone' | 'tablet' | 'desktop';

function useBreakpoint(): Breakpoint {
    const getBreakpoint = (): Breakpoint => {
        const w = window.innerWidth;
        if (w >= 1024) return 'desktop';
        if (w >= 768) return 'tablet';
        return 'phone';
    };

    const [bp, setBp] = useState<Breakpoint>(getBreakpoint);

    useEffect(() => {
        const handler = () => setBp(getBreakpoint());
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, []);

    return bp;
}

// ─── Image Gallery Component (Grid - all images visible) ──
interface ImageGalleryProps {
    images: string[];
    stepColor: string;
    height: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, stepColor, height }) => {
    if (images.length === 0) return null;

    // Grid columns: 1 image = 1col, 2 = 2col, 3+ = auto-fit
    const gridCols = images.length === 1
        ? '1fr'
        : images.length === 2
            ? '1fr 1fr'
            : `repeat(auto-fit, minmax(200px, 1fr))`;

    return (
        <div style={{
            position: 'relative',
            width: '100%',
            height,
            background: `linear-gradient(135deg, ${stepColor}20 0%, ${stepColor}35 40%, #0a0a0a 100%)`,
            overflow: 'hidden',
            flexShrink: 0,
            display: 'grid',
            gridTemplateColumns: gridCols,
            gap: images.length > 1 ? '4px' : '0',
            padding: images.length > 1 ? '8px' : '0'
        }}>
            {images.map((src, i) => (
                <motion.div
                    key={`img-${i}-${src}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    style={{
                        position: 'relative',
                        borderRadius: images.length > 1 ? '12px' : '0',
                        overflow: 'hidden',
                        background: `rgba(0,0,0,0.3)`
                    }}
                >
                    <img
                        src={src}
                        alt=""
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            objectPosition: 'center',
                            filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.4))'
                        }}
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=1200&q=80';
                        }}
                    />
                    {/* Image number label for multi-image */}
                    {images.length > 1 && (
                        <div style={{
                            position: 'absolute',
                            top: '8px',
                            left: '8px',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: `${stepColor}cc`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontSize: '12px',
                            fontWeight: 700,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
                        }}>
                            {i + 1}
                        </div>
                    )}
                </motion.div>
            ))}

            {/* Gradient overlay at bottom */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '30%',
                background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.5))',
                pointerEvents: 'none',
                gridColumn: '1 / -1'
            }} />
        </div>
    );
};

// ─── Main Component ──────────────────────────────────────
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
    const breakpoint = useBreakpoint();

    // ─── Helpers ──────────────────────────────────────
    const resolveText = (text: string | undefined): string | undefined => {
        if (!text) return undefined;
        // Only try translation for dot-separated keys (e.g. 'guidance.satKriya.prep')
        // Plain text with spaces is returned as-is to avoid console warnings
        if (/^[a-zA-Z0-9_.]+$/.test(text) && text.includes('.')) {
            const translated = t(text);
            return translated !== text ? translated : text;
        }
        return text;
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getStepColor = (step: typeof currentStep): string => {
        const name = step.name.toLowerCase();
        if (name.includes('inhale') || name.includes('breathe')) return '#3b82f6';
        if (name.includes('exhale')) return '#8b5cf6';
        if (name.includes('hold')) return '#10b981';
        return step.color || timer.color || '#06b6d4';
    };

    const stepColor = getStepColor(currentStep);

    // Resolve images: images[] → [imageUrl] → [timer.imageUrl] → default
    const resolvedImages: string[] = (() => {
        if (currentStep.images && currentStep.images.length > 0) return currentStep.images;
        if (currentStep.imageUrl) return [currentStep.imageUrl];
        if (timer.imageUrl) return [timer.imageUrl];
        return ['https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=1200&q=80'];
    })();

    // ─── Effects ──────────────────────────────────────
    useEffect(() => {
        return () => { stopTTS(); };
    }, []);

    useEffect(() => {
        if (isActive && currentStep) {
            const rawText = currentStep.ttsText || currentStep.instructions;
            if (rawText) {
                const text = resolveText(rawText);
                if (text) {
                    const timeout = setTimeout(() => { speak(text, language, volume); }, 300);
                    return () => clearTimeout(timeout);
                }
            }
        }
    }, [currentStepIndex, isActive]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // ─── Shared Sub-Components ────────────────────────

    // Title + Step Name
    const TitleSection = () => (
        <motion.div
            key={`title-${currentStepIndex}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{ textAlign: 'center', color: '#fff' }}
        >
            <h1 style={{
                fontSize: breakpoint === 'phone' ? 'clamp(18px, 5vw, 28px)' : 'clamp(24px, 3vw, 36px)',
                fontWeight: 700,
                marginBottom: '4px',
                color: stepColor,
                textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                lineHeight: 1.2
            }}>
                {t(timer.name)}
            </h1>
            <h2 style={{
                fontSize: breakpoint === 'phone' ? 'clamp(14px, 4vw, 20px)' : 'clamp(18px, 2.5vw, 24px)',
                fontWeight: 500,
                opacity: 0.9,
                textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                lineHeight: 1.3
            }}>
                {t(currentStep.name)}
            </h2>
        </motion.div>
    );

    // Timer Display
    const TimerDisplay = () => (
        <motion.div
            key={`time-${Math.floor(timeLeft / 5)}`}
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{
                fontSize: breakpoint === 'phone' ? 'clamp(48px, 18vw, 90px)' : 'clamp(64px, 10vw, 120px)',
                fontWeight: 900,
                color: stepColor,
                textShadow: `0 4px 20px ${stepColor}60, 0 0 40px ${stepColor}40`,
                letterSpacing: '-0.02em',
                fontVariantNumeric: 'tabular-nums',
                lineHeight: 1,
                textAlign: 'center'
            }}
        >
            {formatTime(timeLeft)}
        </motion.div>
    );

    // Steps Timeline
    const StepsTimeline = () => {
        if (!timer.steps || timer.steps.length <= 1) return null;
        return (
            <div style={{
                width: '100%',
                maxWidth: breakpoint === 'desktop' ? '100%' : '900px',
                padding: '0 clamp(12px, 3vw, 24px)'
            }}>
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: breakpoint === 'phone' ? '6px' : 'clamp(8px, 1.5vw, 12px)',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    {timer.steps.map((step, index) => {
                        const isActive_ = index === currentStepIndex;
                        const isPast = index < currentStepIndex;
                        const stepCol = getStepColor(step);

                        return (
                            <button
                                ref={isActive_ ? activeStepRef : null}
                                key={index}
                                onClick={() => jumpToStep?.(index)}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: breakpoint === 'phone' ? '4px' : '6px',
                                    padding: breakpoint === 'phone' ? '6px 8px' : 'clamp(8px, 1.5vw, 12px)',
                                    background: isActive_
                                        ? `${stepCol}40`
                                        : isPast
                                            ? 'rgba(255,255,255,0.1)'
                                            : 'rgba(255,255,255,0.05)',
                                    border: isActive_
                                        ? `2px solid ${stepCol}`
                                        : '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    minWidth: breakpoint === 'phone' ? '48px' : 'clamp(60px, 10vw, 90px)',
                                    transition: 'all 0.2s',
                                    color: '#fff',
                                    opacity: isActive_ ? 1 : isPast ? 0.7 : 0.5,
                                    flexShrink: 0
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.background = isActive_ ? `${stepCol}60` : 'rgba(255,255,255,0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.background = isActive_
                                        ? `${stepCol}40`
                                        : isPast
                                            ? 'rgba(255,255,255,0.1)'
                                            : 'rgba(255,255,255,0.05)';
                                }}
                            >
                                <div style={{
                                    width: breakpoint === 'phone' ? '20px' : 'clamp(24px, 4vw, 30px)',
                                    height: breakpoint === 'phone' ? '20px' : 'clamp(24px, 4vw, 30px)',
                                    borderRadius: '50%',
                                    background: isActive_
                                        ? stepCol
                                        : isPast
                                            ? 'rgba(255,255,255,0.3)'
                                            : 'rgba(255,255,255,0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: breakpoint === 'phone' ? '10px' : 'clamp(10px, 2vw, 13px)',
                                    fontWeight: 700
                                }}>
                                    {index + 1}
                                </div>
                                <span style={{
                                    fontSize: breakpoint === 'phone' ? '8px' : 'clamp(9px, 1.5vw, 11px)',
                                    fontWeight: isActive_ ? 600 : 500,
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
        );
    };

    // Instructions
    const Instructions = () => {
        if (!currentStep?.instructions) return null;
        return (
            <motion.div
                key={`instructions-${currentStepIndex}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                style={{
                    maxWidth: '600px',
                    textAlign: 'center',
                    fontSize: breakpoint === 'phone' ? 'clamp(12px, 3.5vw, 14px)' : 'clamp(14px, 2vw, 16px)',
                    color: 'rgba(255,255,255,0.8)',
                    lineHeight: 1.6,
                    padding: '0 16px'
                }}
            >
                {resolveText(currentStep.instructions)}
            </motion.div>
        );
    };

    // Repetitions
    const Repetitions = () => {
        if (timer.repetitions === -1 || timer.repetitions <= 1) return null;
        return (
            <p style={{
                fontSize: 'clamp(11px, 2vw, 14px)',
                opacity: 0.6,
                color: '#fff',
                textShadow: '0 1px 3px rgba(0,0,0,0.5)'
            }}>
                {t('timer.repeats')} {currentRepetition} / {timer.repetitions}
            </p>
        );
    };

    // Control Button
    const ControlButton = ({ onClick, icon: Icon, size, style: extraStyle, iconSize }: {
        onClick: () => void;
        icon: any;
        size: string;
        style?: React.CSSProperties;
        iconSize?: number;
    }) => (
        <button
            onClick={onClick}
            style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                width: size,
                height: size,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#fff',
                transition: 'all 0.2s',
                backdropFilter: 'blur(10px)',
                ...extraStyle
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = extraStyle?.background as string || 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = 'scale(1)';
            }}
        >
            <Icon size={iconSize || 20} />
        </button>
    );

    // Controls Row
    const Controls = () => {
        const btnSize = breakpoint === 'phone' ? '44px' : '52px';
        const playSize = breakpoint === 'phone' ? '60px' : '68px';
        const iconSz = breakpoint === 'phone' ? 18 : 22;

        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: breakpoint === 'phone' ? '12px' : '20px'
            }}>
                <ControlButton onClick={prevStep} icon={SkipBack} size={btnSize} iconSize={iconSz} />

                <button
                    onClick={() => isActive ? onPause(timer.id) : onStart(timer.id)}
                    style={{
                        background: stepColor,
                        border: `2px solid ${stepColor}`,
                        borderRadius: '50%',
                        width: playSize,
                        height: playSize,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#fff',
                        transition: 'all 0.2s',
                        boxShadow: `0 4px 16px ${stepColor}60`
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)';
                        e.currentTarget.style.boxShadow = `0 6px 20px ${stepColor}80`;
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = `0 4px 16px ${stepColor}60`;
                    }}
                >
                    {isActive ?
                        <Pause size={breakpoint === 'phone' ? 24 : 28} fill="currentColor" /> :
                        <Play size={breakpoint === 'phone' ? 24 : 28} fill="currentColor" style={{ marginLeft: '3px' }} />
                    }
                </button>

                <ControlButton onClick={nextStep} icon={SkipForward} size={btnSize} iconSize={iconSz} />

                <ControlButton
                    onClick={() => { reset(); onStart(timer.id); }}
                    icon={RotateCcw}
                    size={btnSize}
                    iconSize={iconSz - 2}
                    style={{
                        background: `${stepColor}40`,
                        border: `1px solid ${stepColor}60`,
                        color: stepColor
                    }}
                />
            </div>
        );
    };

    // ─── Layout Rendering ─────────────────────────────

    const imageHeight = breakpoint === 'phone'
        ? 'clamp(180px, 35vh, 350px)'
        : breakpoint === 'tablet'
            ? 'clamp(250px, 40vh, 450px)'
            : '100%';

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: '#0a0a0a',
            overflow: 'hidden'
        }}>
            {/* Subtle background blur of current image */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url(${resolvedImages[0]})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(40px) brightness(0.2)',
                opacity: 0.4,
                transform: 'scale(1.2)'
            }} />

            {/* Close Button */}
            <button
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    zIndex: 10,
                    background: 'rgba(0, 0, 0, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
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
                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)';
                    e.currentTarget.style.transform = 'scale(1)';
                }}
                aria-label="Close"
            >
                <X size={22} />
            </button>

            {/* ═══ DESKTOP LAYOUT: Side-by-side ═══ */}
            {breakpoint === 'desktop' && (
                <div style={{
                    position: 'relative',
                    zIndex: 1,
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    width: '100%',
                    height: '100%'
                }}>
                    {/* Left: Image Gallery */}
                    <ImageGallery
                        images={resolvedImages}
                        stepColor={stepColor}
                        height="100%"
                    />

                    {/* Right: Controls & Info */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 'clamp(16px, 3vh, 28px)',
                        padding: 'clamp(24px, 4vh, 48px) clamp(20px, 3vw, 40px)',
                        overflow: 'auto'
                    }}>
                        <TitleSection />
                        <StepsTimeline />
                        <TimerDisplay />
                        <Repetitions />
                        <Instructions />
                        <div style={{ marginTop: '8px' }}>
                            <Controls />
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ PHONE / TABLET LAYOUT: Stacked ═══ */}
            {breakpoint !== 'desktop' && (
                <div style={{
                    position: 'relative',
                    zIndex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    height: '100%',
                    overflow: 'hidden'
                }}>
                    {/* Top: Image Gallery */}
                    <ImageGallery
                        images={resolvedImages}
                        stepColor={stepColor}
                        height={imageHeight}
                    />

                    {/* Bottom: Content */}
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingTop: breakpoint === 'phone' ? '12px' : '20px',
                        paddingBottom: breakpoint === 'phone' ? '20px' : '28px',
                        gap: breakpoint === 'phone' ? '8px' : 'clamp(12px, 2vh, 20px)',
                        overflow: 'auto'
                    }}>
                        <TitleSection />
                        <StepsTimeline />
                        <TimerDisplay />
                        <Repetitions />
                        <Instructions />
                        <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
                            <Controls />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FullscreenTimer;
