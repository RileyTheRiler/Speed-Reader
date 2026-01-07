/**
 * Security utilities for input sanitization and validation.
 */

export const INPUT_LIMITS = {
    MAX_LENGTH: 50000,
    MAX_WORD_LENGTH: 100, // Prevent ultra-long words that might break layout
};

/**
 * Validates text input to prevent DoS via large payloads.
 * @param text The raw input text
 * @returns Object containing isValid and optional error message
 */
export const validateInput = (text: string): { isValid: boolean; error?: string } => {
    if (!text) {
        return { isValid: false, error: 'Input cannot be empty' };
    }

    if (text.length > INPUT_LIMITS.MAX_LENGTH) {
        return {
            isValid: false,
            error: `Text too long (${text.length} chars). Limit is ${INPUT_LIMITS.MAX_LENGTH}.`
        };
    }

    return { isValid: true };
};

/**
 * Sanitizes input text by:
 * 1. Trimming whitespace
 * 2. Replacing tabs/control chars with spaces
 * 3. Normalizing whitespace
 * @param text The raw input text
 * @returns Sanitized text string
 */
export const sanitizeInput = (text: string): string => {
    if (!text) return '';

    return text
        // Replace tabs and control characters with space
        // eslint-disable-next-line no-control-regex
        .replace(/[\x00-\x1F\x7F-\x9F]/g, ' ')
        .replace(/\t/g, ' ')
        // Normalize whitespace to single spaces (optional, but good for RSVP)
        .replace(/\s+/g, ' ')
        .trim();
};
