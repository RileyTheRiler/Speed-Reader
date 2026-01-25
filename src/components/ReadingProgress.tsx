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
    // Optimized: Only re-render when structural data changes (tokens length)
    // currentIndex and wpm are handled imperatively to avoid re-renders
    const { tokensLength } = useReaderStore(
        useShallow((state) => ({
            tokensLength: state.tokens.length,
        }))
    );

    const currentIndexRef = useRef<HTMLElement>(null);
    const progressRef = useRef<HTMLElement>(null);
    const remainingTimeRef = useRef<HTMLElement>(null);
    const totalTimeRef = useRef<HTMLElement>(null);

    useEffect(() => {
        // Direct DOM manipulation for high-frequency updates
        const updateProgress = () => {
            const state = useReaderStore.getState();
            const { currentIndex, tokens, wpm } = state;
            const len = tokens.length;

            if (currentIndexRef.current) {
                currentIndexRef.current.textContent = String(currentIndex + 1);
            }

            if (progressRef.current) {
                const progress = len > 0 ? (currentIndex / len) * 100 : 0;
                progressRef.current.textContent = `${progress.toFixed(0)}%`;
            }

            if (remainingTimeRef.current) {
                const remaining = len > 0 && wpm > 0 ? ((len - currentIndex) / wpm) * 60 : 0;
                remainingTimeRef.current.textContent = formatTime(remaining);
            }

            if (totalTimeRef.current) {
                const total = len > 0 && wpm > 0 ? (len / wpm) * 60 : 0;
                totalTimeRef.current.textContent = formatTime(total);
            }
        };

        // Initial sync
        updateProgress();

        // Subscribe to store updates
        const unsubscribe = useReaderStore.subscribe((state, prevState) => {
            if (
                state.currentIndex !== prevState.currentIndex ||
                state.wpm !== prevState.wpm ||
                state.tokens.length !== prevState.tokens.length
            ) {
                updateProgress();
            }
        });

        return unsubscribe;
    }, []);

    return (
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-400 bg-[#222] px-4 py-2 rounded-lg">
            <div className="flex items-center gap-4">
                <span>
                    Word <strong ref={currentIndexRef} className="text-white" data-testid="progress-word-count">1</strong> of <strong className="text-white">{tokensLength}</strong>
                </span>
                <span className="text-gray-600">|</span>
                <span>
                    <strong ref={progressRef} className="text-white" data-testid="progress-percent">0%</strong> complete
                </span>
            </div>
            <div className="flex items-center gap-4">
                <span>
                    Remaining: <strong ref={remainingTimeRef} className="text-white" data-testid="progress-remaining">0s</strong>
                </span>
                <span className="text-gray-600">|</span>
                <span>
                    Total: <strong ref={totalTimeRef} className="text-white">0s</strong>
                </span>
            </div>
        </div>
    );
};
