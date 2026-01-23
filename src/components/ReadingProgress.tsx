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
    // Performance Optimization: Exclude currentIndex from the selector to prevent re-renders on every word change.
    // Instead, we subscribe to the store and update the DOM directly via refs.
    const { tokensLength, wpm } = useReaderStore(
        useShallow((state) => ({
            tokensLength: state.tokens.length,
            wpm: state.wpm,
        }))
    );

    const currentWordRef = useRef<HTMLElement>(null);
    const progressRef = useRef<HTMLElement>(null);
    const remainingTimeRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const updateProgress = () => {
            const state = useReaderStore.getState();
            const { currentIndex } = state;

            // Note: We use the tokensLength and wpm from the closure (props) which are kept in sync by the parent effect dependency,
            // but getting them from state ensures we always have the absolute latest if they changed without triggering a re-render yet (unlikely).
            // Actually, mixing them is fine. Let's use the values from the effect scope (props) for consistency with the layout.
            // Wait, inside the subscription callback, 'tokensLength' will be the value from when the effect was created.
            // If tokensLength changes, the effect re-runs, so 'tokensLength' is fresh.

            if (currentWordRef.current) {
                currentWordRef.current.textContent = String(currentIndex + 1);
            }

            if (progressRef.current) {
                const progress = tokensLength > 0 ? (currentIndex / tokensLength) * 100 : 0;
                progressRef.current.textContent = `${progress.toFixed(0)}%`;
            }

            if (remainingTimeRef.current) {
                const remainingTime = tokensLength > 0 && wpm > 0 ? ((tokensLength - currentIndex) / wpm) * 60 : 0;
                remainingTimeRef.current.textContent = formatTime(remainingTime);
            }
        };

        // Initial update
        updateProgress();

        // Subscribe to high-frequency updates
        const unsubscribe = useReaderStore.subscribe((state, prevState) => {
            if (state.currentIndex !== prevState.currentIndex) {
                updateProgress();
            }
        });

        return () => {
            unsubscribe();
        };
    }, [tokensLength, wpm]);

    const totalTime = tokensLength > 0 && wpm > 0 ? (tokensLength / wpm) * 60 : 0;

    return (
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-400 bg-[#222] px-4 py-2 rounded-lg">
            <div className="flex items-center gap-4">
                <span>
                    Word <strong ref={currentWordRef} data-testid="current-word" className="text-white">0</strong> of <strong className="text-white">{tokensLength}</strong>
                </span>
                <span className="text-gray-600">|</span>
                <span>
                    <strong ref={progressRef} data-testid="progress-percentage" className="text-white">0%</strong> complete
                </span>
            </div>
            <div className="flex items-center gap-4">
                <span>
                    Remaining: <strong ref={remainingTimeRef} className="text-white">0s</strong>
                </span>
                <span className="text-gray-600">|</span>
                <span>
                    Total: <strong className="text-white">{formatTime(totalTime)}</strong>
                </span>
            </div>
        </div>
    );
};
