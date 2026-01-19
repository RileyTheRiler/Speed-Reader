export const MAX_INPUT_LENGTH = 5000000; // 5MB ~ 1 million words, enough for almost any book (War and Peace is ~3MB)

/**
 * Sanitizes input text by:
 * 1. Truncating to MAX_INPUT_LENGTH to prevent DoS (memory exhaustion).
 * 2. Removing non-printable control characters (except tabs and newlines) to prevent potential rendering or parsing issues.
// Security Constants
export const MAX_INPUT_LENGTH = 50000;

/**
 * Sanitizes input text to prevent DoS and injection risks.
 * 1. Truncates text to MAX_INPUT_LENGTH.
 * 2. Removes non-printable control characters (preserving newlines and tabs).
 *
 * @param text The raw input text
 * @returns The sanitized text
/**
 * Maximum allowed input length to prevent memory exhaustion and DoS attacks.
 * Set to 5,000,000 characters.
 */
export const MAX_INPUT_LENGTH = 5_000_000;

/**
 * Sanitizes input text by removing non-printable control characters.
 * Preserves newlines (\n, \r) and tabs (\t).
 * Truncates text to MAX_INPUT_LENGTH.
 *
 * @param text The raw input text.
 * @returns The sanitized text.
 */
export const sanitizeInput = (text: string): string => {
    if (!text) return '';

    // 1. Truncate
    let sanitized = text.slice(0, MAX_INPUT_LENGTH);

    // 2. Remove non-printable control characters (ASCII 0-31) except tab (9), newline (10), carriage return (13)
    // eslint-disable-next-line no-control-regex
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');

    return sanitized;
    let clean = text.slice(0, MAX_INPUT_LENGTH);

    // 2. Remove control characters
    // Matches ASCII control characters except:
    // \x09 (TAB)
    // \x0A (LF)
    // \x0D (CR)
    // eslint-disable-next-line no-control-regex
    clean = clean.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    return clean;
    // Truncate to max length
    if (text.length > MAX_INPUT_LENGTH) {
        console.warn(`Input text truncated from ${text.length} to ${MAX_INPUT_LENGTH} characters.`);
        text = text.slice(0, MAX_INPUT_LENGTH);
    }

    // Remove non-printable control characters (excluding newlines, tabs)
    // eslint-disable-next-line no-control-regex
    return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
};
