/**
 * SM-2 Spaced Repetition Scheduler — deterministic, no AI.
 *
 * The SuperMemo 2 algorithm schedules review intervals based on a single
 * quality rating (0–5) after each review. It's the algorithm behind Anki
 * and most modern spaced-repetition systems.
 *
 * Here we adapt it for document re-reading: after finishing a text, the user
 * self-rates comprehension (1–5), and the scheduler decides when to suggest
 * re-reading the document.
 *
 * References:
 * - Wozniak, P.A. (1990). Optimization of learning. Master's thesis.
 * - Cepeda et al. (2006, 2008). Spacing effects in learning.
 * - Dunlosky et al. (2013). Improving students' learning: #2 ranked technique.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SpacedRepetitionItem {
    /** Number of consecutive successful reviews (quality >= 3) */
    repetitions: number;
    /** Current inter-review interval in days */
    interval: number;
    /** Ease factor — higher = longer intervals. Min 1.3, default 2.5 */
    easeFactor: number;
    /** ISO date string of next scheduled review */
    nextReviewAt: string;
    /** ISO date string of last review */
    lastReviewedAt: string | null;
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

/**
 * Create a new item with default SM-2 parameters.
 */
export const createNewItem = (): SpacedRepetitionItem => ({
    repetitions: 0,
    interval: 1,
    easeFactor: 2.5,
    nextReviewAt: new Date().toISOString(),
    lastReviewedAt: null,
});

// ---------------------------------------------------------------------------
// Core SM-2 Algorithm
// ---------------------------------------------------------------------------

/**
 * Schedule the next review for an item based on the user's quality rating.
 *
 * @param item    Current spaced-repetition state for this document
 * @param quality Self-rated comprehension: 1 (forgot everything) to 5 (perfect recall)
 *                We map the user's 1–5 to SM-2's 0–5 scale internally.
 * @returns       Updated item with new interval, ease factor, and next review date
 */
export const scheduleReview = (
    item: SpacedRepetitionItem,
    quality: number
): SpacedRepetitionItem => {
    // Clamp quality to 1–5, then map to SM-2's 0–5 scale
    const q = Math.max(0, Math.min(5, quality));

    const now = new Date();
    let { repetitions, interval, easeFactor } = item;

    if (q < 3) {
        // Failed review — reset repetitions, short interval
        repetitions = 0;
        interval = 1;
    } else {
        // Successful review
        if (repetitions === 0) {
            interval = 1;
        } else if (repetitions === 1) {
            interval = 6;
        } else {
            interval = Math.round(interval * easeFactor);
        }
        repetitions += 1;
    }

    // Update ease factor (SM-2 formula)
    easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    easeFactor = Math.max(1.3, easeFactor); // Floor at 1.3

    // Calculate next review date
    const nextReview = new Date(now);
    nextReview.setDate(nextReview.getDate() + interval);

    return {
        repetitions,
        interval,
        easeFactor: Math.round(easeFactor * 100) / 100,
        nextReviewAt: nextReview.toISOString(),
        lastReviewedAt: now.toISOString(),
    };
};

// ---------------------------------------------------------------------------
// Review check
// ---------------------------------------------------------------------------

/**
 * Check if an item is due for review.
 */
export const isReviewDue = (item: SpacedRepetitionItem): boolean => {
    if (!item.nextReviewAt) return false;
    return new Date() >= new Date(item.nextReviewAt);
};

/**
 * Get a human-readable description of when the next review is due.
 */
export const getReviewStatus = (item: SpacedRepetitionItem): string => {
    if (!item.lastReviewedAt) return 'Never reviewed';

    const now = new Date();
    const nextReview = new Date(item.nextReviewAt);
    const diffMs = nextReview.getTime() - now.getTime();

    if (diffMs <= 0) return 'Due for review';

    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return 'Review tomorrow';
    if (diffDays <= 7) return `Review in ${diffDays} days`;
    return `Review on ${nextReview.toLocaleDateString()}`;
};
