import React, { useRef, memo, useLayoutEffect } from 'react';
import { useReaderStore } from '../store/useReaderStore';
import { useShallow } from 'zustand/react/shallow';
import type { Token } from '../utils/tokenizer';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';

// Class names for imperative updates to avoid React re-renders
const BASE_CLASSES = 'transition-colors duration-100 px-1 rounded cursor-pointer';
const ACTIVE_CLASSES = ['bg-blue-600', 'text-white', 'font-bold', 'scale-105'];
const INACTIVE_CLASSES = ['hover:bg-[#383838]'];

interface TokenSpanProps {
    token: Token;
    index: number;
    isActive: boolean;
    onTokenClick: (index: number) => void;
}

const TokenSpan = memo<TokenSpanProps>(({ token, index, isActive, onTokenClick }) => {
    // Initial render respects the prop, subsequent updates are handled via DOM manipulation in ReadingView
    const activeClass = isActive ? ACTIVE_CLASSES.join(' ') : INACTIVE_CLASSES.join(' ');

    return (
        <span
            data-index={index}
            className={`${BASE_CLASSES} ${activeClass}`}
            onClick={() => onTokenClick(index)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onTokenClick(index);
                }
            }}
            role="button"
            tabIndex={0}
            aria-current={isActive ? 'true' : undefined}
            aria-label={`Word ${index + 1}: ${token.text}`}
        >
            {token.text}{token.hasSpaceAfter ? ' ' : ''}
        </span>
    );
});

TokenSpan.displayName = 'TokenSpan';

// --- Pause Overlay Component ---
const PauseOverlay = memo(() => {
    const {
        settings,
        play,
        getCurrentSentence,
        skipToNextSentence,
        skipToPrevSentence
    } = useReaderStore(useShallow(state => ({
        settings: state.settings,
        play: state.play,
        getCurrentSentence: state.getCurrentSentence,
        skipToNextSentence: state.skipToNextSentence,
        skipToPrevSentence: state.skipToPrevSentence,
        // We need currentIndex implicitly for getCurrentSentence, but useReaderStore selector
        // logic is tricky with functions. Zustand functions access state via get().
        // BUT PauseOverlay needs to re-render when currentIndex changes (to show new sentence).
        // So we MUST subscribe to currentIndex.
        currentIndex: state.currentIndex
    })));

    const { backgroundColor, textColor, fontFamily } = settings;
    const sentence = getCurrentSentence();

    return (
        <div
            className="w-full h-full flex flex-col items-center justify-center p-8 relative transition-all"
            style={{ backgroundColor, color: textColor }}
        >
            {/* Sentence Context */}
            <div className="mb-8 text-center max-w-2xl animate-fade-in px-6 py-8 bg-black/20 rounded-xl backdrop-blur-sm border border-white/5 shadow-2xl">
                <p
                    className="text-xl md:text-2xl leading-relaxed italic opacity-90"
                    style={{ fontFamily: fontFamily === 'dyslexic' ? 'OpenDyslexic' : undefined }}
                >
                    "{sentence}"
                </p>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center gap-8">
                <button
                    onClick={skipToPrevSentence}
                    className="p-4 rounded-full bg-white/5 hover:bg-white/10 transition-all hover:scale-110 active:scale-95 group border border-white/5"
                    title="Previous Sentence"
                    aria-label="Previous Sentence"
                >
                    <ChevronLeft size={32} className="group-hover:-translate-x-1 transition-transform opacity-70 group-hover:opacity-100" />
                </button>

                <button
                    onClick={play}
                    className="px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg shadow-lg hover:shadow-blue-500/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
                >
                    <Play size={24} fill="currentColor" />
                    RESUME
                </button>

                <button
                    onClick={skipToNextSentence}
                    className="p-4 rounded-full bg-white/5 hover:bg-white/10 transition-all hover:scale-110 active:scale-95 group border border-white/5"
                    title="Next Sentence"
                    aria-label="Next Sentence"
                >
                    <ChevronRight size={32} className="group-hover:translate-x-1 transition-transform opacity-70 group-hover:opacity-100" />
                </button>
            </div>

            <div className="absolute bottom-6 text-xs opacity-30 uppercase tracking-[0.2em] font-medium">
                Paused
            </div>
        </div>
    );
});
PauseOverlay.displayName = 'PauseOverlay';

// --- Reading View Component (Optimized) ---
interface ReadingViewProps {
    variant: 'side-panel' | 'embedded';
}

