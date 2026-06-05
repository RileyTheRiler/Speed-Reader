import { describe, it, expect } from 'vitest';
import {
    countSyllables,
    getTextStats,
    colemanLiauIndex,
    fleschKincaidGrade,
    analyzeReadability,
} from './readability';

describe('readability', () => {
    describe('countSyllables', () => {
        it('counts single-syllable words', () => {
            expect(countSyllables('cat')).toBe(1);
            expect(countSyllables('the')).toBe(1);
            expect(countSyllables('run')).toBe(1);
        });

        it('counts multi-syllable words', () => {
            expect(countSyllables('apple')).toBe(2);
            expect(countSyllables('banana')).toBe(3);
            expect(countSyllables('beautiful')).toBe(3);
        });

        it('handles silent-e', () => {
            expect(countSyllables('cake')).toBe(1);
            expect(countSyllables('home')).toBe(1);
        });

        it('handles very short words', () => {
            expect(countSyllables('a')).toBe(1);
            expect(countSyllables('I')).toBe(1);
            expect(countSyllables('go')).toBe(1);
        });

        it('handles words with punctuation', () => {
            expect(countSyllables('hello,')).toBe(2);
            expect(countSyllables('world.')).toBe(1);
        });
    });

    describe('getTextStats', () => {
        it('returns zero stats for empty text', () => {
            const stats = getTextStats('');
            expect(stats.words).toBe(0);
            expect(stats.sentences).toBe(0);
        });

        it('counts words correctly', () => {
            const stats = getTextStats('The quick brown fox jumps.');
            expect(stats.words).toBe(5);
        });

        it('counts sentences correctly', () => {
            const stats = getTextStats('First sentence. Second sentence! Third?');
            expect(stats.sentences).toBe(3);
        });

        it('counts at least 1 sentence for text without punctuation', () => {
            const stats = getTextStats('No sentence ending here');
            expect(stats.sentences).toBe(1);
        });

        it('counts letters excluding spaces and punctuation', () => {
            const stats = getTextStats('Hi there!');
            expect(stats.characters).toBe(7); // "Hithere"
        });
    });

    describe('colemanLiauIndex', () => {
        it('returns 0 for empty stats', () => {
            expect(colemanLiauIndex({ words: 0, sentences: 0, characters: 0, syllables: 0 })).toBe(0);
        });

        it('returns a reasonable grade for simple text', () => {
            // Simple: short words, short sentences
            const stats = getTextStats('The cat sat. The dog ran. It was fun.');
            const grade = colemanLiauIndex(stats);
            expect(grade).toBeLessThan(6); // Should be elementary level
        });

        it('returns a higher grade for complex text', () => {
            const simple = getTextStats('The cat sat on the mat.');
            const complex = getTextStats(
                'The juxtaposition of socioeconomic stratification and epistemological paradigms ' +
                'necessitates a comprehensive analytical framework for understanding contemporary ' +
                'institutional hierarchies.'
            );
            expect(colemanLiauIndex(complex)).toBeGreaterThan(colemanLiauIndex(simple));
        });
    });

    describe('fleschKincaidGrade', () => {
        it('returns 0 for empty stats', () => {
            expect(fleschKincaidGrade({ words: 0, sentences: 0, characters: 0, syllables: 0 })).toBe(0);
        });

        it('returns a reasonable grade for simple text', () => {
            const stats = getTextStats('The cat sat. The dog ran. It was fun.');
            const grade = fleschKincaidGrade(stats);
            expect(grade).toBeLessThan(6);
        });
    });

    describe('analyzeReadability', () => {
        it('returns "Too short" for very short text', () => {
            const result = analyzeReadability('Hello world');
            expect(result.description).toBe('Too short to analyze');
            expect(result.suggestedWpm).toBe(300);
        });

        it('returns Easy for simple text', () => {
            const simpleText = 'The cat sat on the mat. The dog ran to the park. It was a nice day. ' +
                'The sun was up. Birds sang in the tree. A boy and a girl played.';
            const result = analyzeReadability(simpleText);
            expect(result.badge).toBe('Easy');
            expect(result.suggestedWpm).toBe(300);
        });

        it('returns a higher difficulty for academic text', () => {
            const academicText =
                'The epistemological implications of quantum decoherence fundamentally challenge ' +
                'our presuppositions regarding the ontological status of measurement outcomes. ' +
                'Furthermore, the non-commutative algebraic structure of observable operators ' +
                'necessitates a reformulation of classical probability theory. ' +
                'This reconceptualization has profound ramifications for understanding causality ' +
                'within relativistic quantum field theories.';
            const result = analyzeReadability(academicText);
            expect(['Challenging', 'Advanced']).toContain(result.badge);
            expect(result.suggestedWpm).toBeLessThan(300);
        });

        it('always returns gradeLevel clamped to [1, 18]', () => {
            const result = analyzeReadability(
                'I am a cat. I sit. I run. I eat. I am good. I am big. ' +
                'He is a dog. He sits. He runs too. He eats.'
            );
            expect(result.gradeLevel).toBeGreaterThanOrEqual(1);
            expect(result.gradeLevel).toBeLessThanOrEqual(18);
        });
    });
});
