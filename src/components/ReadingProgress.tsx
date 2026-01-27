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
    // Optimized: Only re-render when text length changes (new file loaded)
    const { tokensLength } = useReaderStore(
        useShallow((state) => ({
            tokensLength: state.tokens.length,
        }))
    );

    const currentWordRef = useRef<HTMLElement>(null);
    const progressRef = useRef<HTMLElement>(null);
    const remainingTimeRef = useRef<HTMLElement>(null);
    const totalTimeRef = useRef<HTMLElement>(null);

    // Helper to imperatively update DOM nodes
    const updateStats = (currentIndex: number, wpm: number, length: number) => {
        const progress = length > 0 ? (currentIndex / length) * 100 : 0;
        const totalTime = length > 0 && wpm > 0 ? (length / wpm) * 60 : 0;
        const remainingTime = length > 0 && wpm > 0 ? ((length - currentIndex) / wpm) * 60 : 0;

        if (currentWordRef.current) currentWordRef.current.textContent = (currentIndex + 1).toString();
        if (progressRef.current) progressRef.current.textContent = `${progress.toFixed(0)}%`;
        if (remainingTimeRef.current) remainingTimeRef.current.textContent = formatTime(remainingTime);
        if (totalTimeRef.current) totalTimeRef.current.textContent = formatTime(totalTime);
    };

    // Subscribe to high-frequency changes
    useEffect(() => {
        const state = useReaderStore.getState();
        // Initial sync
        updateStats(state.currentIndex, state.wpm, state.tokens.length);

        const unsub = useReaderStore.subscribe((state, prevState) => {
            if (
                state.currentIndex !== prevState.currentIndex ||
                state.wpm !== prevState.wpm ||
                state.tokens.length !== prevState.tokens.length
            ) {
                updateStats(state.currentIndex, state.wpm, state.tokens.length);
            }
        });

        return unsub;
    }, []);

    // Get initial values for first render (SSR consistency / initial paint)
    const state = useReaderStore.getState();
    const initialIndex = state.currentIndex;
    const initialWpm = state.wpm;

    const initialProgress = tokensLength > 0 ? (initialIndex / tokensLength) * 100 : 0;
    const initialTotalTime = tokensLength > 0 && initialWpm > 0 ? (tokensLength / initialWpm) * 60 : 0;
    const initialRemainingTime = tokensLength > 0 && initialWpm > 0 ? ((tokensLength - initialIndex) / initialWpm) * 60 : 0;

    return (
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-400 bg-[#222] px-4 py-2 rounded-lg">
            <div className="flex items-center gap-4">
                <span>
                    Word <strong ref={currentWordRef} className="text-white" data-testid="current-word">{initialIndex + 1}</strong> of <strong className="text-white" data-testid="total-words">{tokensLength}</strong>
                </span>
                <span className="text-gray-600">|</span>
                <span>
                    <strong ref={progressRef} className="text-white" data-testid="progress-percentage">{initialProgress.toFixed(0)}%</strong> complete
                </span>
            </div>
            <div className="flex items-center gap-4">
                <span>
                    Remaining: <strong ref={remainingTimeRef} className="text-white" data-testid="remaining-time">{formatTime(initialRemainingTime)}</strong>
                </span>
                <span className="text-gray-600">|</span>
                <span>
                    Total: <strong ref={totalTimeRef} className="text-white" data-testid="total-time">{formatTime(initialTotalTime)}</strong>
                </span>
            </div>
        </div>
    );
};
