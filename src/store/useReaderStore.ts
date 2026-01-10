import { create } from 'zustand';
import type { Token } from '../utils/tokenizer';
import { tokenize } from '../utils/tokenizer';
import { sanitizeInput } from '../utils/security';

interface ReaderState {
    inputText: string;
    tokens: Token[];
    currentIndex: number;
    isPlaying: boolean;
    isRecording: boolean;
    wpm: number;
    settings: {
        chunkSize: number;
        fontSize: number;
        showRedicle: boolean;
        pauseAtEndOfSentence: boolean;
        backgroundColor: string;
        textColor: string;
        highlightColor: string;
        aspectRatio: '16:9' | '9:16';
    };

    // Actions
    setInputText: (text: string) => void;
    setTokens: (tokens: Token[]) => void;
    setWpm: (wpm: number) => void;
    play: () => void;
    pause: () => void;
    reset: () => void;
    setIsRecording: (isRecording: boolean) => void;
    setCurrentIndex: (index: number) => void;
    updateSettings: (settings: Partial<ReaderState['settings']>) => void;

    isSidePanelOpen: boolean;
    toggleSidePanel: () => void;
}

export const useReaderStore = create<ReaderState>((set, get) => ({
    inputText: '',
    tokens: [],
    currentIndex: 0,
    isPlaying: false,
    isRecording: false,
    wpm: 300,
    settings: {
        chunkSize: 1,
        fontSize: 64,
        showRedicle: true,
        pauseAtEndOfSentence: false,
        backgroundColor: '#1a1a1a',
        textColor: '#e5e5e5',
        highlightColor: '#ff4444',
        aspectRatio: '16:9',
    },

    setInputText: (text) => {
        const safeText = sanitizeInput(text);
        const tokens = tokenize(safeText);
        set({ inputText: safeText, tokens, currentIndex: 0, isPlaying: false, isRecording: false });
    },

    setTokens: (tokens) => set({ tokens }),

    setWpm: (wpm) => set({ wpm }),

    play: () => set({ isPlaying: true }),

    pause: () => set({ isPlaying: false }),

    reset: () => set({ currentIndex: 0, isPlaying: false, isRecording: false }),

    setIsRecording: (isRecording) => set({ isRecording }),

    setCurrentIndex: (index) => set({ currentIndex: index }),

    updateSettings: (newSettings) => {
        set((state) => ({
            settings: { ...state.settings, ...newSettings }
        }));
        // Re-tokenize if chunk size changes
        const state = get();
        if (newSettings.chunkSize && newSettings.chunkSize !== state.settings.chunkSize) {
            state.setInputText(state.inputText);
        }
    },

    isSidePanelOpen: false,
    toggleSidePanel: () => set((state) => ({ isSidePanelOpen: !state.isSidePanelOpen }))
}));
