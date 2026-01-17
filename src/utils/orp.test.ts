import { describe, it, expect } from 'vitest'
import { calculateORP } from './orp'

describe('calculateORP', () => {
  describe('word length rules', () => {
    it('returns 0 for single character words', () => {
      expect(calculateORP('a')).toBe(0)
      expect(calculateORP('I')).toBe(0)
    })

    it('returns 0 for empty strings', () => {
      expect(calculateORP('')).toBe(0)
    })

    it('returns 1 for 2-4 character words', () => {
      expect(calculateORP('to')).toBe(1)
      expect(calculateORP('the')).toBe(1)
      expect(calculateORP('word')).toBe(1)
    })

    it('returns 2 for 5-9 character words', () => {
      expect(calculateORP('hello')).toBe(2)
      expect(calculateORP('reading')).toBe(2)
      expect(calculateORP('beautiful')).toBe(2)
    })

    it('returns 3 for 10-13 character words', () => {
      expect(calculateORP('understand')).toBe(3) // 10 chars
      expect(calculateORP('programming')).toBe(3) // 11 chars
      expect(calculateORP('successfully')).toBe(3) // 12 chars
      expect(calculateORP('functionality')).toBe(3) // 13 chars
    })

    it('returns 4 for 14+ character words', () => {
      expect(calculateORP('implementation')).toBe(4) // 14 chars
      expect(calculateORP('extraordinarily')).toBe(4) // 15 chars
      expect(calculateORP('internationalization')).toBe(4) // 20 chars
    })
  })

  describe('edge cases', () => {
    it('handles words with numbers', () => {
      expect(calculateORP('test123')).toBe(2) // 7 chars
      expect(calculateORP('1234567890')).toBe(3) // 10 chars
    })

    it('handles words with special characters', () => {
      expect(calculateORP("don't")).toBe(2) // 5 chars
      expect(calculateORP('well-known')).toBe(3) // 10 chars
    })

    it('handles unicode characters', () => {
      expect(calculateORP('café')).toBe(1) // 4 chars
      expect(calculateORP('naïve')).toBe(2) // 5 chars
    })
  })
})
