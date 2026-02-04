export const MAX_INPUT_LENGTH = 5_000_000;

/**
 * Sanitizes input text by:
 * 1. Truncating to MAX_INPUT_LENGTH to prevent DoS (memory exhaustion).
 * 2. Removing non-printable control characters (except tabs and newlines).
 */
export const sanitizeInput = (text: string): string => {
    if (!text) return '';

    let sanitized = text;

    // 1. Truncate
    if (sanitized.length > MAX_INPUT_LENGTH) {
        console.warn(`Input text truncated from ${sanitized.length} to ${MAX_INPUT_LENGTH} characters.`);
        sanitized = sanitized.slice(0, MAX_INPUT_LENGTH);
    }

    // 2. Remove non-printable control characters (ASCII 0-31) except tab (9), newline (10), carriage return (13)
    // eslint-disable-next-line no-control-regex
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    return sanitized;
};
