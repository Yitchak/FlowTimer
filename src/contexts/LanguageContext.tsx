import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../data/translations';
import type { Language } from '../data/translations';



interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
    isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Try to load from local storage or default to 'en'
    const [language, setLanguageState] = useState<Language>(() => {
        const saved = localStorage.getItem('timrflow_language');
        // Basic validation
        if (saved === 'en' || saved === 'he' || saved === 'es') return saved;
        // Check browser preference if no saved preference
        if (typeof window !== 'undefined' && navigator.language.startsWith('he')) return 'he';
        if (typeof window !== 'undefined' && navigator.language.startsWith('es')) return 'es';
        return 'en';
    });

    const isRTL = language === 'he';

    useEffect(() => {
        localStorage.setItem('timrflow_language', language);
        document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
        document.documentElement.lang = language;
    }, [language, isRTL]);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
    };

    // Helper to get nested translation
    const t = (path: string): string => {
        const keys = path.split('.');
        let current: any = translations[language];

        for (const key of keys) {
            if (current[key] === undefined) {
                console.warn(`Translation missing for key: ${path} in language: ${language}`);
                // Fallback to English
                let fallback: any = translations['en'];
                for (const k of keys) {
                    if (fallback[k] === undefined) return path;
                    fallback = fallback[k];
                }
                return fallback;
            }
            current = current[key];
        }
        return current as string;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
