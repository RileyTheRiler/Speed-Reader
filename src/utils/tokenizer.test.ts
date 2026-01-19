import { describe, it, expect } from 'vitest'
import { tokenize } from './tokenizer'

describe('tokenize', () => {
  describe('basic tokenization', () => {
    it('returns empty array for empty string', () => {
      expect(tokenize('')).toEqual([])
    })

    it('returns empty array for whitespace only', () => {
      expect(tokenize('   ')).toEqual([])
      expect(tokenize('\n\t  ')).toEqual([])
    })

    it('tokenizes single word', () => {
      const tokens = tokenize('Hello')
      expect(tokens).toHaveLength(1)
      expect(tokens[0].text).toBe('Hello')
      expect(tokens[0].cleanText).toBe('Hello')
    })

    it('tokenizes multiple words', () => {
      const tokens = tokenize('Hello world test')
      expect(tokens).toHaveLength(3)
      expect(tokens.map(t => t.text)).toEqual(['Hello', 'world', 'test'])
    })

    it('handles multiple spaces between words', () => {
      const tokens = tokenize('Hello    world')
      expect(tokens).toHaveLength(2)
      expect(tokens[0].text).toBe('Hello')
      expect(tokens[1].text).toBe('world')
    })

    it('trims leading and trailing whitespace', () => {
      const tokens = tokenize('  Hello world  ')
      expect(tokens).toHaveLength(2)
    })
  })

  describe('ORP calculation', () => {
    it('calculates correct ORP index for each word', () => {
      const tokens = tokenize('a to hello')
      // 'a' - 1 char -> ORP at 0
      expect(tokens[0].orpIndex).toBe(0)
      // 'to' - 2 chars -> ORP at 1
      expect(tokens[1].orpIndex).toBe(1)
      // 'hello' - 5 chars -> ORP at 2
      expect(tokens[2].orpIndex).toBe(2)
    })

    it('accounts for leading punctuation in ORP', () => {
      const tokens = tokenize('"Hello')
      expect(tokens[0].text).toBe('"Hello')
      expect(tokens[0].cleanText).toBe('Hello')
      // ORP should be offset by the leading quote
      expect(tokens[0].orpIndex).toBe(3) // 1 (quote) + 2 (ORP of "Hello")
    })
  })

  describe('punctuation handling', () => {
    it('identifies sentence endings with periods', () => {
      const tokens = tokenize('Hello world. Goodbye.')
      expect(tokens[1].isSentenceEnd).toBe(true)
      expect(tokens[2].isSentenceEnd).toBe(true)
    })

    it('identifies sentence endings with exclamation marks', () => {
      const tokens = tokenize('Hello! World')
      expect(tokens[0].isSentenceEnd).toBe(true)
      expect(tokens[1].isSentenceEnd).toBe(false)
    })

    it('identifies sentence endings with question marks', () => {
      const tokens = tokenize('How are you? Fine.')
      expect(tokens[2].isSentenceEnd).toBe(true)
      expect(tokens[3].isSentenceEnd).toBe(true)
    })

    it('applies delay multiplier for periods', () => {
      const tokens = tokenize('End.')
      expect(tokens[0].delayMultiplier).toBe(3.0)
    })

    it('applies delay multiplier for commas', () => {
      const tokens = tokenize('Hello, world')
      expect(tokens[0].delayMultiplier).toBe(1.5)
    })

    it('applies delay multiplier for semicolons', () => {
      const tokens = tokenize('First; second')
      expect(tokens[0].delayMultiplier).toBe(2.0)
    })

    it('applies delay multiplier for long words', () => {
      const tokens = tokenize('supercalifragilistic')
      expect(tokens[0].delayMultiplier).toBe(1.2)
    })

    it('uses default multiplier for short words', () => {
      const tokens = tokenize('hi')
      expect(tokens[0].delayMultiplier).toBe(1.0)
    })
  })

  describe('chunking', () => {
    it('groups words when chunkSize > 1', () => {
      const tokens = tokenize('one two three four', 2)
      expect(tokens).toHaveLength(2)
      expect(tokens[0].text).toBe('one two')
      expect(tokens[1].text).toBe('three four')
    })

    it('handles odd number of words with chunking', () => {
      const tokens = tokenize('one two three', 2)
      expect(tokens).toHaveLength(2)
      expect(tokens[0].text).toBe('one two')
      expect(tokens[1].text).toBe('three')
    })

    it('marks chunks correctly', () => {
      const tokens = tokenize('one two three', 2)
      expect(tokens[0].isChunk).toBe(true)
      expect(tokens[1].isChunk).toBe(false) // single word chunk
    })

    it('calculates combined delay for chunks', () => {
      const tokens = tokenize('hello, world', 2)
      // Chunk should have multiplier from comma (1.5) scaled by chunk size factor
      expect(tokens[0].delayMultiplier).toBeGreaterThan(1.5)
    })
  })

  describe('smart chunking', () => {
    it('groups words by phrases up to punctuation', () => {
      const tokens = tokenize('Hello world, this is a test.', 1, true)
      // Should split at comma and period
      expect(tokens.some(t => t.text.includes(','))).toBe(true)
      expect(tokens.every(t => t.isChunk)).toBe(true)
    })

    it('limits chunks to max length', () => {
      const tokens = tokenize('one two three four five six seven eight', 1, true)
      // Smart chunking limits to ~3 words or 20 chars
      tokens.forEach(t => {
        const wordCount = t.text.split(' ').length
        expect(wordCount).toBeLessThanOrEqual(4)
      })
    })

    it('identifies sentence ends in smart chunks', () => {
      const tokens = tokenize('Hello world. Goodbye.', 1, true)
      expect(tokens.some(t => t.isSentenceEnd)).toBe(true)
    })
  })

  describe('token properties', () => {
    it('generates unique IDs', () => {
      const tokens = tokenize('one two three')
      const ids = tokens.map(t => t.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('sets hasSpaceAfter to true', () => {
      const tokens = tokenize('hello world')
      expect(tokens.every(t => t.hasSpaceAfter)).toBe(true)
    })

    it('strips leading/trailing quotes from cleanText', () => {
      const tokens = tokenize('"Hello" \'world\'')
      expect(tokens[0].cleanText).toBe('Hello')
      expect(tokens[1].cleanText).toBe('world')
    })

    it('strips parentheses from cleanText', () => {
      const tokens = tokenize('(test)')
      expect(tokens[0].cleanText).toBe('test')
    })
  })

  describe('edge cases', () => {
    it('handles very long text', () => {
      const longText = 'word '.repeat(1000).trim()
      const tokens = tokenize(longText)
      expect(tokens).toHaveLength(1000)
    })

    it('handles special characters', () => {
      const tokens = tokenize('hello@world test#tag')
      expect(tokens).toHaveLength(2)
    })

    it('handles numbers', () => {
      const tokens = tokenize('123 456.78')
      expect(tokens).toHaveLength(2)
      expect(tokens[0].text).toBe('123')
    })

    it('handles mixed content', () => {
      const tokens = tokenize('Hello, 123! Test?')
      expect(tokens).toHaveLength(3)
      expect(tokens[0].delayMultiplier).toBe(1.5) // comma
      expect(tokens[1].delayMultiplier).toBe(3.0) // exclamation
      expect(tokens[2].delayMultiplier).toBe(3.0) // question
    })
  })
})
