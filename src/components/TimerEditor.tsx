import React, { useState } from 'react';
import { X, Plus, Trash2, Save, Image, BookOpen, Volume2, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Timer, TimerStep, TimerType } from '../types/timer';
import { useLanguage } from '../contexts/LanguageContext';
import { Tooltip } from './Tooltip';


interface TimerEditorProps {
    timer?: Timer;
    onSave: (timer: Timer) => void;
    onClose: () => void;
}

const TimerEditor: React.FC<TimerEditorProps> = ({ timer, onSave, onClose }) => {
    const { t } = useLanguage();
    const [name, setName] = useState(timer?.name ? t(timer.name) : '');
    const [type, setType] = useState<TimerType>(timer?.type || 'simple');
    const [tags] = useState<string[]>(timer?.tags || []);
    const [color, setColor] = useState<string>(timer?.color || '#42a5f5');
    const [steps, setSteps] = useState<TimerStep[]>(timer?.steps ?
        timer.steps.map(s => ({ ...s, name: t(s.name) }))
        : [{ id: '1', name: 'Timer', duration: 60 }]
    );
    const [repetitions, setRepetitions] = useState(timer?.repetitions || 1);
    const [isContinuous, setIsContinuous] = useState(timer?.repetitions === -1);
    const [expandedStep, setExpandedStep] = useState<string | null>(null);



    const formatTime = (totalSeconds: number) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        if (h > 0) return `${h}h ${m}m ${s}s`;
        if (m > 0) return `${m}m ${s}s`;
        return `${s}s`;
    };

    const calculateTotalTime = () => {
        const cycleTime = steps.reduce((acc, step) => acc + step.duration, 0);
        if (isContinuous) return `Continuous (${formatTime(cycleTime)} per cycle)`;
        return `${formatTime(cycleTime * (repetitions || 1))} ${t('editor.totalDuration')}`;
    };


    const addStep = () => {
        setSteps([...steps, { id: Date.now().toString(), name: `Step ${steps.length + 1}`, duration: 60 }]);
    };


    const removeStep = (id: string) => {
        if (steps.length > 1) {
            setSteps(steps.filter(s => s.id !== id));
        }
    };

    const updateStep = (id: string, updates: Partial<TimerStep>) => {
        setSteps(steps.map(s => s.id === id ? { ...s, ...updates } : s));
    };

    const handleSave = () => {
        const finalTimer: Timer = {
            id: timer?.id || Date.now().toString(),
            name: name || 'Untitled Timer',
            type,
            tags,
            color,
            steps,
            repetitions: isContinuous ? -1 : repetitions,
            order: timer?.order || 0,
            userId: timer?.userId || 'current-user',
        };
        onSave(finalTimer);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="editor-container"
        >
            {/* Editor Header */}
            <header className="editor-header">
                <div className="header-left">
                    <Tooltip content={t('actions.back')}>
                        <button
                            onClick={onClose}
                            className="icon-btn-large"
                        >

                            <X size={20} />
                        </button>
                    </Tooltip>
                    <div className="header-title-group">
                        <h2>{timer ? t('editor.titleEdit') : t('editor.titleNew')}</h2>
                        <span>{t('editor.subtitle')}</span>
                    </div>

                </div>
                <Tooltip content={t('actions.save')}>
                    <button onClick={handleSave} className="primary-btn">
                        <Save size={18} fill="currentColor" />
                        <span>{t('actions.save')}</span>
                    </button>
                </Tooltip>

            </header>

            {/* Scrollable Content */}
            <div className="editor-content">
                <div className="editor-wrapper">

                    {/* General Settings Card */}
                    <section className="editor-section">
                        <div className="section-header">
                            <h3>{t('editor.general')}</h3>
                            <p>{t('editor.infoBasic')}</p>
                        </div>


                        <div className="form-row">
                            <div className="form-col">
                                <div className="form-group">
                                    <label className="form-label">{t('editor.timerName')}</label>
                                    <input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder={t('editor.placeholderName')}
                                        className="styled-input"
                                    />
                                </div>

                            </div>

                            <div className="form-col">
                                <div className="form-group">
                                    <label className="form-label">{t('editor.flowType')}</label>
                                    <div className="type-selector">
                                        <button
                                            onClick={() => setType('simple')}
                                            className={`type-btn ${type === 'simple' ? 'active' : ''}`}
                                        >
                                            {t('editor.simple')}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setType('complex');
                                                if (steps.length === 0) addStep();
                                            }}
                                            className={`type-btn ${type === 'complex' ? 'active' : ''}`}
                                        >
                                            {t('editor.complex')}
                                        </button>

                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">{t('editor.color')}</label>
                            <div className="flex flex-wrap gap-2 mt-2">

                                {[
                                    '#ef5350', '#ec407a', '#ab47bc', '#7e57c2',
                                    '#5c6bc0', '#42a5f5', '#29b6f6', '#26c6da',
                                    '#26a69a', '#66bb6a', '#9ccc65', '#d4e157',
                                    '#ffee58', '#ffca28', '#ffa726', '#ff7043'
                                ].map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => setColor(c)}
                                        style={{
                                            backgroundColor: c,
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '50%',
                                            border: color === c ? '2px solid white' : '2px solid transparent',
                                            boxShadow: color === c ? '0 0 0 2px var(--primary)' : 'none',
                                            cursor: 'pointer',
                                            transition: 'transform 0.1s'
                                        }}
                                        title={c}
                                        className="hover:scale-110"
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">{t('editor.repetitions')}</label>

                            <div className="repetitions-control">
                                <input
                                    type="number"
                                    disabled={isContinuous}
                                    value={repetitions}
                                    onChange={(e) => setRepetitions(parseInt(e.target.value) || 1)}
                                    className="rep-input"
                                    min="1"
                                />
                                <div className="vertical-divider"></div>
                                <label className="continuous-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={isContinuous}
                                        onChange={(e) => setIsContinuous(e.target.checked)}
                                        className="checkbox-box"
                                    />
                                    <div className="flex flex-col">
                                        <span className="font-bold">{t('editor.continuous')}</span>
                                    </div>

                                </label>
                            </div>
                        </div>
                    </section>

                    {/* Intervals / Steps / Duration Section */}
                    {type === 'simple' ? (
                        <section className="editor-section">
                            <div className="section-header">
                                <h3>{t('editor.duration')}</h3>
                                <p>{t('editor.setDuration')}</p>
                            </div>


                            <div className="time-input-container">
                                {/* Hours */}
                                <div className="time-field">
                                    <input
                                        className="time-value-input"
                                        type="number"
                                        min="0"
                                        placeholder="00"
                                        value={Math.floor(steps[0].duration / 3600).toString()}
                                        onChange={(e) => {
                                            const h = parseInt(e.target.value) || 0;
                                            const currentTotal = steps[0].duration;
                                            const m = Math.floor((currentTotal % 3600) / 60);
                                            const s = currentTotal % 60;
                                            updateStep(steps[0].id, { duration: h * 3600 + m * 60 + s });
                                        }}
                                    />
                                    <span className="form-label">{t('editor.hours')}</span>
                                </div>


                                <span className="time-separator">:</span>

                                {/* Minutes */}
                                <div className="time-field">
                                    <input
                                        className="time-value-input"
                                        type="number"
                                        min="0"
                                        max="59"
                                        placeholder="00"
                                        value={Math.floor((steps[0].duration % 3600) / 60).toString()}
                                        onChange={(e) => {
                                            const m = Math.min(59, parseInt(e.target.value) || 0);
                                            const currentTotal = steps[0].duration;
                                            const h = Math.floor(currentTotal / 3600);
                                            const s = currentTotal % 60;
                                            updateStep(steps[0].id, { duration: h * 3600 + m * 60 + s });
                                        }}
                                    />
                                    <span className="form-label">{t('editor.mins')}</span>
                                </div>


                                <span className="time-separator">:</span>

                                {/* Seconds */}
                                <div className="time-field">
                                    <input
                                        className="time-value-input"
                                        type="number"
                                        min="0"
                                        max="59"
                                        placeholder="00"
                                        value={(steps[0].duration % 60).toString()}
                                        onChange={(e) => {
                                            const s = Math.min(59, parseInt(e.target.value) || 0);
                                            const currentTotal = steps[0].duration;
                                            const h = Math.floor(currentTotal / 3600);
                                            const m = Math.floor((currentTotal % 3600) / 60);
                                            updateStep(steps[0].id, { duration: h * 3600 + m * 60 + s });
                                        }}
                                    />
                                    <span className="form-label">{t('editor.secs')}</span>
                                </div>
                            </div>

                        </section>
                    ) : (
                        <section className="editor-section">
                            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3>{t('editor.intervals')}</h3>
                                    <p>{t('editor.intervalsSubtitle')}</p>
                                </div>

                                <span style={{
                                    padding: '4px 12px',
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: '20px',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                    color: 'var(--text-dim)'
                                }}>
                                    {steps.length} {t('editor.stepsCount')}
                                </span>

                            </div>

                            <div className="steps-list">
                                {steps.map((step, index) => {
                                    const isExpanded = expandedStep === step.id;
                                    const hasGuidance = !!(step.imageUrl || step.instructions || step.ttsText);
                                    return (
                                    <div key={step.id} className="step-row" style={{ flexDirection: 'column' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                                            <div className="step-header-mobile">
                                                <div className="step-number">
                                                    {index + 1}
                                                </div>
                                                <Tooltip content={t('editor.removeStep')}>
                                                    <button
                                                        onClick={() => removeStep(step.id)}
                                                        className="remove-step-btn mobile-only"
                                                        disabled={steps.length === 1}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </Tooltip>
                                            </div>

                                            <div className="step-main-content">
                                                <label className="form-label text-xs">{t('editor.stepName')}</label>
                                                <input
                                                    value={step.name}
                                                    onChange={(e) => updateStep(step.id, { name: e.target.value })}
                                                    className="step-name-input"
                                                    placeholder={t('editor.stepPlaceholder')}
                                                />
                                            </div>

                                            <div className="step-duration-group">
                                                <label className="form-label text-xs">{t('editor.duration')} (H:M:S)</label>
                                                <div className="duration-inputs-row">
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        placeholder="0h"
                                                        value={Math.floor(step.duration / 3600).toString()}
                                                        onChange={(e) => {
                                                            const val = parseInt(e.target.value) || 0;
                                                            const currentM = Math.floor((step.duration % 3600) / 60);
                                                            const currentS = step.duration % 60;
                                                            updateStep(step.id, { duration: val * 3600 + currentM * 60 + currentS });
                                                        }}
                                                        className="duration-input-compact"
                                                    />
                                                    <span className="time-sep">:</span>
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        placeholder="0m"
                                                        value={Math.floor((step.duration % 3600) / 60).toString()}
                                                        onChange={(e) => {
                                                            let val = parseInt(e.target.value) || 0;
                                                            if (val > 59) val = 59;
                                                            const currentH = Math.floor(step.duration / 3600);
                                                            const currentS = step.duration % 60;
                                                            updateStep(step.id, { duration: currentH * 3600 + val * 60 + currentS });
                                                        }}
                                                        className="duration-input-compact"
                                                    />
                                                    <span className="time-sep">:</span>
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        placeholder="0s"
                                                        value={(step.duration % 60).toString()}
                                                        onChange={(e) => {
                                                            let val = parseInt(e.target.value) || 0;
                                                            if (val > 59) val = 59;
                                                            const currentH = Math.floor(step.duration / 3600);
                                                            const currentM = Math.floor((step.duration % 3600) / 60);
                                                            updateStep(step.id, { duration: currentH * 3600 + currentM * 60 + val });
                                                        }}
                                                        className="duration-input-compact"
                                                    />
                                                </div>
                                            </div>

                                            {/* Guidance expand toggle */}
                                            <Tooltip content={t('editor.guidance')}>
                                                <button
                                                    onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '2px',
                                                        padding: '6px',
                                                        borderRadius: '8px',
                                                        background: hasGuidance ? 'rgba(var(--primary-rgb), 0.15)' : 'rgba(255,255,255,0.05)',
                                                        color: hasGuidance ? 'var(--primary)' : 'var(--text-dim)',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    <BookOpen size={14} />
                                                    {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                                </button>
                                            </Tooltip>

                                            <Tooltip content={t('editor.removeStep')}>
                                                <button
                                                    onClick={() => removeStep(step.id)}
                                                    className="remove-step-btn desktop-only"
                                                    disabled={steps.length === 1}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </Tooltip>
                                        </div>

                                        {/* Expandable Guidance Section */}
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    style={{
                                                        overflow: 'hidden',
                                                        width: '100%',
                                                        marginTop: '8px',
                                                        padding: '12px',
                                                        borderRadius: '10px',
                                                        background: 'rgba(255,255,255,0.03)',
                                                        border: '1px solid rgba(255,255,255,0.08)',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '10px'
                                                    }}
                                                >
                                                    {/* Image URL */}
                                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                                        <label className="form-label text-xs" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <Image size={12} />
                                                            {t('editor.stepImage')}
                                                        </label>
                                                        <input
                                                            value={step.imageUrl || ''}
                                                            onChange={(e) => updateStep(step.id, { imageUrl: e.target.value || undefined })}
                                                            className="styled-input"
                                                            placeholder="https://..."
                                                            style={{ fontSize: '12px' }}
                                                        />
                                                    </div>

                                                    {/* Instructions */}
                                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                                        <label className="form-label text-xs" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <BookOpen size={12} />
                                                            {t('editor.stepInstructions')}
                                                        </label>
                                                        <textarea
                                                            value={step.instructions || ''}
                                                            onChange={(e) => updateStep(step.id, { instructions: e.target.value || undefined })}
                                                            className="styled-input"
                                                            placeholder={t('editor.instructionsPlaceholder')}
                                                            rows={3}
                                                            style={{ fontSize: '12px', resize: 'vertical', minHeight: '60px' }}
                                                        />
                                                    </div>

                                                    {/* TTS Text (optional, defaults to instructions) */}
                                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                                        <label className="form-label text-xs" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <Volume2 size={12} />
                                                            {t('editor.ttsText')}
                                                        </label>
                                                        <input
                                                            value={step.ttsText || ''}
                                                            onChange={(e) => updateStep(step.id, { ttsText: e.target.value || undefined })}
                                                            className="styled-input"
                                                            placeholder={t('editor.ttsPlaceholder')}
                                                            style={{ fontSize: '12px' }}
                                                        />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                    );
                                })}
                            </div>

                            <Tooltip content={t('editor.addStep')}>
                                <button
                                    onClick={addStep}
                                    className="add-step-btn"
                                >
                                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Plus size={18} />
                                    </div>
                                    <span style={{ fontWeight: 700 }}>{t('editor.addStep')}</span>
                                </button>
                            </Tooltip>
                        </section>

                    )}
                </div>
            </div>

            {/* Footer Info */}
            <div className="editor-footer">
                <div className="total-time-display">
                    <span className="time-label">{t('editor.totalDuration')}</span>
                    <span className="time-value">{calculateTotalTime()}</span>
                </div>

            </div>
        </motion.div>
    );
};

export default TimerEditor;
