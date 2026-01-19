import { sanitizeInput, MAX_INPUT_LENGTH } from './security';
import { strict as assert } from 'assert';

console.log('Running security tests...');

// Test 1: Truncation
const longString = 'a'.repeat(MAX_INPUT_LENGTH + 100);
const truncated = sanitizeInput(longString);
assert.equal(truncated.length, MAX_INPUT_LENGTH, 'Should truncate to MAX_INPUT_LENGTH');
console.log('✅ Truncation passed');

// Test 2: Control characters
const dirtyString = 'Hello\x00World\x1F';
const cleanString = sanitizeInput(dirtyString);
assert.equal(cleanString, 'HelloWorld', 'Should remove control characters');
console.log('✅ Control char removal passed');

// Test 3: Allowed control characters (newline, tab)
const allowedString = 'Line1\nLine2\tTabbed';
const cleanAllowed = sanitizeInput(allowedString);
assert.equal(cleanAllowed, allowedString, 'Should keep newlines and tabs');
console.log('✅ Allowed control chars passed');

// Test 4: Empty string
assert.equal(sanitizeInput(''), '', 'Should handle empty string');
console.log('✅ Empty string passed');

console.log('All tests passed!');
import { describe, it, expect, vi } from 'vitest';
import { sanitizeInput, MAX_INPUT_LENGTH } from './security';

describe('security.ts', () => {
    describe('sanitizeInput', () => {
        it('should truncate text exceeding MAX_INPUT_LENGTH', () => {
            // Mock console.warn to avoid cluttering test output
            const consoleSpy = vi.spyOn(console, 'warn');

            // Create a string slightly longer than MAX_INPUT_LENGTH
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
