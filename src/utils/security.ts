// Security utility functions and constants

// Input validation constants
export const MAX_INPUT_LENGTH = 50000;

// Input sanitization
export const sanitizeInput = (text: string): string => {
  if (!text) return '';
  // Replace control characters (except newlines and tabs) with spaces
  // eslint-disable-next-line no-control-regex
  return text.replace(/[\x00-\x08\x0B-\x1F\x7F]/g, ' ');
};
