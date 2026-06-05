/**
 * Word timing utility — pure function for per-word delay calculation.
 *
 * Extracted from the ReaderCanvas animation loop to be testable and to
 * cleanly add sentence wrap-up pauses.
 *
 * The sentence wrap-up pause is grounded in Masson (1983), who showed that
 * inter-sentence pauses measurably restore RSVP comprehension by giving the
 * reader time to integrate the sentence meaning before the next one begins.
 *
 * References:
 * - Masson, M. E. J. (1983). Conceptual processing of text during skimming
 *   and rapid sequential reading. Memory & Cognition, 11(3), 262–274.
 */

import type { Token } from './tokenizer';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TimingSettings {
    punctuationPause: boolean;
    sentenceWrapUp: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Extra delay multiplier applied at sentence boundaries when wrap-up is enabled.
 * This gives ~500ms at 300 WPM (base delay 200ms × 2.5 = 500ms), which aligns
 * with Masson's finding that 400–600ms inter-sentence pauses are beneficial.
 */
const SENTENCE_WRAP_UP_MULTIPLIER = 2.5;

// ---------------------------------------------------------------------------
// Core function
// ---------------------------------------------------------------------------

/**
 * Calculate the display duration for a single token.
 *
 * @param token    The current token being displayed
 * @param wpm      Words per minute
 * @param settings Timing-related settings
 * @returns        Delay in milliseconds
 */
export const getWordDelay = (
    token: Token | undefined,
    wpm: number,
    settings: TimingSettings
): number => {
    const baseDelay = 60000 / wpm;

    if (!token) return baseDelay;

    let multiplier = 1;

    // Punctuation pause (existing behavior)
    if (settings.punctuationPause && token.delayMultiplier > 1) {
        multiplier = token.delayMultiplier;
    }

    // Sentence wrap-up pause — applied ON TOP of punctuation pause
    // at sentence boundaries only
    if (settings.sentenceWrapUp && token.isSentenceEnd) {
        multiplier = Math.max(multiplier, SENTENCE_WRAP_UP_MULTIPLIER);
    }

    return baseDelay * multiplier;
};
