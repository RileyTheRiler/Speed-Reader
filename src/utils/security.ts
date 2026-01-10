/**
 * Security utility functions for input sanitization and validation.
 */

// Maximum character limit for input text to prevent DoS via large payloads.
export const MAX_INPUT_LENGTH = 50000;

/**
 * Sanitizes the input string by:
 * 1. Truncating it to MAX_INPUT_LENGTH.
 * 2. Removing non-printable control characters (ASCII 0-31),
 *    while preserving:
 *    - \n (newline, 10)
 *    - \r (carriage return, 13)
 *    - \t (tab, 9)
 *
 * @param input The raw input string.
 * @returns The sanitized string.
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';

  // 1. Truncate to maximum length to prevent DoS
  let sanitized = input.substring(0, MAX_INPUT_LENGTH);

  // 2. Remove control characters (0-31) except newline, carriage return, and tab.
  // ASCII 0-8, 11-12, 14-31 are stripped.
  // eslint-disable-next-line no-control-regex
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');

  return sanitized;
};
