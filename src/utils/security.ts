export const MAX_INPUT_LENGTH = 5_000_000;

/**
 * Sanitizes input text by removing non-printable control characters.
 * Preserves newlines (\n, \r) and tabs (\t).
 * Truncates text to MAX_INPUT_LENGTH.
 */
export const sanitizeInput = (text: string): string => {
    if (!text) return '';

    if (text.length > MAX_INPUT_LENGTH) {
        console.warn(`Input text truncated from ${text.length} to ${MAX_INPUT_LENGTH} characters.`);
    }

    let sanitized = text.slice(0, MAX_INPUT_LENGTH);
    // eslint-disable-next-line no-control-regex
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    return sanitized;
};
