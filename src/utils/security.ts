/**
 * Maximum allowed input length to prevent memory exhaustion and DoS attacks.
 * Set to 5,000,000 characters.
 */
export const MAX_INPUT_LENGTH = 5_000_000;

/**
 * Sanitizes input text by removing non-printable control characters.
 * Preserves newlines (\n, \r) and tabs (\t).
 *
 * @param text The raw input text.
 * @returns The sanitized text.
 */
export const sanitizeInput = (text: string): string => {
    // eslint-disable-next-line no-control-regex
    return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
};
