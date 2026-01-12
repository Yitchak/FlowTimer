import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
    content: string;
    children: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, position = 'top' }) => {
    const [isVisible, setIsVisible] = useState(false);

    const getPositionStyles = () => {
        switch (position) {
            case 'bottom':
                return { top: '100%', left: '50%', x: '-50%', marginTop: '8px' };
            case 'left':
                return { right: '100%', top: '50%', y: '-50%', marginRight: '8px' };
            case 'right':
                return { left: '100%', top: '50%', y: '-50%', marginLeft: '8px' };
            case 'top':
            default:
                return { bottom: '100%', left: '50%', x: '-50%', marginBottom: '8px' };
        }
    };

    return (
        <div
            className="relative inline-flex items-center justify-center"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
            onFocus={() => setIsVisible(true)}
            onBlur={() => setIsVisible(false)}
            // Touch interaction handling for mobile
            onTouchStart={() => setIsVisible(true)}
            onTouchEnd={() => setTimeout(() => setIsVisible(false), 1500)} // Hide after delay
        >
            {children}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                        style={{
                            position: 'absolute',
                            ...getPositionStyles(),
                            zIndex: 100,
                            pointerEvents: 'none'
                        }}
                        className="px-2 py-1 bg-gray-900/90 dark:bg-white/90 text-white dark:text-black text-[10px] font-medium rounded shadow-lg backdrop-blur-sm whitespace-nowrap border border-white/10 dark:border-black/5"
                    >
                        {content}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
