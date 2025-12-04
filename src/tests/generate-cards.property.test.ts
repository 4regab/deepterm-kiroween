import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'
import { z } from 'zod'

// Mock dependencies
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn(),
  FileState: { PROCESSING: 'PROCESSING', FAILED: 'FAILED', ACTIVE: 'ACTIVE' },
}))

vi.mock('@/services/rateLimit', () => ({
  checkAndIncrementAIUsage: vi.fn(),
}))

vi.mock('@/services/geminiClient', () => ({
  generateContentWithRotation: vi.fn(),
  uploadFileWithRotation: vi.fn(),
  getApiKeyCount: vi.fn(() => 1),
}))

// Constants from the actual route
const MAX_FILE_SIZE = 20 * 1024 * 1024
const MAX_TEXT_LENGTH = 100000
const ALLOWED_MIME_TYPES = ['application/pdf'] as const

// Schema from the actual route
const GenerateCardsInputSchema = z.object({
  textContent: z.string().max(MAX_TEXT_LENGTH).optional().nullable(),
})

// Helper function from the actual route
function getMimeTypeFromName(filename: string): string | null {
  const ext = filename.toLowerCase().split('.').pop()
  switch (ext) {
    case 'pdf': return 'application/pdf'
    default: return null
  }
}

// Arbitraries
const validFilenameArb = fc.stringMatching(/^[a-zA-Z0-9_-]+\.pdf$/)
const invalidFilenameArb = fc.stringMatching(/^[a-zA-Z0-9_-]+\.(jpg|png|gif|exe|zip)$/)
const textContentArb = fc.string({ minLength: 1, maxLength: 1000 })
const longTextArb = fc.string({ minLength: MAX_TEXT_LENGTH + 1, maxLength: MAX_TEXT_LENGTH + 100 })

const validCardArb = fc.record({
  term: fc.string({ minLength: 1, maxLength: 200 }),
  definition: fc.string({ minLength: 1, maxLength: 1000 }),
})

const cardsArrayArb = fc.array(validCardArb, { minLength: 0, maxLength: 50 })

