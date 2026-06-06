/**
 * Shared sentence-boundary helper.
 *
 * Several places need "which sentence does this token belong to?": the store's
 * getCurrentSentence (for the pause overlay), the bimodal playback driver (to
 * speak one sentence at a time), and the bimodal Line Focus (to dim everything
 * outside the current sentence). This is the single implementation they share,
 * using the per-token `isSentenceEnd` flag produced by the tokenizer.
 */

import type { Token } from './tokenizer';

export interface SentenceRange {
    start: number; // first token index of the sentence (inclusive)
    end: number;   // last token index of the sentence (inclusive; the sentence-end token)
}

/** Return the inclusive token range of the sentence containing `index`. */
export function getSentenceRange(tokens: Token[], index: number): SentenceRange {
    if (tokens.length === 0) return { start: 0, end: 0 };

    const i = Math.max(0, Math.min(index, tokens.length - 1));

    // Walk backward to the token just after the previous sentence end (or 0).
    let start = 0;
    for (let j = i - 1; j >= 0; j--) {
        if (tokens[j].isSentenceEnd) {
            start = j + 1;
            break;
        }
    }

    // Walk forward to the next sentence end (inclusive), else the last token.
    let end = tokens.length - 1;
    for (let j = i; j < tokens.length; j++) {
        if (tokens[j].isSentenceEnd) {
            end = j;
            break;
        }
    }

    return { start, end };
}

/** Reconstruct the sentence text for the given range, respecting spacing. */
export function sentenceText(tokens: Token[], range: SentenceRange): string {
    let out = '';
    for (let i = range.start; i <= range.end; i++) {
        if (!tokens[i]) continue;
        out += tokens[i].text;
        if (tokens[i].hasSpaceAfter && i !== range.end) {
            out += ' ';
        }
    }
    return out;
}
