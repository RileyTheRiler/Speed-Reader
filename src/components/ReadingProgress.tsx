import React from 'react';
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
    const { currentIndex, tokensLength, wpm } = useReaderStore(
        useShallow((state) => ({
            currentIndex: state.currentIndex,
            tokensLength: state.tokens.length,
            wpm: state.wpm,
        }))
    );

    const progress = tokensLength > 0 ? (currentIndex / tokensLength) * 100 : 0;
    const totalTime = tokensLength > 0 && wpm > 0 ? (tokensLength / wpm) * 60 : 0;
    const remainingTime = tokensLength > 0 && wpm > 0 ? ((tokensLength - currentIndex) / wpm) * 60 : 0;

    return (
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-400 bg-[#222] px-4 py-2 rounded-lg">
            <div className="flex items-center gap-4">
                <span>
                    Word <strong className="text-white">{currentIndex + 1}</strong> of <strong className="text-white">{tokensLength}</strong>
                </span>
                <span className="text-gray-600">|</span>
                <span>
                    <strong className="text-white">{progress.toFixed(0)}%</strong> complete
                </span>
            </div>
            <div className="flex items-center gap-4">
                <span>
                    Remaining: <strong className="text-white">{formatTime(remainingTime)}</strong>
                </span>
                <span className="text-gray-600">|</span>
                <span>
                    Total: <strong className="text-white">{formatTime(totalTime)}</strong>
                </span>
            </div>
        </div>
    );
};
