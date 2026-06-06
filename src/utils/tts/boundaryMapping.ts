/**
 * Pure mapping between a spoken string's character offsets and token indices.
 *
 * The Web Speech API's `onboundary` event reports a `charIndex` into the string
 * we asked it to speak. To highlight the correct word, we build the spoken
 * string from a known slice of tokens while recording each token's character
 * range, then translate any `charIndex` back to the absolute token index.
 *
 * IMPORTANT: the string passed to `speak()` MUST be exactly `SpokenSlice.text`
 * so the recorded offsets line up with the engine's reported indices. We speak
 * `token.text` (raw display text, including punctuation), NOT `token.cleanText`.
 */

import type { Token } from '../tokenizer';

export interface TokenOffset {
    start: number;      // inclusive char index into SpokenSlice.text
    end: number;        // exclusive char index
    tokenIndex: number; // absolute index into the original tokens array
}

export interface SpokenSlice {
    text: string;
    offsets: TokenOffset[];
}

/**
 * Build the spoken string for tokens[startIdx..endIdx] (inclusive), joined with
 * single spaces, recording each token's [start, end) char range.
 */
export function buildSpokenSlice(
    tokens: Token[],
    startIdx: number,
    endIdx: number,
): SpokenSlice {
    const offsets: TokenOffset[] = [];

    if (tokens.length === 0 || startIdx > endIdx) {
        return { text: '', offsets };
    }

    const lo = Math.max(0, startIdx);
    const hi = Math.min(tokens.length - 1, endIdx);

    let cursor = 0;
    let text = '';

    for (let i = lo; i <= hi; i++) {
        const piece = tokens[i].text;
        const start = cursor;
        const end = start + piece.length;
        offsets.push({ start, end, tokenIndex: i });

        text += piece;
        cursor = end;

        // Single-space separator between tokens (not after the last one).
        if (i < hi) {
            text += ' ';
            cursor += 1;
        }
    }

    return { text, offsets };
}

/**
 * Map a `charIndex` (offset into `slice.text`) to the absolute token index it
 * falls within.
 *
 * - Inside a token's [start, end) => that token.
 * - On a separator space (between prev.end and next.start) => snap to the NEXT
 *   token (the one about to be spoken).
 * - Past the end => the last token.
 * - Negative / empty slice => the first token in the slice.
 */
export function charIndexToTokenIndex(slice: SpokenSlice, charIndex: number): number {
    const { offsets } = slice;
    if (offsets.length === 0) return 0;

    if (charIndex < 0) return offsets[0].tokenIndex;

    const last = offsets[offsets.length - 1];
    if (charIndex >= last.end) return last.tokenIndex;

    for (let i = 0; i < offsets.length; i++) {
        const o = offsets[i];
        if (charIndex < o.end) {
            // charIndex is either inside this token, or on the separator space
            // immediately before it (charIndex >= prev.end). Either way this is
            // the next/current token to highlight.
            return o.tokenIndex;
        }
    }

    return last.tokenIndex;
}
