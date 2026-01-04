/**
 * Security utility functions
 */

// Maximum allowed characters for input text to prevent DoS
export const MAX_CHARS = 100000;

/**
 * Sanitizes user input by removing control characters that could be harmful or cause display issues.
 * Preserves common whitespace like newlines (\n), carriage returns (\r), and tabs (\t).
 *
 * @param text The input text to sanitize
 * @returns The sanitized text
 */
export const sanitizeInput = (text: string): string => {
    // Remove control characters (ASCII 0-31) except for newline (10), carriage return (13), and tab (9)
    // Also removes delete (127)
    // eslint-disable-next-line no-control-regex
    return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
};

/**
 * Validates text length against MAX_CHARS
 * @param text The text to validate
 * @returns true if valid, false if too long
 */
export const validateLength = (text: string): boolean => {
    return text.length <= MAX_CHARS;
};
