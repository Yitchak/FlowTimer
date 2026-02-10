export const speak = (text: string, lang: string = 'en', volume: number = 1.0): void => {
    if (!('speechSynthesis' in window)) return;

    // Stop any current speech
    stop();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'he' ? 'he-IL' : 'en-US';
    utterance.volume = Math.min(Math.max(volume, 0), 1);
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.0;

    window.speechSynthesis.speak(utterance);
};

export const stop = (): void => {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
};

export const isSpeaking = (): boolean => {
    if (!('speechSynthesis' in window)) return false;
    return window.speechSynthesis.speaking;
};

export const isSupported = (): boolean => {
    return 'speechSynthesis' in window;
};
