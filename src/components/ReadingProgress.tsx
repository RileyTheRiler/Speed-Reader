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
    // Only re-render when the total number of tokens changes (rare)
    const { tokensLength } = useReaderStore(
        useShallow((state) => ({
            tokensLength: state.tokens.length,
        }))
    );

    const currentWordRef = useRef<HTMLElement>(null);
    const progressRef = useRef<HTMLElement>(null);
    const remainingTimeRef = useRef<HTMLElement>(null);
    const totalTimeRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const updateDOM = () => {
            const { currentIndex, tokens, wpm } = useReaderStore.getState();
            const len = tokens.length;

            // Calculations
            const progress = len > 0 ? (currentIndex / len) * 100 : 0;
            const totalTime = len > 0 && wpm > 0 ? (len / wpm) * 60 : 0;
            const remainingTime = len > 0 && wpm > 0 ? ((len - currentIndex) / wpm) * 60 : 0;

            // Imperative DOM updates
            if (currentWordRef.current) {
                currentWordRef.current.innerText = String(currentIndex + 1);
            }

            if (progressRef.current) {
                progressRef.current.innerText = `${progress.toFixed(0)}%`;
            }

            if (remainingTimeRef.current) {
                remainingTimeRef.current.innerText = formatTime(remainingTime);
            }

            if (totalTimeRef.current) {
                totalTimeRef.current.innerText = formatTime(totalTime);
            }
        };

        // Initial sync
        updateDOM();

        // Subscribe to store changes to update DOM without re-rendering React component
        const unsub = useReaderStore.subscribe(updateDOM);

        return () => {
            unsub();
        };
    }, []);

    return (
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-400 bg-[#222] px-4 py-2 rounded-lg">
            <div className="flex items-center gap-4">
                <span>
                    Word <strong className="text-white" ref={currentWordRef} data-testid="current-word">1</strong> of <strong className="text-white" data-testid="total-words">{tokensLength}</strong>
                </span>
                <span className="text-gray-600">|</span>
                <span>
                    <strong className="text-white" ref={progressRef} data-testid="progress-percent">0%</strong> complete
                </span>
            </div>
            <div className="flex items-center gap-4">
                <span>
                    Remaining: <strong className="text-white" ref={remainingTimeRef} data-testid="remaining-time">0s</strong>
                </span>
                <span className="text-gray-600">|</span>
                <span>
                    Total: <strong className="text-white" ref={totalTimeRef} data-testid="total-time">0s</strong>
                </span>
            </div>
        </div>
    );
};
