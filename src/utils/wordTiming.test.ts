import { describe, it, expect } from 'vitest';
import { getWordDelay } from './wordTiming';
import type { Token } from './tokenizer';

// Helper to create a minimal token
const makeToken = (overrides: Partial<Token> = {}): Token => ({
    id: 'test-0',
    text: 'hello',
    cleanText: 'hello',
    orpIndex: 1,
    delayMultiplier: 1,
    isChunk: false,
    isSentenceEnd: false,
    hasSpaceAfter: true,
    ...overrides,
});

describe('wordTiming', () => {
    describe('getWordDelay', () => {
        it('returns base delay for a normal word with no features', () => {
            const token = makeToken();
            const delay = getWordDelay(token, 300, { punctuationPause: false, sentenceWrapUp: false });
            expect(delay).toBe(200); // 60000 / 300 = 200ms
        });

        it('returns base delay when token is undefined', () => {
            const delay = getWordDelay(undefined, 300, { punctuationPause: false, sentenceWrapUp: false });
            expect(delay).toBe(200);
        });

        it('applies punctuation delay when enabled', () => {
            const token = makeToken({ delayMultiplier: 3.0 }); // period
            const delay = getWordDelay(token, 300, { punctuationPause: true, sentenceWrapUp: false });
            expect(delay).toBe(600); // 200 * 3.0
        });

        it('does not apply punctuation delay when disabled', () => {
            const token = makeToken({ delayMultiplier: 3.0 });
            const delay = getWordDelay(token, 300, { punctuationPause: false, sentenceWrapUp: false });
            expect(delay).toBe(200); // No multiplier
        });

        it('applies sentence wrap-up pause at sentence boundaries', () => {
            const token = makeToken({ isSentenceEnd: true });
            const delay = getWordDelay(token, 300, { punctuationPause: false, sentenceWrapUp: true });
            expect(delay).toBe(500); // 200 * 2.5
        });

        it('does not apply sentence wrap-up on non-sentence-end tokens', () => {
            const token = makeToken({ isSentenceEnd: false });
            const delay = getWordDelay(token, 300, { punctuationPause: false, sentenceWrapUp: true });
            expect(delay).toBe(200); // No multiplier
        });

        it('uses the larger of punctuation and wrap-up multipliers', () => {
            // Period with delayMultiplier 3.0, sentence wrap-up is 2.5
            // Should use 3.0 (the larger one)
            const token = makeToken({ delayMultiplier: 3.0, isSentenceEnd: true });
            const delay = getWordDelay(token, 300, { punctuationPause: true, sentenceWrapUp: true });
            expect(delay).toBe(600); // 200 * 3.0 (larger than 2.5)
        });

        it('uses wrap-up multiplier when it is larger than punctuation', () => {
            // Comma with delayMultiplier 1.5, but it's also a sentence end (edge case)
            const token = makeToken({ delayMultiplier: 1.5, isSentenceEnd: true });
            const delay = getWordDelay(token, 300, { punctuationPause: true, sentenceWrapUp: true });
            expect(delay).toBe(500); // 200 * 2.5 (larger than 1.5)
        });

        it('scales correctly with different WPM values', () => {
            const token = makeToken();
            expect(getWordDelay(token, 600, { punctuationPause: false, sentenceWrapUp: false })).toBe(100);
            expect(getWordDelay(token, 150, { punctuationPause: false, sentenceWrapUp: false })).toBe(400);
        });
    });
});
