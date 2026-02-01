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
    // Optimized: Exclude currentIndex to prevent re-renders on every word
    const { tokensLength, wpm } = useReaderStore(
        useShallow((state) => ({
            tokensLength: state.tokens.length,
            wpm: state.wpm,
        }))
    );

    const currentWordRef = useRef<HTMLElement>(null);
    const percentRef = useRef<HTMLElement>(null);
    const remainingTimeRef = useRef<HTMLElement>(null);
    const totalTimeRef = useRef<HTMLElement>(null);

    // Imperative update logic
    useLayoutEffect(() => {
        const updateUI = (state: ReturnType<typeof useReaderStore.getState>) => {
            const { currentIndex, tokens, wpm } = state;
            const currentLength = tokens.length;

            if (currentLength === 0) {
                // Handle empty state if needed
                if (currentWordRef.current) currentWordRef.current.innerText = "0";
                if (percentRef.current) percentRef.current.innerText = "0%";
                if (remainingTimeRef.current) remainingTimeRef.current.innerText = "0s";
                if (totalTimeRef.current) totalTimeRef.current.innerText = "0s";
                return;
            }

            if (currentWordRef.current) {
                currentWordRef.current.innerText = (currentIndex + 1).toString();
            }

            if (percentRef.current) {
                const progress = (currentIndex / currentLength) * 100;
                percentRef.current.innerText = `${progress.toFixed(0)}%`;
            }

            if (remainingTimeRef.current) {
                const remaining = wpm > 0 ? ((currentLength - currentIndex) / wpm) * 60 : 0;
                remainingTimeRef.current.innerText = formatTime(remaining);
            }

            if (totalTimeRef.current) {
                const total = wpm > 0 ? (currentLength / wpm) * 60 : 0;
                totalTimeRef.current.innerText = formatTime(total);
            }
        };

        // Initial update on mount / re-render
        updateUI(useReaderStore.getState());

        // Subscribe to store changes
        const unsub = useReaderStore.subscribe((state, prevState) => {
            if (
                state.currentIndex !== prevState.currentIndex ||
                state.wpm !== prevState.wpm ||
                state.tokens.length !== prevState.tokens.length
            ) {
                updateUI(state);
            }
        });

        return unsub;
    }, [tokensLength, wpm]); // Re-subscribe if hook dependencies change (though store instance is stable, this ensures effect runs on re-render)

    return (
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-400 bg-[#222] px-4 py-2 rounded-lg">
            <div className="flex items-center gap-4">
                <span>
                    Word <strong ref={currentWordRef} className="text-white" data-testid="current-word">0</strong> of <strong className="text-white" data-testid="total-words">{tokensLength}</strong>
                </span>
                <span className="text-gray-600">|</span>
                <span>
                    <strong ref={percentRef} className="text-white" data-testid="progress-percent">0%</strong> complete
                </span>
            </div>
            <div className="flex items-center gap-4">
                <span>
                    Remaining: <strong ref={remainingTimeRef} className="text-white" data-testid="remaining-time">0s</strong>
                </span>
                <span className="text-gray-600">|</span>
                <span>
                    Total: <strong ref={totalTimeRef} className="text-white">0s</strong>
                </span>
            </div>
        </div>
    );
};
