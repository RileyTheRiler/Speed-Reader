import { useEffect, useRef, memo } from 'react';
import { clsx } from 'clsx';
import type { Token } from '../utils/tokenizer';

export interface TokenSpanProps {
    token: Token;
    index: number;
    isActive: boolean;
    onTokenClick: (index: number) => void;
    /**
     * Line Focus: dim this token because it sits outside the sentence currently
     * being read. Active tokens are never dimmed. Defaults to false, which keeps
     * the original Pacer-mode appearance unchanged.
     */
    sentenceDimmed?: boolean;
    /**
     * Optional background color for the active word. Defaults to the built-in
     * blue highlight when omitted (preserving existing behavior).
     */
    activeColor?: string;
}

/**
 * A single clickable, highlightable word. Shared by the Pacer (TextPanel) and
 * Bimodal reading views so the click-to-jump, keyboard, auto-scroll, and ARIA
 * behavior lives in exactly one place.
 */
export const TokenSpan = memo<TokenSpanProps>(({
    token,
    index,
    isActive,
    onTokenClick,
    sentenceDimmed = false,
    activeColor,
}) => {
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (isActive && ref.current) {
            ref.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [isActive]);

    const useCustomActive = isActive && !!activeColor;

    return (
        <span
            ref={ref}
            className={clsx(
                'transition-all duration-100 px-1 rounded cursor-pointer',
                isActive
                    ? 'text-white font-bold scale-105'
                    : sentenceDimmed
                        ? 'opacity-30'
                        : 'hover:bg-[#383838]',
                isActive && !useCustomActive && 'bg-blue-600',
            )}
            style={useCustomActive ? { backgroundColor: activeColor } : undefined}
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
