export const MAX_INPUT_LENGTH = 5000000; // 5MB

/**
 * Sanitizes input text by:
 * 1. Truncating to MAX_INPUT_LENGTH to prevent DoS (memory exhaustion).
 * 2. Removing non-printable control characters (except tabs and newlines) to prevent potential rendering or parsing issues.
 *
 * @param text The raw input text.
 * @returns The sanitized text.
 */
export const sanitizeInput = (text: string): string => {
    if (!text) return '';

    // Truncate to max length
    if (text.length > MAX_INPUT_LENGTH) {
        console.warn(`Input text truncated from ${text.length} to ${MAX_INPUT_LENGTH} characters.`);
        text = text.slice(0, MAX_INPUT_LENGTH);
    }

    // Remove non-printable control characters (ASCII 0-31) except tab (9), newline (10), carriage return (13)
    // Also remove DEL (127)
    // eslint-disable-next-line no-control-regex
    return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
};
