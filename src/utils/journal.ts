/**
 * Reading Journal — local-only, zero API calls.
 *
 * Stores post-reading entries (free recall text, self-rated comprehension,
 * WPM used, timestamp) in localStorage keyed by document title/id.
 *
 * The free-recall step is the core of retrieval practice — the #1 ranked
 * learning technique in Dunlosky et al. (2013), with an effect size of
 * d ≈ 0.51 compared to passive re-reading.
 *
 * References:
 * - Dunlosky, J., et al. (2013). Improving students' learning with effective
 *   learning techniques. Psychological Science in the Public Interest, 14(1), 4–58.
 * - Roediger, H. L., & Karpicke, J. D. (2006). The power of testing memory.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface JournalEntry {
    id: string;
    /** Document identifier (title or localStorage key) */
    documentId: string;
    /** User's free-recall text — what they remember after reading */
    freeRecall: string;
    /** Self-rated comprehension: 1 (understood nothing) to 5 (full understanding) */
    comprehensionRating: number;
    /** WPM used during this reading session */
    wpm: number;
    /** ISO timestamp */
    createdAt: string;
}

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------

const JOURNAL_STORAGE_KEY = 'hypersonic-reading-journal';

const loadJournal = (): JournalEntry[] => {
    try {
        const stored = localStorage.getItem(JOURNAL_STORAGE_KEY);
        if (stored) return JSON.parse(stored);
    } catch (e) {
        console.warn('Failed to load reading journal:', e);
    }
    return [];
};

const persistJournal = (entries: JournalEntry[]): void => {
    try {
        localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(entries));
    } catch (e) {
        console.warn('Failed to save reading journal:', e);
    }
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Save a new journal entry after completing a reading session.
 */
export const saveJournalEntry = (
    entry: Omit<JournalEntry, 'id' | 'createdAt'>
): JournalEntry => {
    const entries = loadJournal();
    const newEntry: JournalEntry = {
        ...entry,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: new Date().toISOString(),
    };
    entries.unshift(newEntry);
    persistJournal(entries);
    return newEntry;
};

/**
 * Get all journal entries for a specific document.
 */
export const getEntriesForDocument = (documentId: string): JournalEntry[] => {
    return loadJournal().filter(e => e.documentId === documentId);
};

/**
 * Get all journal entries, most recent first.
 */
export const getAllEntries = (): JournalEntry[] => {
    return loadJournal();
};

/**
 * Clear all journal entries (for testing/reset).
 */
export const clearJournal = (): void => {
    localStorage.removeItem(JOURNAL_STORAGE_KEY);
};
