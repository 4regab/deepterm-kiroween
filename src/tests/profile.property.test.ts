import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { ProfileSchema, ProfileUpdateSchema } from '@/lib/schemas/profile'

// Arbitraries
const uuidArb = fc.uuid()
const emailArb = fc.emailAddress()
const urlArb = fc.webUrl()

const profileArb = fc.record({
  id: fc.option(uuidArb, { nil: undefined }),
  full_name: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: null }),
  email: fc.option(emailArb, { nil: null }),
  avatar_url: fc.option(urlArb, { nil: null }),
})

describe('Profile Schema Property Tests', () => {
  describe('ProfileSchema', () => {
    it('Property: Valid profiles always parse', () => {
      fc.assert(
        fc.property(profileArb, (profile) => {
          const result = ProfileSchema.safeParse(profile)
          return result.success === true
        }),
        { numRuns: 500 }
      )
    })

    it('Property: Invalid UUID always fails', () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.string({ minLength: 1, maxLength: 35 }).filter(s => s.length !== 36),
            full_name: fc.option(fc.string(), { nil: null }),
            email: fc.option(emailArb, { nil: null }),
            avatar_url: fc.option(urlArb, { nil: null }),
          }),
          (profile) => {
            const result = ProfileSchema.safeParse(profile)
            return result.success === false
          }
        ),
        { numRuns: 100 }
      )
    })

    it('Property: Invalid email format always fails', () => {
      const invalidEmails = fc.string().filter(s => {
        // Filter out strings that look like valid emails
        return s.length > 0 && !s.includes('@') && s !== 'null'
      })
      fc.assert(
        fc.property(
          fc.record({
            id: fc.option(uuidArb, { nil: undefined }),
            full_name: fc.option(fc.string(), { nil: null }),
            email: invalidEmails,
            avatar_url: fc.option(urlArb, { nil: null }),
          }),
          (profile) => {
            const result = ProfileSchema.safeParse(profile)
            return result.success === false
          }
        ),
        { numRuns: 100 }
      )
    })

    it('Property: Invalid URL format always fails', () => {
      const invalidUrls = fc.string().filter(s => {
        return s.length > 0 && !s.startsWith('http://') && !s.startsWith('https://')
      })
      fc.assert(
        fc.property(
          fc.record({
            id: fc.option(uuidArb, { nil: undefined }),
            full_name: fc.option(fc.string(), { nil: null }),
            email: fc.option(emailArb, { nil: null }),
            avatar_url: invalidUrls,
          }),
          (profile) => {
            const result = ProfileSchema.safeParse(profile)
            return result.success === false
          }
        ),
        { numRuns: 100 }
      )
    })

    it('Property: All null values are valid', () => {
      const result = ProfileSchema.safeParse({
        full_name: null,
        email: null,
        avatar_url: null,
      })
      expect(result.success).toBe(true)
    })

    it('Property: Optional id can be omitted', () => {
      fc.assert(
        fc.property(
          fc.record({
            full_name: fc.option(fc.string(), { nil: null }),
            email: fc.option(emailArb, { nil: null }),
            avatar_url: fc.option(urlArb, { nil: null }),
          }),
          (profile) => {
            const result = ProfileSchema.safeParse(profile)
            return result.success === true
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('ProfileUpdateSchema', () => {
    it('Property: Partial updates are valid', () => {
      fc.assert(
        fc.property(
          fc.record({
            full_name: fc.option(fc.string(), { nil: null }),
          }),
          (update) => {
            const result = ProfileUpdateSchema.safeParse(update)
            return result.success === true
          }
        ),
        { numRuns: 100 }
      )
    })

    it('Property: Empty object is valid for partial update', () => {
      const result = ProfileUpdateSchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('Property: id field is not allowed in updates', () => {
      // ProfileUpdateSchema omits id, so including it should still parse
      // but the id won't be in the output
      const result = ProfileUpdateSchema.safeParse({
        id: '123e4567-e89b-12d3-a456-426614174000',
        full_name: 'Test User',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect('id' in result.data).toBe(false)
      }
    })

    it('Property: Valid email updates parse successfully', () => {
      fc.assert(
        fc.property(emailArb, (email) => {
          const result = ProfileUpdateSchema.safeParse({ email })
          return result.success === true
        }),
        { numRuns: 100 }
      )
    })

    it('Property: Valid avatar_url updates parse successfully', () => {
      fc.assert(
        fc.property(urlArb, (avatar_url) => {
          const result = ProfileUpdateSchema.safeParse({ avatar_url })
          return result.success === true
        }),
        { numRuns: 100 }
      )
    })
  })

  describe('Edge Cases', () => {
    it('Property: Unicode names are valid', () => {
      const unicodeNames = ['日本語', '한국어', 'العربية', 'Émile', 'Müller', '中文']
      for (const name of unicodeNames) {
        const result = ProfileSchema.safeParse({
          full_name: name,
          email: null,
          avatar_url: null,
        })
        expect(result.success).toBe(true)
      }
    })

    it('Property: Very long names are valid (no max length constraint)', () => {
      const longName = 'A'.repeat(1000)
      const result = ProfileSchema.safeParse({
        full_name: longName,
        email: null,
        avatar_url: null,
      })
      expect(result.success).toBe(true)
    })

    it('Property: Various valid email formats parse', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.org',
        'user+tag@example.co.uk',
        'a@b.co',
      ]
      for (const email of validEmails) {
        const result = ProfileSchema.safeParse({
          full_name: null,
          email,
          avatar_url: null,
        })
        expect(result.success).toBe(true)
      }
    })

    it('Property: Various valid URL formats parse', () => {
      const validUrls = [
        'https://example.com/avatar.png',
        'http://cdn.example.org/images/user.jpg',
        'https://storage.googleapis.com/bucket/image.webp',
      ]
      for (const avatar_url of validUrls) {
        const result = ProfileSchema.safeParse({
          full_name: null,
          email: null,
          avatar_url,
        })
        expect(result.success).toBe(true)
      }
    })
  })
})
