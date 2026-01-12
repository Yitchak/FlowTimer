import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
    content: string;
    children: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, position = 'top' }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLDivElement>(null);

    const updatePosition = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const scrollX = window.scrollX;
            const scrollY = window.scrollY;
            const gap = 8; // defined gap

            let top = 0;
            let left = 0;

            switch (position) {
                case 'bottom':
                    top = rect.bottom + scrollY + gap;
                    left = rect.left + scrollX + rect.width / 2;
                    break;
                case 'left':
                    top = rect.top + scrollY + rect.height / 2;
                    left = rect.left + scrollX - gap;
                    break;
                case 'right':
                    top = rect.top + scrollY + rect.height / 2;
                    left = rect.right + scrollX + gap;
                    break;
                case 'top':
                default:
                    top = rect.top + scrollY - gap;
                    left = rect.left + scrollX + rect.width / 2;
                    break;
            }
            setCoords({ top, left });
        }
    };

    useEffect(() => {
        if (isVisible) {
            updatePosition();
            window.addEventListener('scroll', updatePosition, true);
            window.addEventListener('resize', updatePosition);
            return () => {
                window.removeEventListener('scroll', updatePosition, true);
                window.removeEventListener('resize', updatePosition);
            };
        }
    }, [isVisible]);

    return (
        <>
            <div
                ref={triggerRef}
                className="relative inline-flex items-center justify-center"
                onMouseEnter={() => { updatePosition(); setIsVisible(true); }}
                onMouseLeave={() => setIsVisible(false)}
                onFocus={() => setIsVisible(true)}
                onBlur={() => setIsVisible(false)}
                onTouchStart={() => { updatePosition(); setIsVisible(true); }}
                onTouchEnd={() => setTimeout(() => setIsVisible(false), 1500)}
            >
                {children}
            </div>
            {createPortal(
                <AnimatePresence>
                    {isVisible && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.15 }}
                            style={{
                                position: 'absolute',
                                top: coords.top,
                                left: coords.left,
                                zIndex: 9999, // High z-index to float over everything
                                pointerEvents: 'none',
                                transform: 'translate(-50%, -50%)', // Default centering centering fix
                            }}
                            className="fixed-tooltip-wrapper" /* Helper class if needed */
                        >
                            <div
                                className="px-2 py-1 bg-gray-900/90 dark:bg-white/90 text-white dark:text-black text-[10px] font-medium rounded shadow-lg backdrop-blur-sm whitespace-nowrap border border-white/10 dark:border-black/5"
                                style={{
                                    // Adjust translation based on position to truly center/offset
                                    transform: position === 'top' ? 'translate(-50%, -100%)' :
                                        position === 'bottom' ? 'translate(-50%, 0)' :
                                            position === 'left' ? 'translate(-100%, -50%)' :
                                                'translate(0, -50%)'
                                }}
                            >
                                {content}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
};
