
import React from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import TimerCard from './TimerCard';
import type { Timer } from '../types/timer';

interface ReorderableTimerItemProps {
    timer: Timer;
    isActive: boolean;
    onStart: (id: string) => void;
    onPause: (id: string) => void;
    onEdit: (timer: Timer) => void;
    onDuplicate: (timer: Timer) => void;
    onDelete: (id: string) => void;
    volume?: number;
}

export const ReorderableTimerItem: React.FC<ReorderableTimerItemProps> = ({
    timer,
    isActive,
    onStart,
    onPause,
    onEdit,
    onDuplicate,
    onDelete,
    volume
}) => {
    const controls = useDragControls();

    return (
        <Reorder.Item
            value={timer}
            layoutId={timer.id}
            className="timer-reorder-item touch-pan-y" /* Ensure touch scrolling works on the item itself */
            dragListener={false} /* Disable default drag listener */
            dragControls={controls} /* Use custom controls */
            drag
            whileDrag={{ scale: 1.05, zIndex: 100 }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            layout
            style={{ touchAction: 'pan-y' }} /* Explicitly allow vertical scrolling */
        >
            <TimerCard
                timer={timer}
                isActive={isActive}
                onStart={onStart}
                onPause={onPause}
                onEdit={onEdit}
                onDuplicate={onDuplicate}
                onDelete={onDelete}
                dragControls={controls} /* Pass controls to trigger drag */
                volume={volume}
            />
        </Reorder.Item>
    );
};
