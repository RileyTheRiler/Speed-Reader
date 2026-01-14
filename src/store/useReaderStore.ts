import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Token } from '../utils/tokenizer';
import { tokenize } from '../utils/tokenizer';
import { sanitizeInput } from '../utils/security';

interface ReaderSettings {
    chunkSize: number;
    fontSize: number;
    showReticle: boolean;
    pauseAtEndOfSentence: boolean;
    backgroundColor: string;
    textColor: string;
    highlightColor: string;
    aspectRatio: '16:9' | '9:16';
    fontFamily: 'sans' | 'serif' | 'mono' | 'dyslexic';
    readingMode: 'rsvp' | 'pacer';
    smartChunking: boolean; // "Chunking Mode" - uses NLP to split phrases
    peripheralMode: boolean; // "Peripheral Trainer" - fades outer words
    bionicReading: boolean; // "Bionic Reading" - bolds first half
    smartRewind: boolean; // Rewind on pause
    punctuationPause: boolean; // Pause at commas/periods
}

interface ReaderState {
    // Text & tokens
    inputText: string;
    tokens: Token[];
    currentIndex: number;

    // Playback state
    isPlaying: boolean;
    isRecording: boolean;
    isFullscreen: boolean;
    wpm: number;

    isSidePanelOpen: boolean;
    isSettingsOpen: boolean;
    isSummaryOpen: boolean;
    showInput: boolean;
    isZenMode: boolean;

    // Auto-Summary State
    summary: string | null;
    isGeneratingSummary: boolean;
    apiKey: string | null;

    // Settings (persisted)
    settings: ReaderSettings;

    // Actions
    setInputText: (text: string) => void;
    setTokens: (tokens: Token[]) => void;
    setWpm: (wpm: number) => void;
    play: () => void;
    pause: () => void;
    togglePlay: () => void;
    reset: () => void;
    setIsRecording: (isRecording: boolean) => void;
    setCurrentIndex: (index: number) => void;
    updateSettings: (settings: Partial<ReaderSettings>) => void;
    toggleSidePanel: () => void;
    toggleSettings: () => void;
    toggleZenMode: () => void;
    toggleSummary: () => void;
    setShowInput: (show: boolean) => void;
    setIsFullscreen: (isFullscreen: boolean) => void;

    // Auto-Summary Actions
    setApiKey: (key: string | null) => void;
    setSummary: (summary: string | null) => void;
    setIsGeneratingSummary: (isGenerating: boolean) => void;

    // Skip controls
    skipForward: (count?: number) => void;
    skipBackward: (count?: number) => void;
    skipToNextSentence: () => void;
    skipToPrevSentence: () => void;

    // Computed helpers
    getEstimatedTime: () => number;
    getRemainingTime: () => number;
    getProgress: () => number;
}

