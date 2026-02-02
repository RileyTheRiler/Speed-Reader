import React, { useRef, useLayoutEffect } from 'react';
import { useReaderStore } from '../store/useReaderStore';
import { useShallow } from 'zustand/react/shallow';

const formatTime = (seconds: number): string => {
    if (seconds < 60) {
        return `${Math.round(seconds)}s`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}m ${secs}s`;
};

export const ReadingProgress: React.FC = () => {
    // Optimization: Exclude currentIndex from selector to prevent re-renders on every word
    const { tokensLength, wpm } = useReaderStore(
        useShallow((state) => ({
            tokensLength: state.tokens.length,
            wpm: state.wpm,
        }))
    );

    const currentWordRef = useRef<HTMLElement>(null);
    const progressRef = useRef<HTMLElement>(null);
    const remainingTimeRef = useRef<HTMLElement>(null);

    // Use layout effect to ensure DOM is updated immediately after render and on subscription
    useLayoutEffect(() => {
        const updateUI = () => {
            const state = useReaderStore.getState();
            const { currentIndex, tokens, wpm } = state;
            const len = tokens.length;

            if (currentWordRef.current) {
                currentWordRef.current.textContent = `${currentIndex + 1}`;
            }

            if (progressRef.current) {
                const progress = len > 0 ? (currentIndex / len) * 100 : 0;
                progressRef.current.textContent = `${progress.toFixed(0)}%`;
            }

            if (remainingTimeRef.current) {
                const remaining = len > 0 && wpm > 0 ? ((len - currentIndex) / wpm) * 60 : 0;
                remainingTimeRef.current.textContent = formatTime(remaining);
            }
        };

        // Initial update on mount/render
        updateUI();

        // Subscribe to store changes
        const unsub = useReaderStore.subscribe((state, prevState) => {
            // Only update if relevant values change
            if (state.currentIndex !== prevState.currentIndex ||
                state.wpm !== prevState.wpm ||
                state.tokens.length !== prevState.tokens.length) {
                updateUI();
            }
        });

        return unsub;
    }, [tokensLength, wpm]); // Re-run effect if these stable props change to ensure sync

    const totalTime = tokensLength > 0 && wpm > 0 ? (tokensLength / wpm) * 60 : 0;

    return (
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-400 bg-[#222] px-4 py-2 rounded-lg">
            <div className="flex items-center gap-4">
                <span>
                    Word <strong ref={currentWordRef} className="text-white" data-testid="current-word">1</strong> of <strong className="text-white" data-testid="total-words">{tokensLength}</strong>
                </span>
                <span className="text-gray-600">|</span>
                <span>
                    <strong ref={progressRef} className="text-white" data-testid="progress-percent">0%</strong> complete
                </span>
            </div>
            <div className="flex items-center gap-4">
                <span>
                    Remaining: <strong ref={remainingTimeRef} className="text-white" data-testid="remaining-time">0s</strong>
                </span>
                <span className="text-gray-600">|</span>
                <span>
                    Total: <strong className="text-white">{formatTime(totalTime)}</strong>
                </span>
            </div>
        </div>
    );
};
