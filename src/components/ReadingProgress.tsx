import React, { useEffect, useRef } from 'react';
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
    // Optimization: Exclude currentIndex from the selector to prevent re-renders on every word
    const { tokensLength, wpm } = useReaderStore(
        useShallow((state) => ({
            tokensLength: state.tokens.length,
            wpm: state.wpm,
        }))
    );

    const currentWordRef = useRef<HTMLElement>(null);
    const progressRef = useRef<HTMLElement>(null);
    const remainingTimeRef = useRef<HTMLElement>(null);

    // Initial calculation for stable values (Total Time)
    const totalTime = tokensLength > 0 && wpm > 0 ? (tokensLength / wpm) * 60 : 0;

    // Effect to handle imperative updates for high-frequency state (currentIndex)
    useEffect(() => {
        const updateUI = () => {
            const state = useReaderStore.getState();
            const { currentIndex, tokens, wpm: currentWpm } = state;
            const len = tokens.length;

            if (currentWordRef.current) {
                currentWordRef.current.textContent = (currentIndex + 1).toString();
            }

            if (progressRef.current) {
                const prog = len > 0 ? (currentIndex / len) * 100 : 0;
                progressRef.current.textContent = `${prog.toFixed(0)}%`;
            }

            if (remainingTimeRef.current) {
                const remaining = len > 0 && currentWpm > 0 ? ((len - currentIndex) / currentWpm) * 60 : 0;
                remainingTimeRef.current.textContent = formatTime(remaining);
            }
        };

        // Initial imperative update to sync refs
        updateUI();

        // Subscribe to store changes
        const unsub = useReaderStore.subscribe((state, prevState) => {
            if (
                state.currentIndex !== prevState.currentIndex ||
                state.wpm !== prevState.wpm ||
                state.tokens.length !== prevState.tokens.length
            ) {
                updateUI();
            }
        });

        return unsub;
    }, []);

    // Calculate initial values for the first render (SSR/Hydration support)
    // Note: These are only used for the initial paint or when component re-renders due to wpm/tokensLength change
    const state = useReaderStore.getState();
    const initialIndex = state.currentIndex;
    const initialProgress = tokensLength > 0 ? (initialIndex / tokensLength) * 100 : 0;
    const initialRemaining = tokensLength > 0 && wpm > 0 ? ((tokensLength - initialIndex) / wpm) * 60 : 0;

    return (
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-400 bg-[#222] px-4 py-2 rounded-lg">
            <div className="flex items-center gap-4">
                <span>
                    Word <strong
                        ref={currentWordRef}
                        className="text-white"
                        data-testid="current-word"
                    >
                        {initialIndex + 1}
                    </strong> of <strong
                        className="text-white"
                        data-testid="total-words"
                    >
                        {tokensLength}
                    </strong>
                </span>
                <span className="text-gray-600">|</span>
                <span>
                    <strong
                        ref={progressRef}
                        className="text-white"
                        data-testid="progress-percent"
                    >
                        {initialProgress.toFixed(0)}%
                    </strong> complete
                </span>
            </div>
            <div className="flex items-center gap-4">
                <span>
                    Remaining: <strong
                        ref={remainingTimeRef}
                        className="text-white"
                        data-testid="remaining-time"
                    >
                        {formatTime(initialRemaining)}
                    </strong>
                </span>
                <span className="text-gray-600">|</span>
                <span>
                    Total: <strong
                        className="text-white"
                        data-testid="total-time"
                    >
                        {formatTime(totalTime)}
                    </strong>
                </span>
            </div>
        </div>
    );
};