export const useReaderStore = create<ReaderState>()(
    persist(
        (set, get) => ({
            inputText: '',
            tokens: [],
            currentIndex: 0,
            isPlaying: false,
            isRecording: false,
            isFullscreen: false,
            wpm: 300,
            isSidePanelOpen: false,
            isSettingsOpen: false,
            isSummaryOpen: false, // Added
            showInput: true,
            isZenMode: false,

            summary: null,
            isGeneratingSummary: false,
            apiKey: null,

            settings: {
                chunkSize: 1,
                fontSize: 64,
                showReticle: true,
                pauseAtEndOfSentence: false,
                backgroundColor: '#1a1a1a',
                textColor: '#e5e5e5',
                highlightColor: '#ff4444',
                aspectRatio: '16:9',
                fontFamily: 'sans',
                readingMode: 'rsvp',
                smartChunking: false,
                peripheralMode: false,
                bionicReading: false,
                smartRewind: false,
                punctuationPause: false,
            },

            setInputText: (text) => {
                const { settings } = get();
                const sanitizedText = sanitizeInput(text);
                const tokens = tokenize(sanitizedText, settings.chunkSize, settings.smartChunking);
                set({ inputText: sanitizedText, tokens, currentIndex: 0, isPlaying: false, isRecording: false });
            },

            setTokens: (tokens) => set({ tokens }),

            setWpm: (wpm) => set({ wpm: Math.max(100, Math.min(1000, wpm)) }),

            play: () => set({ isPlaying: true }),

            pause: () => {
                const { settings, currentIndex } = get();
                set({ isPlaying: false });

                if (settings.smartRewind) {
                    const newIndex = Math.max(0, currentIndex - 5);
                    set({ currentIndex: newIndex });
                }
            },

            togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

            reset: () => set({ currentIndex: 0, isPlaying: false, isRecording: false }),

            setIsRecording: (isRecording) => set({ isRecording }),

            setCurrentIndex: (index) => set({ currentIndex: index }),

            updateSettings: (newSettings) => {
                set((state) => ({
                    settings: { ...state.settings, ...newSettings }
                }));
                const state = get();
                if (
                    (newSettings.chunkSize && newSettings.chunkSize !== state.settings.chunkSize) ||
                    (newSettings.smartChunking !== undefined && newSettings.smartChunking !== state.settings.smartChunking)
                ) {
                    state.setInputText(state.inputText);
                }
            },

            toggleSidePanel: () => set((state) => ({ isSidePanelOpen: !state.isSidePanelOpen })),
            toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),
            toggleZenMode: () => set((state) => ({ isZenMode: !state.isZenMode })),
            toggleSummary: () => set((state) => ({ isSummaryOpen: !state.isSummaryOpen })),

            setShowInput: (show) => set({ showInput: show }),

            setIsFullscreen: (isFullscreen) => set({ isFullscreen }),

            setApiKey: (apiKey) => set({ apiKey }),
            setSummary: (summary) => set({ summary }),
            setIsGeneratingSummary: (isGeneratingSummary) => set({ isGeneratingSummary }),

            // Skip controls
            skipForward: (count = 5) => {
                const { currentIndex, tokens } = get();
                const newIndex = Math.min(currentIndex + count, tokens.length - 1);
                set({ currentIndex: newIndex });
            },

            skipBackward: (count = 5) => {
                const { currentIndex } = get();
                const newIndex = Math.max(currentIndex - count, 0);
                set({ currentIndex: newIndex });
            },

            skipToNextSentence: () => {
                const { currentIndex, tokens } = get();
                for (let i = currentIndex + 1; i < tokens.length; i++) {
                    if (tokens[i - 1]?.isSentenceEnd) {
                        set({ currentIndex: i });
                        return;
                    }
                }
                // If no next sentence, go to end
                set({ currentIndex: tokens.length - 1 });
            },

            skipToPrevSentence: () => {
                const { currentIndex, tokens } = get();
                // Find the start of current sentence first
                let sentenceStart = currentIndex;
                for (let i = currentIndex - 1; i >= 0; i--) {
                    if (tokens[i]?.isSentenceEnd) {
                        sentenceStart = i + 1;
                        break;
                    }
                    if (i === 0) sentenceStart = 0;
                }

                // If we're at the start of a sentence, go to previous sentence
                if (sentenceStart === currentIndex || currentIndex - sentenceStart <= 1) {
                    for (let i = sentenceStart - 2; i >= 0; i--) {
                        if (tokens[i]?.isSentenceEnd) {
                            set({ currentIndex: i + 1 });
                            return;
                        }
                    }
                    set({ currentIndex: 0 });
                } else {
                    // Go to start of current sentence
                    set({ currentIndex: sentenceStart });
                }
            },

            // Computed helpers
            getEstimatedTime: () => {
                const { tokens, wpm } = get();
                if (tokens.length === 0 || wpm === 0) return 0;
                return (tokens.length / wpm) * 60; // seconds
            },

            getRemainingTime: () => {
                const { tokens, currentIndex, wpm } = get();
                if (tokens.length === 0 || wpm === 0) return 0;
                const remaining = tokens.length - currentIndex;
                return (remaining / wpm) * 60; // seconds
            },

            getProgress: () => {
                const { tokens, currentIndex } = get();
                if (tokens.length === 0) return 0;
                return (currentIndex / tokens.length) * 100;
            },
        }),
        {
            name: 'hypersonic-reader-settings',
            partialize: (state) => ({
                wpm: state.wpm,
                settings: state.settings,
            }),
        }
    )
);