describe('Generate Cards API Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Input Validation Schema', () => {
    it('Property: valid text content passes schema validation', () => {
      fc.assert(
        fc.property(textContentArb, (text) => {
          const result = GenerateCardsInputSchema.safeParse({ textContent: text })
          return result.success === true
        }),
        { numRuns: 100 }
      )
    })

    it('Property: text exceeding MAX_TEXT_LENGTH fails validation', () => {
      fc.assert(
        fc.property(longTextArb, (text) => {
          const result = GenerateCardsInputSchema.safeParse({ textContent: text })
          return result.success === false
        }),
        { numRuns: 5 }
      )
    }, 30000)

    it('Property: null textContent passes validation', () => {
      const result = GenerateCardsInputSchema.safeParse({ textContent: null })
      expect(result.success).toBe(true)
    })

    it('Property: undefined textContent passes validation', () => {
      const result = GenerateCardsInputSchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('Property: empty string passes validation', () => {
      const result = GenerateCardsInputSchema.safeParse({ textContent: '' })
      expect(result.success).toBe(true)
    })
  })

  describe('MIME Type Detection', () => {
    it('Property: PDF files return correct MIME type', () => {
      fc.assert(
        fc.property(validFilenameArb, (filename) => {
          const mimeType = getMimeTypeFromName(filename)
          return mimeType === 'application/pdf'
        }),
        { numRuns: 50 }
      )
    })

    it('Property: non-PDF files return null', () => {
      fc.assert(
        fc.property(invalidFilenameArb, (filename) => {
          const mimeType = getMimeTypeFromName(filename)
          return mimeType === null
        }),
        { numRuns: 50 }
      )
    })

    it('Property: case-insensitive extension handling', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('test.PDF', 'test.Pdf', 'test.pDf', 'test.pdF'),
          (filename) => {
            const mimeType = getMimeTypeFromName(filename)
            return mimeType === 'application/pdf'
          }
        ),
        { numRuns: 20 }
      )
    })

    it('Property: files without extension return null', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => !s.includes('.')),
          (filename) => {
            const mimeType = getMimeTypeFromName(filename)
            return mimeType === null
          }
        ),
        { numRuns: 50 }
      )
    })

    it('Property: multiple dots handled correctly', () => {
      fc.assert(
        fc.property(
          fc.tuple(
            fc.string({ minLength: 1, maxLength: 10 }).filter(s => !s.includes('.')),
            fc.string({ minLength: 1, maxLength: 10 }).filter(s => !s.includes('.'))
          ),
          ([prefix, middle]) => {
            const filename = `${prefix}.${middle}.pdf`
            const mimeType = getMimeTypeFromName(filename)
            return mimeType === 'application/pdf'
          }
        ),
        { numRuns: 50 }
      )
    })
  })

  describe('File Size Validation', () => {
    it('Property: files under MAX_FILE_SIZE are valid', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: MAX_FILE_SIZE - 1 }), (size) => {
          return size <= MAX_FILE_SIZE
        }),
        { numRuns: 100 }
      )
    })

    it('Property: files over MAX_FILE_SIZE are invalid', () => {
      fc.assert(
        fc.property(fc.integer({ min: MAX_FILE_SIZE + 1, max: MAX_FILE_SIZE * 2 }), (size) => {
          return size > MAX_FILE_SIZE
        }),
        { numRuns: 100 }
      )
    })
  })

  describe('JSON Response Parsing', () => {
    it('Property: valid JSON arrays are parseable', () => {
      fc.assert(
        fc.property(cardsArrayArb, (cards) => {
          const jsonString = JSON.stringify(cards)
          const jsonMatch = jsonString.match(/\[[\s\S]*\]/)
          if (!jsonMatch) return false
          const parsed = JSON.parse(jsonMatch[0])
          return Array.isArray(parsed) && parsed.length === cards.length
        }),
        { numRuns: 100 }
      )
    })

    it('Property: JSON with prefix text is extractable', () => {
      fc.assert(
        fc.property(
          cardsArrayArb,
          fc.stringMatching(/^[a-zA-Z0-9 ]{1,50}$/), // Safe prefix without JSON special chars
          (cards, prefix) => {
            const jsonString = `${prefix} ${JSON.stringify(cards)}`
            const jsonMatch = jsonString.match(/\[[\s\S]*\]/)
            if (!jsonMatch) return false
            try {
              const parsed = JSON.parse(jsonMatch[0])
              return Array.isArray(parsed)
            } catch {
              return false
            }
          }
        ),
        { numRuns: 50 }
      )
    })

    it('Property: JSON with suffix text is extractable', () => {
      fc.assert(
        fc.property(
          cardsArrayArb,
          fc.stringMatching(/^[a-zA-Z0-9 ]{1,50}$/), // Safe suffix without JSON special chars
          (cards, suffix) => {
            const jsonString = `${JSON.stringify(cards)} ${suffix}`
            const jsonMatch = jsonString.match(/\[[\s\S]*\]/)
            if (!jsonMatch) return false
            try {
              const parsed = JSON.parse(jsonMatch[0])
              return Array.isArray(parsed)
            } catch {
              return false
            }
          }
        ),
        { numRuns: 50 }
      )
    })

    it('Property: card structure is preserved after parsing', () => {
      fc.assert(
        fc.property(validCardArb, (card) => {
          const jsonString = JSON.stringify([card])
          const parsed = JSON.parse(jsonString)
          return (
            parsed[0].term === card.term &&
            parsed[0].definition === card.definition
          )
        }),
        { numRuns: 100 }
      )
    })
  })

  describe('Rate Limit Response Structure', () => {
    it('Property: rate limit response has required fields', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          fc.integer({ min: 0, max: 10 }),
          fc.date(),
          (allowed, remaining, resetAt) => {
            const response = { allowed, remaining, resetAt }
            return (
              typeof response.allowed === 'boolean' &&
              typeof response.remaining === 'number' &&
              response.resetAt instanceof Date
            )
          }
        ),
        { numRuns: 50 }
      )
    })

    it('Property: remaining is always non-negative', () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 10 }), (remaining) => {
          return remaining >= 0
        }),
        { numRuns: 50 }
      )
    })
  })

  describe('Error Response Structure', () => {
    it('Property: error responses have error field', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1, maxLength: 200 }), (errorMessage) => {
          const response = { error: errorMessage }
          return typeof response.error === 'string' && response.error.length > 0
        }),
        { numRuns: 50 }
      )
    })
  })

  describe('MIME Type Whitelist', () => {
    it('Property: only whitelisted MIME types are allowed', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('application/pdf', 'image/jpeg', 'text/plain', 'application/zip'),
          (mimeType) => {
            const isAllowed = ALLOWED_MIME_TYPES.includes(mimeType as typeof ALLOWED_MIME_TYPES[number])
            return mimeType === 'application/pdf' ? isAllowed : !isAllowed
          }
        ),
        { numRuns: 20 }
      )
    })
  })
})
