export const MAX_INPUT_LENGTH = 5_000_000; // 5 million characters (~5MB)

/**
 * Sanitizes input text to prevent DoS and remove unwanted control characters.
 * Truncates text to MAX_INPUT_LENGTH.
 */
export const sanitizeInput = (text: string): string => {
    if (!text) return '';

    // Truncate to max length
    if (text.length > MAX_INPUT_LENGTH) {
        console.warn(`Input text truncated from ${text.length} to ${MAX_INPUT_LENGTH} characters.`);
        text = text.slice(0, MAX_INPUT_LENGTH);
    }

    // Remove non-printable control characters (excluding newlines, tabs)
    // eslint-disable-next-line no-control-regex
    return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
};
