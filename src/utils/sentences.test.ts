import { describe, it, expect } from 'vitest';
import { getSentenceRange, sentenceText } from './sentences';
import type { Token } from './tokenizer';

const tok = (text: string, isSentenceEnd = false): Token => ({
    id: text,
    text,
    cleanText: text.replace(/[^a-zA-Z]/g, ''),
    orpIndex: 0,
    delayMultiplier: 1,
    isChunk: false,
    isSentenceEnd,
    hasSpaceAfter: true,
});

describe('getSentenceRange', () => {
    // "Hello world. This is fun."
    const tokens = [tok('Hello'), tok('world.', true), tok('This'), tok('is'), tok('fun.', true)];

    it('returns the first sentence for indices inside it', () => {
        expect(getSentenceRange(tokens, 0)).toEqual({ start: 0, end: 1 });
        expect(getSentenceRange(tokens, 1)).toEqual({ start: 0, end: 1 });
    });

    it('returns the second sentence for indices inside it', () => {
        expect(getSentenceRange(tokens, 2)).toEqual({ start: 2, end: 4 });
        expect(getSentenceRange(tokens, 4)).toEqual({ start: 2, end: 4 });
    });

    it('treats a trailing run without terminal punctuation as one sentence', () => {
        const t = [tok('No'), tok('end'), tok('here')];
        expect(getSentenceRange(t, 1)).toEqual({ start: 0, end: 2 });
    });

    it('clamps out-of-range indices', () => {
        expect(getSentenceRange(tokens, 99)).toEqual({ start: 2, end: 4 });
        expect(getSentenceRange(tokens, -5)).toEqual({ start: 0, end: 1 });
    });

    it('returns a zero range for an empty token list', () => {
        expect(getSentenceRange([], 0)).toEqual({ start: 0, end: 0 });
    });
});

describe('sentenceText', () => {
    const tokens = [tok('Hello'), tok('world.', true), tok('Next')];

    it('reconstructs the sentence text with correct spacing', () => {
        expect(sentenceText(tokens, { start: 0, end: 1 })).toBe('Hello world.');
    });
});
