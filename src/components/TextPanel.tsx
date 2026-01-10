import React, { useEffect, useRef } from 'react';
import { useReaderStore } from '../store/useReaderStore';

export const TextPanel: React.FC = () => {
    const { tokens, currentIndex, isSidePanelOpen, toggleSidePanel } = useReaderStore();
    const activeRef = useRef<HTMLSpanElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to active token
    useEffect(() => {
        if (activeRef.current && containerRef.current) {
            const element = activeRef.current;

            // Simple scrollIntoView with smooth behavior
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [currentIndex, isSidePanelOpen]);

    if (!isSidePanelOpen) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-80 bg-[#2a2a2a] border-l border-[#444] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col">
            <div className="p-4 border-b border-[#444] flex justify-between items-center bg-[#333]">
                <h2 className="text-white font-bold text-lg">Text View</h2>
                <button
                    onClick={toggleSidePanel}
                    aria-label="Close text panel"
                    className="text-gray-400 hover:text-white transition-colors p-1"
                >
                    ✕
                </button>
            </div>

            <div
                ref={containerRef}
                className="flex-1 overflow-y-auto p-4 text-gray-300 leading-relaxed font-serif text-lg"
            >
                {tokens.length === 0 ? (
                    <p className="text-gray-500 italic text-center mt-10">No text loaded.</p>
                ) : (
                    <div className="flex flex-wrap gap-1">
                        {tokens.map((token, index) => {
                            const isActive = index === currentIndex;
                            return (
                                <span
                                    key={index}
                                    ref={isActive ? activeRef : null}
                                    role="button"
                                    tabIndex={0}
                                    className={`
                                        transition-colors duration-100 px-1 rounded cursor-pointer
                                        ${isActive ? 'bg-blue-600 text-white font-bold scale-105' : 'hover:bg-[#383838] focus:bg-[#383838] focus:outline-none focus:ring-2 focus:ring-blue-500'}
                                    `}
                                    onClick={() => {
                                        useReaderStore.getState().setCurrentIndex(index);
                                        useReaderStore.getState().play();
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            useReaderStore.getState().setCurrentIndex(index);
                                            useReaderStore.getState().play();
                                        }
                                    }}
                                >
                                    {token.text}{token.hasSpaceAfter ? ' ' : ''}
                                </span>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
