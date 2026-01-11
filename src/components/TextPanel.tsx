import React, { useEffect, useRef, memo } from 'react';
import { useReaderStore } from '../store/useReaderStore';
import type { Token } from '../utils/tokenizer';

interface TokenSpanProps {
    token: Token;
    index: number;
    isActive: boolean;
    onTokenClick: (index: number) => void;
}

const TokenSpan = memo<TokenSpanProps>(({ token, index, isActive, onTokenClick }) => {
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (isActive && ref.current) {
            ref.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [isActive]);

    return (
        <span
            ref={ref}
            className={`
                transition-colors duration-100 px-1 rounded cursor-pointer
                ${isActive ? 'bg-blue-600 text-white font-bold scale-105' : 'hover:bg-[#383838]'}
            `}
            onClick={() => onTokenClick(index)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onTokenClick(index);
                }
            }}
            role="button"
            tabIndex={0}
            aria-current={isActive ? 'true' : undefined}
            aria-label={`Word ${index + 1}: ${token.text}`}
        >
            {token.text}{token.hasSpaceAfter ? ' ' : ''}
        </span>
    );
});

TokenSpan.displayName = 'TokenSpan';

export const TextPanel: React.FC = () => {
    const { tokens, currentIndex, isSidePanelOpen, toggleSidePanel, setCurrentIndex, play } = useReaderStore();
    const containerRef = useRef<HTMLDivElement>(null);

    const handleTokenClick = (index: number) => {
        setCurrentIndex(index);
        play();
    };

    if (!isSidePanelOpen) return null;

    return (
        <div
            className="fixed inset-y-0 right-0 w-80 bg-[#2a2a2a] border-l border-[#444] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col"
            role="complementary"
            aria-label="Text panel"
        >
            <div className="p-4 border-b border-[#444] flex justify-between items-center bg-[#333]">
                <h2 className="text-white font-bold text-lg">Text View</h2>
                <button
                    onClick={toggleSidePanel}
                    className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-gray-700"
                    aria-label="Close text panel"
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                    </svg>
                </button>
            </div>

            <div
                ref={containerRef}
                className="flex-1 overflow-y-auto p-4 text-gray-300 leading-relaxed font-serif text-lg"
            >
                {tokens.length === 0 ? (
                    <p className="text-gray-500 italic text-center mt-10">No text loaded.</p>
                ) : (
                    <div className="flex flex-wrap gap-1" role="list" aria-label="Words">
                        {tokens.map((token, index) => (
                            <TokenSpan
                                key={token.id}
                                token={token}
                                index={index}
                                isActive={index === currentIndex}
                                onTokenClick={handleTokenClick}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="p-3 border-t border-[#444] bg-[#333] text-xs text-gray-500">
                Click any word to jump to it and resume playback.
            </div>
        </div>
    );
};
