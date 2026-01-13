// Security Constants
export const MAX_INPUT_LENGTH = 50000;

/**
 * Sanitizes input text to prevent DoS and injection risks.
 * 1. Truncates text to MAX_INPUT_LENGTH.
 * 2. Removes non-printable control characters (preserving newlines and tabs).
 *
 * @param text The raw input text
 * @returns The sanitized text
 */
export const sanitizeInput = (text: string): string => {
    if (!text) return '';

    // 1. Truncate
    let clean = text.slice(0, MAX_INPUT_LENGTH);

    // 2. Remove control characters
    // Matches ASCII control characters except:
    // \x09 (TAB)
    // \x0A (LF)
    // \x0D (CR)
    // eslint-disable-next-line no-control-regex
    clean = clean.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    return clean;
};