const ReadingView = memo(({ variant }: ReadingViewProps) => {
    const {
        tokens,
        settings,
        toggleSidePanel,
        setCurrentIndex
    } = useReaderStore(useShallow(state => ({
        tokens: state.tokens,
        settings: state.settings,
        toggleSidePanel: state.toggleSidePanel,
        setCurrentIndex: state.setCurrentIndex
    })));

    const containerRef = useRef<HTMLDivElement>(null);
    // Track the currently active index ref to avoid closures issues
    const activeIndexRef = useRef<number>(useReaderStore.getState().currentIndex);

    const {
        fontFamily,
        backgroundColor,
        textColor,
    } = settings;

    const handleTokenClick = (index: number) => {
        const { play } = useReaderStore.getState();
        setCurrentIndex(index);
        play();
    };

    // Helper to update token styles
    const updateTokenStyle = (element: Element | null, active: boolean) => {
        if (!element) return;

        if (active) {
            element.classList.remove(...INACTIVE_CLASSES);
            element.classList.add(...ACTIVE_CLASSES);
            element.setAttribute('aria-current', 'true');
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        } else {
            element.classList.remove(...ACTIVE_CLASSES);
            element.classList.add(...INACTIVE_CLASSES);
            element.removeAttribute('aria-current');
        }
    };

    // Initial Sync and Subscription
    useLayoutEffect(() => {
        // Initial highlight
        const initialIndex = useReaderStore.getState().currentIndex;
        activeIndexRef.current = initialIndex;

        const currentEl = containerRef.current?.querySelector(`[data-index="${initialIndex}"]`);
        if (currentEl) updateTokenStyle(currentEl, true);

        // Subscribe to store changes
        const unsubscribe = useReaderStore.subscribe((state, prevState) => {
            const newIndex = state.currentIndex;
            const oldIndex = prevState.currentIndex;

            if (newIndex !== oldIndex) {
                // Update DOM
                if (containerRef.current) {
                    const prevEl = containerRef.current.querySelector(`[data-index="${oldIndex}"]`);
                    const nextEl = containerRef.current.querySelector(`[data-index="${newIndex}"]`);

                    updateTokenStyle(prevEl, false);
                    updateTokenStyle(nextEl, true);
                }
                activeIndexRef.current = newIndex;
            }
        });

        return () => {
            unsubscribe();
        };
    }, [tokens]); // Re-run if tokens change (new list rendered)

    // Pacer Mode handling is covered by the subscription above (it updates styles and scrolls)

    const baseClasses = variant === 'side-panel'
        ? "fixed inset-y-0 right-0 w-80 border-l shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out"
        : "w-full max-w-4xl mx-auto rounded-xl border shadow-xl flex flex-col h-[500px]";

    const fontStack = fontFamily === 'serif' ? 'font-serif' :
        fontFamily === 'mono' ? 'font-mono' : 'font-sans';

    const dysFont = fontFamily === 'dyslexic' ? 'OpenDyslexic' : undefined;

    // We capture the initial index for the first render
    const renderTimeIndex = useReaderStore.getState().currentIndex;

    return (
        <div
            className={`${baseClasses} border-[#444]`}
            style={{ backgroundColor, color: textColor }}
            role="complementary"
            aria-label="Text panel"
        >
            {variant === 'side-panel' && (
                <div className="p-4 border-b border-[#444] flex justify-between items-center bg-black/20">
                    <h2 className="font-bold text-lg">Text View</h2>
                    <button
                        onClick={toggleSidePanel}
                        className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
                        aria-label="Close text panel"
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                        </svg>
                    </button>
                </div>
            )}

            <div
                ref={containerRef}
                className={`flex-1 overflow-y-auto p-6 leading-loose text-lg ${fontStack}`}
                style={{ fontFamily: dysFont }}
            >
                <div className="flex flex-wrap gap-1" role="list" aria-label="Words">
                    {tokens.map((token, index) => (
                        <TokenSpan
                            key={token.id}
                            token={token}
                            index={index}
                            isActive={index === renderTimeIndex}
                            onTokenClick={handleTokenClick}
                        />
                    ))}
                </div>
            </div>

            <div className="p-3 border-t border-[#444] bg-black/20 text-xs opacity-50">
                Click any word to jump to it and resume playback.
            </div>
        </div>
    );
});
ReadingView.displayName = 'ReadingView';

// --- Main TextPanel Component ---
interface TextPanelProps {
    variant?: 'side-panel' | 'embedded';
}

export const TextPanel: React.FC<TextPanelProps> = ({ variant = 'side-panel' }) => {
    const {
        isSidePanelOpen,
        isPlaying,
        readingMode,
        tokensLength,
        backgroundColor,
        textColor
    } = useReaderStore(useShallow(state => ({
        isSidePanelOpen: state.isSidePanelOpen,
        isPlaying: state.isPlaying,
        readingMode: state.settings.readingMode,
        tokensLength: state.tokens.length,
        backgroundColor: state.settings.backgroundColor,
        textColor: state.settings.textColor
    })));

    // Early return for side panel visibility
    if (variant === 'side-panel' && !isSidePanelOpen) return null;

    if (tokensLength === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 h-full" style={{ backgroundColor, color: textColor }}>
                <span className="text-lg opacity-50">No text loaded</span>
            </div>
        );
    }

    // Check if we should show Pause Overlay
    // We only show it in embedded mode (if ever), not in the side panel where we want to see the list
    const showPauseOverlay = !isPlaying && readingMode !== 'pacer' && tokensLength > 0 && variant !== 'side-panel';

    if (showPauseOverlay) {
        return <PauseOverlay />;
    }

    return <ReadingView variant={variant} />;
};
