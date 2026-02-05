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
    const currentWordRef = useRef<HTMLElement>(null);
    const progressRef = useRef<HTMLElement>(null);
    const remainingTimeRef = useRef<HTMLElement>(null);

    // Optimized: Exclude currentIndex to prevent re-renders on every word change
    const { tokensLength, wpm } = useReaderStore(
        useShallow((state) => ({
            tokensLength: state.tokens.length,
            wpm: state.wpm,
        }))
    );

    // Initial calculation for static parts (Total Time)
    const totalTime = tokensLength > 0 && wpm > 0 ? (tokensLength / wpm) * 60 : 0;

    // Use useLayoutEffect to update DOM imperatively and restore state after re-renders
    useLayoutEffect(() => {
        const updateDOM = (currentIndex: number) => {
             const progress = tokensLength > 0 ? (currentIndex / tokensLength) * 100 : 0;
             const remainingTime = tokensLength > 0 && wpm > 0 ? ((tokensLength - currentIndex) / wpm) * 60 : 0;

             if (currentWordRef.current) {
                 currentWordRef.current.textContent = (currentIndex + 1).toString();
             }
             if (progressRef.current) {
                 progressRef.current.textContent = `${progress.toFixed(0)}%`;
             }
             if (remainingTimeRef.current) {
                 remainingTimeRef.current.textContent = formatTime(remainingTime);
             }
        };

        // Initialize immediately to ensure consistent state
        const state = useReaderStore.getState();
        updateDOM(state.currentIndex);

        // Subscribe to changes
        const unsub = useReaderStore.subscribe((state, prevState) => {
            if (state.currentIndex !== prevState.currentIndex) {
                updateDOM(state.currentIndex);
            }
        });

        return unsub;
    }, [tokensLength, wpm]); // Re-subscribe if calculation parameters change

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
