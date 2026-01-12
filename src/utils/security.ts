/**
 * Security utilities for input sanitization and validation.
 */

export const MAX_INPUT_LENGTH = 50000;

/**
 * Sanitizes input text by removing non-printable control characters
 * while preserving tabs and newlines.
 * Also truncates to MAX_INPUT_LENGTH to prevent DoS.
 */
export const sanitizeInput = (text: string): string => {
  // Truncate first to avoid processing huge strings
  const truncated = text.slice(0, MAX_INPUT_LENGTH);

  // Remove control characters (ASCII 0-31) except tab (9), newline (10), and carriage return (13)
  // eslint-disable-next-line no-control-regex
  return truncated.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '');
};
