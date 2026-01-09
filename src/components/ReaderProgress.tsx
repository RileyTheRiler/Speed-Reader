import React from 'react';
import { useReaderStore } from '../store/useReaderStore';
import { useShallow } from 'zustand/react/shallow';

export const ReaderProgress: React.FC = () => {
    const { tokens, currentIndex } = useReaderStore(useShallow(state => ({
        tokens: state.tokens,
        currentIndex: state.currentIndex
    })));

    const progress = tokens.length > 0 ? (currentIndex / tokens.length) * 100 : 0;

    return (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-800/50">
            <div
                className="h-full bg-blue-500 transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
};
