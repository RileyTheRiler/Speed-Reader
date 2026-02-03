import React, { useEffect, useLayoutEffect, useRef, memo } from 'react';
import { useReaderStore } from '../store/useReaderStore';
import { useShallow } from 'zustand/react/shallow';
import type { Token } from '../utils/tokenizer';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';

interface TokenSpanProps {
    token: Token;
    index: number;
    isActive: boolean;
    onTokenClick: (index: number) => void;
}

const INACTIVE_CLASS = "transition-colors duration-100 px-1 rounded cursor-pointer hover:bg-[#383838]";
const ACTIVE_CLASS = "transition-colors duration-100 px-1 rounded cursor-pointer bg-blue-600 text-white font-bold scale-105";

const TokenSpan = memo<TokenSpanProps>(({ token, index, isActive, onTokenClick }) => {
    const ref = useRef<HTMLSpanElement>(null);

    // Initial scroll handling still useful for non-playback jumps
    useEffect(() => {
        if (isActive && ref.current) {
            ref.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [isActive]);

    return (
        <span
            ref={ref}
            className={isActive ? ACTIVE_CLASS : INACTIVE_CLASS}
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
            data-index={index}
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
    // Optimized: Exclude currentIndex when playing to prevent re-renders
    const {
        tokens,
        currentIndex,
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
            // When playing, hide currentIndex from React to prevent re-renders on every tick
            currentIndex: state.isPlaying ? null : state.currentIndex,
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
    // Keep track of the last imperatively active index to clean up efficiently
    const activeIndexRef = useRef<number | null>(null);

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

    // Imperative DOM Update Logic
    const updateActiveWord = (index: number) => {
        if (!containerRef.current) return;

        // 1. Remove active state from previous
        if (activeIndexRef.current !== null && activeIndexRef.current !== index) {
            const prev = containerRef.current.querySelector(`[data-index="${activeIndexRef.current}"]`);
            if (prev) {
                prev.removeAttribute('aria-current');
                prev.className = INACTIVE_CLASS;
            }
        } else {
             // Fallback cleanup if ref desyncs
             const prev = containerRef.current.querySelector('[aria-current="true"]');
             if (prev && prev.getAttribute('data-index') !== String(index)) {
                 prev.removeAttribute('aria-current');
                 prev.className = INACTIVE_CLASS;
             }
        }

        // 2. Add active state to new
        const next = containerRef.current.querySelector(`[data-index="${index}"]`);
        if (next) {
             next.setAttribute('aria-current', 'true');
             next.className = ACTIVE_CLASS;
             activeIndexRef.current = index;

             // Scroll logic
             // Throttle scroll? Native smooth scroll is usually fine but can be heavy.
             // Only scroll if needed?
             // For now, keep existing behavior: center it.
             next.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    };

    // Subscription for high-frequency updates
    useEffect(() => {
        // Sync initial state if playing
        const state = useReaderStore.getState();
        if (state.isPlaying) {
             updateActiveWord(state.currentIndex);
        }

        const unsub = useReaderStore.subscribe((state, prevState) => {
            // Only handle index changes imperatively
            if (state.currentIndex !== prevState.currentIndex) {
                // If we are showing the TextPanel (which depends on readingMode/variant)
                // We should update.
                // Note: If component is unmounted, this effect cleanup runs, so safe.
                updateActiveWord(state.currentIndex);
            }
        });

        return () => {
            unsub();
        };
    }, []);

    // Restore imperative state after React re-renders (e.g. settings change during play)
    useLayoutEffect(() => {
        if (isPlaying) {
            const current = useReaderStore.getState().currentIndex;
            updateActiveWord(current);
        }
    });

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
    const showPauseOverlay = !isPlaying && readingMode !== 'pacer' && tokens.length > 0;

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
                            isActive={currentIndex === null ? false : index === currentIndex}
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
