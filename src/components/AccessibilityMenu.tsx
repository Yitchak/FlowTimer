import React, { useState, useEffect } from 'react';
import { Type, Eye, Download, Upload, X, Globe } from 'lucide-react';

import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

interface AccessibilityMenuProps {
    onClose: () => void;
    onExport: () => void;
    onImport: () => void;
}

const AccessibilityMenu: React.FC<AccessibilityMenuProps> = ({ onClose, onExport, onImport }) => {
    const [fontSize, setFontSize] = useState('medium');
    const [isHighContrast, setIsHighContrast] = useState(false);
    const { t, language, setLanguage } = useLanguage();

    useEffect(() => {
        document.documentElement.setAttribute('data-font-size', fontSize);
        document.documentElement.setAttribute('data-high-contrast', isHighContrast.toString());
    }, [fontSize, isHighContrast]);

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed top-24 right-8 z-[150] w-72 glass-card p-6 flex flex-col gap-6"
        >
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">{t('settings.title')}</h3>
                <button onClick={onClose} className="text-text-dim hover:text-text">
                    <X size={20} />
                </button>
            </div>

            {/* Language */}
            <div className="space-y-3">
                <label className="text-xs font-bold text-text-dim uppercase tracking-widest flex items-center gap-2">
                    <Globe size={14} /> {t('settings.language')}
                </label>
                <div className="flex gap-2 p-1 bg-surface rounded-lg">
                    {[
                        { code: 'en', label: 'English' },
                        { code: 'he', label: 'עברית' },
                        { code: 'es', label: 'Español' }
                    ].map(lang => (
                        <button
                            key={lang.code}
                            onClick={() => setLanguage(lang.code as any)}
                            className={`flex-1 py-2 text-xs font-bold rounded-md transition ${language === lang.code ? 'bg-primary text-white shadow-md' : 'text-text-dim hover:text-text hover:bg-surface-hover'}`}
                        >
                            {lang.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Font Size */}
            <div className="space-y-3">
                <label className="text-xs font-bold text-text-dim uppercase tracking-widest flex items-center gap-2">
                    <Type size={14} /> {t('settings.fontSize')}
                </label>
                <div className="flex gap-2 p-1 bg-surface rounded-lg">
                    {['small', 'medium', 'large'].map(size => (
                        <button
                            key={size}
                            onClick={() => setFontSize(size)}
                            className={`flex-1 py-2 text-xs font-bold rounded-md transition capitalize ${fontSize === size ? 'bg-primary text-white shadow-md' : 'text-text-dim hover:text-text hover:bg-surface-hover'}`}
                        >
                            {size}
                        </button>
                    ))}
                </div>
            </div>

            {/* High Contrast */}
            <div className="flex items-center justify-between">
                <label className="text-sm font-bold flex items-center gap-2">
                    <Eye size={16} /> {t('settings.highContrast')}
                </label>
                <button
                    onClick={() => setIsHighContrast(!isHighContrast)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${isHighContrast ? 'bg-primary' : 'bg-surface'}`}
                >
                    <motion.div
                        animate={{ x: isHighContrast ? 24 : 4 }}
                        className="absolute top-1 w-4 h-4 bg-white rounded-full"
                    />
                </button>
            </div>

            <div className="h-[1px] bg-glass-border" />

            {/* Data Management */}
            <div className="space-y-3">
                <label className="text-xs font-bold text-text-dim uppercase tracking-widest">{t('settings.dataManagement')}</label>
                <div className="flex flex-col gap-2">
                    <button onClick={onExport} className="secondary-btn !py-2 !text-xs flex items-center justify-center gap-2">
                        <Download size={14} /> {t('settings.exportJson')}
                    </button>
                    <button onClick={onImport} className="secondary-btn !py-2 !text-xs flex items-center justify-center gap-2">
                        <Upload size={14} /> {t('settings.importJson')}
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default AccessibilityMenu;
