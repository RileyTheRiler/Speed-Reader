import React, { useEffect, useRef, useCallback } from 'react';
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
    // Optimization: Exclude currentIndex from selector to prevent re-renders on every word change.
    // tokensLength and wpm change rarely.
    const { tokensLength, wpm } = useReaderStore(
        useShallow((state) => ({
            tokensLength: state.tokens.length,
            wpm: state.wpm,
        }))
    );

    const wordCountRef = useRef<HTMLElement>(null);
    const progressRef = useRef<HTMLElement>(null);
    const remainingTimeRef = useRef<HTMLElement>(null);

    // Helper to calculate and update DOM
    const updateStats = useCallback((currentIndex: number) => {
        if (tokensLength === 0) return;

        // Update Word Count
        if (wordCountRef.current) {
            wordCountRef.current.textContent = (currentIndex + 1).toString();
        }

        // Update Progress %
        if (progressRef.current) {
            const progress = (currentIndex / tokensLength) * 100;
            progressRef.current.textContent = `${progress.toFixed(0)}%`;
        }

        // Update Remaining Time
        if (remainingTimeRef.current && wpm > 0) {
            const remaining = ((tokensLength - currentIndex) / wpm) * 60;
            remainingTimeRef.current.textContent = formatTime(remaining);
        }
    }, [tokensLength, wpm]);

    // Initial sync and Subscription
    useEffect(() => {
        // Initial update with current state
        const state = useReaderStore.getState();
        updateStats(state.currentIndex);

        // Subscribe to store changes
        const unsub = useReaderStore.subscribe((state, prevState) => {
            if (state.currentIndex !== prevState.currentIndex) {
                updateStats(state.currentIndex);
            }
        });

        return unsub;
    }, [updateStats]);

    // Calculate static values for render
    const totalTime = tokensLength > 0 && wpm > 0 ? (tokensLength / wpm) * 60 : 0;

    // Initial values for SSR/First render (though effect will quickly update them)
    const initialIndex = useReaderStore.getState().currentIndex;
    const initialProgress = tokensLength > 0 ? (initialIndex / tokensLength) * 100 : 0;
    const initialRemaining = tokensLength > 0 && wpm > 0 ? ((tokensLength - initialIndex) / wpm) * 60 : 0;

    return (
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-400 bg-[#222] px-4 py-2 rounded-lg">
            <div className="flex items-center gap-4">
                <span>
                    Word <strong ref={wordCountRef} className="text-white">{initialIndex + 1}</strong> of <strong className="text-white">{tokensLength}</strong>
                </span>
                <span className="text-gray-600">|</span>
                <span>
                    <strong ref={progressRef} className="text-white">{initialProgress.toFixed(0)}%</strong> complete
                </span>
            </div>
            <div className="flex items-center gap-4">
                <span>
                    Remaining: <strong ref={remainingTimeRef} className="text-white">{formatTime(initialRemaining)}</strong>
                </span>
                <span className="text-gray-600">|</span>
                <span>
                    Total: <strong className="text-white">{formatTime(totalTime)}</strong>
                </span>
            </div>
        </div>
    );
};
