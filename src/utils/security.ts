/**
 * Security utility functions for the application.
 * Centralizes input validation and sanitization logic.
 */

// Maximum allowed characters for input text to prevent DoS
export const MAX_INPUT_LENGTH = 50000;

/**
 * Sanitizes user input to remove potentially harmful control characters.
 * While React escapes HTML by default, this adds an extra layer of defense
 * against weird Unicode control characters or other non-printable anomalies.
 *
 * @param input The raw input string
 * @returns The sanitized string
 */
export const sanitizeInput = (input: string): string => {
  // Replace tabs with spaces to prevent word merging, then remove other control characters.
  // Preserves newlines (\n) and carriage returns (\r).
  // eslint-disable-next-line no-control-regex
  return input.replace(/\t/g, ' ').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
};

/**
 * Validates if the input length is within safe limits.
 *
 * @param input The input string
 * @returns True if valid, False if too long
 */
export const isInputLengthValid = (input: string): boolean => {
  return input.length <= MAX_INPUT_LENGTH;
};
