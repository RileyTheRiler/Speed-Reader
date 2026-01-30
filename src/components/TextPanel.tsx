import React, { useEffect, useRef, memo } from 'react';
import { useReaderStore } from '../store/useReaderStore';
import type { Token } from '../utils/tokenizer';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';

// Imperative styling constants
const ACTIVE_CLASSES = ['bg-blue-600', 'text-white', 'font-bold', 'scale-105'];
const INACTIVE_CLASSES = ['hover:bg-[#383838]'];

interface TokenSpanProps {
    token: Token;
    index: number;
    onTokenClick: (index: number) => void;
}

const TokenSpan = memo<TokenSpanProps>(({ token, index, onTokenClick }) => {
    // Note: This component is now static and only re-renders if token content changes.
    // Highlighting is handled imperatively by the parent TextPanel.
    return (
        <span
            data-index={index}
            className={`
                transition-colors duration-100 px-1 rounded cursor-pointer
                ${INACTIVE_CLASSES.join(' ')}
            `}
            onClick={() => onTokenClick(index)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onTokenClick(index);
                }
            }}
            role="button"
            tabIndex={0}
            aria-label={`Word ${index + 1}: ${token.text}`}
        >
            {token.text}{token.hasSpaceAfter ? ' ' : ''}
        </span>
    );
});

TokenSpan.displayName = 'TokenSpan';

interface TextPanelProps {
    variant?: 'side-panel' | 'embedded';
}

export const TextPanel: React.FC<TextPanelProps> = ({ variant = 'side-panel' }) => {
    // Select stable state using useShallow
    const {
        tokens,
        isSidePanelOpen,
        toggleSidePanel,
        setCurrentIndex,
        play,
        settings,
        isPlaying,
        getCurrentSentence,
        skipToNextSentence,
        skipToPrevSentence
    } = useReaderStore(
        useShallow((state) => ({
            tokens: state.tokens,
            // Exclude currentIndex to prevent re-renders on every tick
            isSidePanelOpen: state.isSidePanelOpen,
            toggleSidePanel: state.toggleSidePanel,
            setCurrentIndex: state.setCurrentIndex,
            play: state.play,
            settings: state.settings,
            isPlaying: state.isPlaying,
            getCurrentSentence: state.getCurrentSentence,
            skipToNextSentence: state.skipToNextSentence,
            skipToPrevSentence: state.skipToPrevSentence
        }))
    );

    const containerRef = useRef<HTMLDivElement>(null);
    const prevIndexRef = useRef<number>(-1);

    const {
        fontFamily,
        readingMode,
        backgroundColor,
        textColor,
    } = settings;

    const handleTokenClick = (index: number) => {
        setCurrentIndex(index);
        play();
    };

    // Imperative Update Logic for Highlighting
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const updateHighlight = (index: number) => {
            // Find currently active elements (cleanup safety)
            const activeEls = container.querySelectorAll('[aria-current="true"]');
            activeEls.forEach(el => {
                // Check if it matches current index to avoid flicker (optional optimization)
                if (el.getAttribute('data-index') !== String(index)) {
                    el.classList.remove(...ACTIVE_CLASSES);
                    el.classList.add(...INACTIVE_CLASSES);
                    el.removeAttribute('aria-current');
                }
            });

            // Add active styles to new index
            const curEl = container.querySelector(`[data-index="${index}"]`);
            if (curEl) {
                curEl.classList.remove(...INACTIVE_CLASSES);
                curEl.classList.add(...ACTIVE_CLASSES);
                curEl.setAttribute('aria-current', 'true');

                // Scroll into view
                curEl.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
            }
            prevIndexRef.current = index;
        };

        // Initial Sync
        const initialIndex = useReaderStore.getState().currentIndex;
        updateHighlight(initialIndex);

        // Subscribe to store updates
        const unsubscribe = useReaderStore.subscribe((state, prevState) => {
            if (state.currentIndex !== prevState.currentIndex) {
                updateHighlight(state.currentIndex);
            }
        });

        return unsubscribe;
    }, [tokens, isSidePanelOpen]); // Re-subscribe and re-sync when tokens (and thus the DOM list) change

    if (variant === 'side-panel' && !isSidePanelOpen) return null;

    if (tokens.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 h-full" style={{ backgroundColor, color: textColor }}>
                <span className="text-lg opacity-50">No text loaded</span>
            </div>
        );
    }

    // --- PAUSE OVERLAY (For RSVP Modes) ---
    // Only show if paused, not in pacer mode, and we have text
    // RESTRICTION: Only show in embedded mode. Side panel should always show text list.
    const showPauseOverlay = variant === 'embedded' && !isPlaying && readingMode !== 'pacer' && tokens.length > 0;

    if (showPauseOverlay) {
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
    }

    const baseClasses = variant === 'side-panel'
        ? "fixed inset-y-0 right-0 w-80 border-l shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out"
        : "w-full max-w-4xl mx-auto rounded-xl border shadow-xl flex flex-col h-[500px]";

    const fontStack = fontFamily === 'serif' ? 'font-serif' :
        fontFamily === 'mono' ? 'font-mono' : 'font-sans';

    const dysFont = fontFamily === 'dyslexic' ? 'OpenDyslexic' : undefined;

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
                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
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
};
