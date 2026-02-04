import { describe, it, expect, vi } from 'vitest';
import { sanitizeInput, MAX_INPUT_LENGTH } from './security';

describe('security.ts', () => {
    describe('sanitizeInput', () => {
        it('should truncate text exceeding MAX_INPUT_LENGTH', () => {
            // Mock console.warn to avoid cluttering test output
            const consoleSpy = vi.spyOn(console, 'warn');

            // Create a string slightly longer than MAX_INPUT_LENGTH
            // Note: Creating a 5MB+ string in test might be slow, but it verifies the constant.
            // If MAX_INPUT_LENGTH is huge (5MB), 'a'.repeat might use a lot of memory.
            // But we must test the actual constant.
            const longText = 'a'.repeat(MAX_INPUT_LENGTH + 10);
            const sanitized = sanitizeInput(longText);

            expect(sanitized.length).toBe(MAX_INPUT_LENGTH);
            expect(consoleSpy).toHaveBeenCalled();

            consoleSpy.mockRestore();
        });

        it('should remove control characters', () => {
            const textWithControl = 'Hello\x00World\x08';
            const sanitized = sanitizeInput(textWithControl);
            expect(sanitized).toBe('HelloWorld');
        });

        it('should preserve newlines and tabs', () => {
            const textWithFormat = 'Line1\nLine2\tTabbed';
            const sanitized = sanitizeInput(textWithFormat);
            expect(sanitized).toBe('Line1\nLine2\tTabbed');
        });

        it('should handle empty input', () => {
            expect(sanitizeInput('')).toBe('');
        });
    });
});
