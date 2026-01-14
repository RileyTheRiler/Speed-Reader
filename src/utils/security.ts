export const MAX_INPUT_LENGTH = 5000000; // 5MB ~ 1 million words, enough for almost any book (War and Peace is ~3MB)

/**
 * Sanitizes input text by:
 * 1. Truncating to MAX_INPUT_LENGTH to prevent DoS (memory exhaustion).
 * 2. Removing non-printable control characters (except tabs and newlines) to prevent potential rendering or parsing issues.
 */
export const sanitizeInput = (text: string): string => {
    if (!text) return '';

    // 1. Truncate
    let sanitized = text.slice(0, MAX_INPUT_LENGTH);

    // 2. Remove non-printable control characters (ASCII 0-31) except tab (9), newline (10), carriage return (13)
    // eslint-disable-next-line no-control-regex
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');

    return sanitized;
};
