/**
 * Security constants and utility functions
 */

// Maximum input length to prevent Denial of Service (DoS) attacks
// Processing extremely large text blobs can freeze the main thread
export const MAX_INPUT_LENGTH = 50000;

/**
 * Sanitizes user input text.
 * - Replaces tabs with spaces (to prevent display issues)
 * - Trims whitespace
 * - Removes non-printable control characters (ASCII 0-31) except newlines
 */
export const sanitizeInput = (text: string): string => {
  if (!text) return '';

  // Replace tabs with spaces
  let sanitized = text.replace(/\t/g, '    ');

  // Remove control characters but keep newlines (\n, \r)
  // eslint-disable-next-line no-control-regex
  sanitized = sanitized.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, '');

  return sanitized.trim();
};

/**
 * Validates if the input is safe to process
 */
export const isValidInput = (text: string): boolean => {
  if (!text || typeof text !== 'string') return false;
  if (text.length > MAX_INPUT_LENGTH) return false;
  return true;
};
