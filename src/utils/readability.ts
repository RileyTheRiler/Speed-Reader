/**
 * Readability scoring utilities — pure arithmetic, no API calls.
 *
 * Implements two well-validated formulas:
 * - Coleman–Liau Index (character-based, no syllable counting needed)
 * - Flesch–Kincaid Grade Level (syllable-based, more widely known)
 *
 * Both output a US grade level (e.g., 8.0 = 8th-grade reading level).
 *
 * References:
 * - Coleman & Liau (1975). A computer readability formula designed for machine scoring.
 * - Flesch (1948); Kincaid et al. (1975). Derivation of new readability formulas.
 */

// ---------------------------------------------------------------------------
// Syllable counting (heuristic, ~95% accurate for English)
// ---------------------------------------------------------------------------

/**
 * Estimate syllable count for an English word.
 * Uses the vowel-cluster heuristic with common English corrections.
 */
export const countSyllables = (word: string): number => {
    const w = word.toLowerCase().replace(/[^a-z]/g, '');
    if (w.length <= 2) return 1;

    // Count vowel groups
    const vowelGroups = w.match(/[aeiouy]+/g);
    let count = vowelGroups ? vowelGroups.length : 1;

    // '-ed' endings that don't add a syllable (e.g., "walked" = 1, not 2)
    // Check this BEFORE silent-e to avoid double-subtraction
    let edHandled = false;
    if (w.endsWith('ed') && w.length > 3) {
        const beforeEd = w[w.length - 3];
        if (beforeEd !== 't' && beforeEd !== 'd') {
            count = Math.max(1, count - 1);
            edHandled = true;
        }
    }

    // Silent-e: subtract 1 if word ends in 'e' (but not 'le' preceded by consonant)
    // Skip if we already handled '-ed' to avoid double-subtraction
    if (!edHandled && w.endsWith('e') && !w.endsWith('le')) {
        count = Math.max(1, count - 1);
    }

    return Math.max(1, count);
};

// ---------------------------------------------------------------------------
// Text statistics
// ---------------------------------------------------------------------------

interface TextStats {
    words: number;
    sentences: number;
    characters: number;     // Letters only (no spaces/punctuation)
    syllables: number;
}

/**
 * Extract basic statistics from a text string.
 */
export const getTextStats = (text: string): TextStats => {
    const trimmed = text.trim();
    if (!trimmed) return { words: 0, sentences: 0, characters: 0, syllables: 0 };

    const wordList = trimmed.split(/\s+/).filter(w => w.length > 0);
    const words = wordList.length;

    // Count sentences (split on .!? followed by space or end-of-string)
    const sentenceMatches = trimmed.match(/[.!?]+(?:\s|$)/g);
    // At minimum 1 sentence if there's any text
    const sentences = Math.max(1, sentenceMatches ? sentenceMatches.length : 1);

    // Count letters only
    const characters = trimmed.replace(/[^a-zA-Z]/g, '').length;

    // Count total syllables
    const syllables = wordList.reduce((sum, word) => sum + countSyllables(word), 0);

    return { words, sentences, characters, syllables };
};

// ---------------------------------------------------------------------------
// Readability formulas
// ---------------------------------------------------------------------------

/**
 * Coleman–Liau Index.
 * Uses characters per word (no syllable counting), making it deterministic
 * and fast. Returns a US school grade level.
 *
 * Formula: CLI = 0.0588 × L − 0.296 × S − 15.8
 *   where L = avg letters per 100 words, S = avg sentences per 100 words
 */
export const colemanLiauIndex = (stats: TextStats): number => {
    if (stats.words === 0) return 0;
    const L = (stats.characters / stats.words) * 100;
    const S = (stats.sentences / stats.words) * 100;
    return 0.0588 * L - 0.296 * S - 15.8;
};

/**
 * Flesch–Kincaid Grade Level.
 * Syllable-based, widely used and validated. Returns a US school grade level.
 *
 * Formula: FKGL = 0.39 × (words/sentences) + 11.8 × (syllables/words) − 15.59
 */
export const fleschKincaidGrade = (stats: TextStats): number => {
    if (stats.words === 0 || stats.sentences === 0) return 0;
    return (
        0.39 * (stats.words / stats.sentences) +
        11.8 * (stats.syllables / stats.words) -
        15.59
    );
};

// ---------------------------------------------------------------------------
// User-facing API
// ---------------------------------------------------------------------------

export type DifficultyLevel = 'Easy' | 'Moderate' | 'Challenging' | 'Advanced';

interface ReadabilityResult {
    gradeLevel: number;         // Average of both formulas, clamped to [1, 18]
    badge: DifficultyLevel;
    suggestedWpm: number;       // Evidence-based suggestion
    description: string;        // Human-readable explanation
}

/**
 * Analyze text readability and suggest an appropriate reading speed.
 *
 * WPM suggestions based on Brysbaert (2019) meta-analysis:
 * - Average silent reading: ~238 WPM (nonfiction) / ~260 WPM (fiction)
 * - Comprehension degrades significantly above ~350 WPM in RSVP
 * - Above ~500 WPM is skimming territory
 *
 * Harder text → slower suggested WPM. The mapping is conservative
 * because speed-reading apps tend to encourage speeds that hurt comprehension.
 */
export const analyzeReadability = (text: string): ReadabilityResult => {
    const stats = getTextStats(text);

    if (stats.words < 10) {
        return {
            gradeLevel: 0,
            badge: 'Easy',
            suggestedWpm: 300,
            description: 'Too short to analyze',
        };
    }

    const cli = colemanLiauIndex(stats);
    const fk = fleschKincaidGrade(stats);

    // Average both and clamp to reasonable range
    const rawGrade = (cli + fk) / 2;
    const gradeLevel = Math.round(Math.max(1, Math.min(18, rawGrade)) * 10) / 10;

    let badge: DifficultyLevel;
    let suggestedWpm: number;
    let description: string;

    if (gradeLevel <= 6) {
        badge = 'Easy';
        suggestedWpm = 300;
        description = 'Elementary-level text. Comfortable for most readers.';
    } else if (gradeLevel <= 10) {
        badge = 'Moderate';
        suggestedWpm = 260;
        description = 'High-school level. Average reading speed recommended.';
    } else if (gradeLevel <= 14) {
        badge = 'Challenging';
        suggestedWpm = 220;
        description = 'College-level text. Slower speed helps comprehension.';
    } else {
        badge = 'Advanced';
        suggestedWpm = 180;
        description = 'Graduate/professional text. Careful reading recommended.';
    }

    return { gradeLevel, badge, suggestedWpm, description };
};
