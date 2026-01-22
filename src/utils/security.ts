/**
 * Maximum allowed input length to prevent memory exhaustion and DoS attacks.
 * Set to 5,000,000 characters (approx. 5MB).
 * This is sufficient for very large books (War and Peace is ~3MB).
 */
export const MAX_INPUT_LENGTH = 5_000_000;

/**
 * Sanitizes input text to prevent DoS and injection risks.
 * 1. Truncates text to MAX_INPUT_LENGTH.
 * 2. Removes non-printable control characters (preserving newlines and tabs).
 *
 * @param text The raw input text.
 * @returns The sanitized text.
 */
export const sanitizeInput = (text: string): string => {
    if (!text) return '';

    // 1. Truncate to prevent memory exhaustion
    if (text.length > MAX_INPUT_LENGTH) {
        console.warn(`Input text truncated from ${text.length} to ${MAX_INPUT_LENGTH} characters.`);
        text = text.slice(0, MAX_INPUT_LENGTH);
    }

    // 2. Remove non-printable control characters (ASCII 0-31 and 127)
    // Preserves: \t (9), \n (10), \r (13)
    // eslint-disable-next-line no-control-regex
    return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
};
