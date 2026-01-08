
// Limit input text to 50,000 characters to prevent DoS
export const MAX_INPUT_LENGTH = 50000;

/**
 * Sanitizes input text by removing non-printable control characters
 * and trimming whitespace.
 * Preserves newlines and basic punctuation.
 */
export const sanitizeInput = (text: string): string => {
    if (!text) return '';

    // Remove control characters except newlines (\n) and tabs (\t)
    // eslint-disable-next-line no-control-regex
    let sanitized = text.replace(/[\x00-\x08\x0B-\x1F\x7F]/g, '');

    // Replace tabs with spaces for consistent rendering
    sanitized = sanitized.replace(/\t/g, '    ');

    return sanitized.trim();
};

/**
 * Validates input length.
 * Throws an error if input exceeds the limit.
 */
export const validateInput = (text: string): void => {
    if (text.length > MAX_INPUT_LENGTH) {
        throw new Error(`Input text exceeds maximum length of ${MAX_INPUT_LENGTH} characters.`);
    }
};
