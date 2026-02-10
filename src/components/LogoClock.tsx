import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LogoClock: React.FC = () => {
    const [showClock, setShowClock] = useState(false);
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        // Update time every second
        const timeInterval = setInterval(() => {
            setTime(new Date());
        }, 1000);

        // Alternate every 2 seconds
        const alternateInterval = setInterval(() => {
            setShowClock(prev => !prev);
        }, 2000);

        return () => {
            clearInterval(timeInterval);
            clearInterval(alternateInterval);
        };
    }, []);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    };

    return (
        <div className="logo-clock-container" style={{ position: 'relative', height: '1.5rem', display: 'flex', alignItems: 'center' }}>
            <AnimatePresence mode="wait">
                {!showClock ? (
                    <motion.h1
                        key="logo"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.5 }}
                        className="logo-text"
                        style={{ margin: 0 }}
                    >
                        Timr<span className="text-primary">Flow</span>
                    </motion.h1>
                ) : (
                    <motion.h1
                        key="clock"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.5 }}
                        className="logo-text"
                        style={{
                            margin: 0,
                            fontVariantNumeric: 'tabular-nums',
                            fontSize: '2.1rem'
                        }}
                    >
                        {formatTime(time)}
                    </motion.h1>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LogoClock;
