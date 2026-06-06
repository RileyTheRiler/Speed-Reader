import { describe, it, expect } from 'vitest';
import { buildSpokenSlice, charIndexToTokenIndex } from './boundaryMapping';
import type { Token } from '../tokenizer';

const tok = (text: string, overrides: Partial<Token> = {}): Token => ({
    id: text,
    text,
    cleanText: text.replace(/[^a-zA-Z]/g, ''),
    orpIndex: 0,
    delayMultiplier: 1,
    isChunk: false,
    isSentenceEnd: false,
    hasSpaceAfter: true,
    ...overrides,
});

describe('buildSpokenSlice', () => {
    it('joins token.text with single spaces and records contiguous offsets', () => {
        const tokens = [tok('Hello'), tok('world.')];
        const slice = buildSpokenSlice(tokens, 0, 1);

        expect(slice.text).toBe('Hello world.');
        expect(slice.offsets).toEqual([
            { start: 0, end: 5, tokenIndex: 0 },
            { start: 6, end: 12, tokenIndex: 1 },
        ]);
        // The gap between tokens is exactly one separator space.
        expect(slice.offsets[1].start - slice.offsets[0].end).toBe(1);
    });

    it('includes punctuation in the token offsets (we speak token.text, not cleanText)', () => {
        const tokens = [tok('world.')];
        const slice = buildSpokenSlice(tokens, 0, 0);
        expect(slice.text).toBe('world.');
        // The trailing "." is part of token 0's range.
        expect(charIndexToTokenIndex(slice, 5)).toBe(0);
    });

    it('preserves absolute token indices for a non-zero start slice', () => {
        const tokens = [tok('Hello'), tok('there'), tok('world.')];
        const slice = buildSpokenSlice(tokens, 1, 2);
        expect(slice.text).toBe('there world.');
        expect(slice.offsets[0].tokenIndex).toBe(1);
        expect(slice.offsets[1].tokenIndex).toBe(2);
    });

    it('returns empty for an empty token list', () => {
        expect(buildSpokenSlice([], 0, 0)).toEqual({ text: '', offsets: [] });
    });
});

describe('charIndexToTokenIndex', () => {
    const tokens = [tok('Hello'), tok('world.')];
    const slice = buildSpokenSlice(tokens, 0, 1); // "Hello world."

    it('maps the start of a token to that token', () => {
        expect(charIndexToTokenIndex(slice, 0)).toBe(0);
        expect(charIndexToTokenIndex(slice, 6)).toBe(1);
    });

    it('maps mid-token indices to that token', () => {
        expect(charIndexToTokenIndex(slice, 4)).toBe(0);
        expect(charIndexToTokenIndex(slice, 9)).toBe(1);
    });

    it('snaps a separator-space index to the NEXT token', () => {
        // index 5 is the space between "Hello" and "world."
        expect(charIndexToTokenIndex(slice, 5)).toBe(1);
    });

    it('clamps an index past the end to the last token', () => {
        expect(charIndexToTokenIndex(slice, 12)).toBe(1);
        expect(charIndexToTokenIndex(slice, 999)).toBe(1);
    });

    it('clamps a negative index to the first token', () => {
        expect(charIndexToTokenIndex(slice, -1)).toBe(0);
    });

    it('handles a single-token slice', () => {
        const single = buildSpokenSlice([tok('Solo.')], 0, 0);
        expect(charIndexToTokenIndex(single, 0)).toBe(0);
        expect(charIndexToTokenIndex(single, 3)).toBe(0);
    });

    it('maps every char of a multi-word chunk to the single chunk token (coarser granularity)', () => {
        const chunk = buildSpokenSlice([tok('Hello world', { isChunk: true })], 0, 0);
        expect(charIndexToTokenIndex(chunk, 0)).toBe(0);
        expect(charIndexToTokenIndex(chunk, 6)).toBe(0); // inside "world"
        expect(charIndexToTokenIndex(chunk, 10)).toBe(0);
    });
});
