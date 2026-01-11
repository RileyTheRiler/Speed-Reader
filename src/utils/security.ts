/**
 * Maximum allowed length for input text to prevent Denial of Service (DoS)
 * via large memory allocation and processing time.
 */
export const MAX_INPUT_LENGTH = 50000;

/**
 * Sanitizes user input by removing non-printable control characters
 * while preserving whitespace like tabs and newlines.
 *
 * @param text The raw input text
 * @returns Sanitized text safe for processing
 */
export const sanitizeInput = (text: string): string => {
  if (!text) return '';

  // Truncate to maximum length first to avoid processing huge strings
  const truncated = text.slice(0, MAX_INPUT_LENGTH);

  // Remove non-printable control characters (except newline, carriage return, and tab)
  // \x00-\x08: Control chars before Tab
  // \x0B-\x0C: Vertical Tab, Form Feed
  // \x0E-\x1F: Shift Out, Shift In, Device Control, etc.
  // \x7F: Delete
  // eslint-disable-next-line no-control-regex
  return truncated.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
};
