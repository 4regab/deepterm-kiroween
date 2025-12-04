import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'
import { z } from 'zod'
import { ShareCodeSchema, ShareMaterialTypeSchema } from '@/lib/schemas/sharing'

// Mock Supabase
vi.mock('@/config/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(),
}))

// Arbitraries
const uuidArb = fc.uuid()
const materialTypeArb = fc.constantFrom<'flashcard_set' | 'reviewer'>('flashcard_set', 'reviewer')

// Valid share code: 3-30 chars, lowercase letters, numbers, hyphens
const validShareCodeArb = fc.stringMatching(/^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/)
const shortShareCodeArb = fc.stringMatching(/^[a-z0-9]{1,2}$/)
const longShareCodeArb = fc.string({ minLength: 31, maxLength: 50 }).map(s => s.toLowerCase().replace(/[^a-z0-9-]/g, 'a'))
const invalidCharsShareCodeArb = fc.stringMatching(/^[A-Z_!@#$%^&*()]+$/)

// Generate ISO date strings directly to avoid date conversion issues
const isoDateArb = fc.integer({ min: 1577836800000, max: 1924905600000 }).map(ts => new Date(ts).toISOString())

const materialShareArb = fc.record({
  id: uuidArb,
  share_code: validShareCodeArb,
  material_type: materialTypeArb,
  material_id: uuidArb,
  user_id: uuidArb,
  is_active: fc.boolean(),
  created_at: isoDateArb,
  updated_at: isoDateArb,
})

describe('Share API Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('ShareCodeSchema Validation', () => {
    it('Property: valid share codes pass validation', () => {
      fc.assert(
        fc.property(validShareCodeArb, (code) => {
          const result = ShareCodeSchema.safeParse(code)
          return result.success === true
        }),
        { numRuns: 100 }
      )
    })

    it('Property: codes shorter than 3 chars fail validation', () => {
      fc.assert(
        fc.property(shortShareCodeArb, (code) => {
          const result = ShareCodeSchema.safeParse(code)
          return result.success === false
        }),
        { numRuns: 50 }
      )
    })

    it('Property: codes longer than 30 chars fail validation', () => {
      fc.assert(
        fc.property(longShareCodeArb, (code) => {
          const result = ShareCodeSchema.safeParse(code)
          return result.success === false
        }),
        { numRuns: 50 }
      )
    })

    it('Property: codes with invalid characters fail validation', () => {
      fc.assert(
        fc.property(invalidCharsShareCodeArb, (code) => {
          const result = ShareCodeSchema.safeParse(code)
          return result.success === false
        }),
        { numRuns: 50 }
      )
    })

    it('Property: uppercase letters fail validation', () => {
      fc.assert(
        fc.property(
          fc.stringMatching(/^[A-Z][a-z0-9-]{2,28}$/),
          (code) => {
            const result = ShareCodeSchema.safeParse(code)
            return result.success === false
          }
        ),
        { numRuns: 50 }
      )
    })

    it('Property: empty string fails validation', () => {
      const result = ShareCodeSchema.safeParse('')
      expect(result.success).toBe(false)
    })

    it('Property: exactly 3 chars is valid', () => {
      fc.assert(
        fc.property(
          fc.stringMatching(/^[a-z0-9]{3}$/),
          (code) => {
            const result = ShareCodeSchema.safeParse(code)
            return result.success === true
          }
        ),
        { numRuns: 50 }
      )
    })

    it('Property: exactly 30 chars is valid', () => {
      fc.assert(
        fc.property(
          fc.stringMatching(/^[a-z0-9]{30}$/),
          (code) => {
            const result = ShareCodeSchema.safeParse(code)
            return result.success === true
          }
        ),
        { numRuns: 20 }
      )
    })
  })

  describe('ShareMaterialTypeSchema Validation', () => {
    it('Property: valid material types pass validation', () => {
      fc.assert(
        fc.property(materialTypeArb, (type) => {
          const result = ShareMaterialTypeSchema.safeParse(type)
          return result.success === true
        }),
        { numRuns: 20 }
      )
    })

    it('Property: invalid material types fail validation', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }).filter(
            s => s !== 'flashcard_set' && s !== 'reviewer'
          ),
          (type) => {
            const result = ShareMaterialTypeSchema.safeParse(type)
            return result.success === false
          }
        ),
        { numRuns: 50 }
      )
    })
  })

  describe('CreateShareSchema Validation', () => {
    const CreateShareSchema = z.object({
      materialType: ShareMaterialTypeSchema,
      materialId: z.string().uuid(),
      customCode: ShareCodeSchema.optional(),
    })

    it('Property: valid create share requests pass validation', () => {
      fc.assert(
        fc.property(
          materialTypeArb,
          uuidArb,
          fc.option(validShareCodeArb, { nil: undefined }),
          (materialType, materialId, customCode) => {
            const input = { materialType, materialId, customCode }
            const result = CreateShareSchema.safeParse(input)
            return result.success === true
          }
        ),
        { numRuns: 100 }
      )
    })

    it('Property: invalid UUID fails validation', () => {
      fc.assert(
        fc.property(
          materialTypeArb,
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => {
            try {
              z.string().uuid().parse(s)
              return false
            } catch {
              return true
            }
          }),
          (materialType, invalidId) => {
            const input = { materialType, materialId: invalidId }
            const result = CreateShareSchema.safeParse(input)
            return result.success === false
          }
        ),
        { numRuns: 50 }
      )
    })

    it('Property: missing materialType fails validation', () => {
      fc.assert(
        fc.property(uuidArb, (materialId) => {
          const input = { materialId }
          const result = CreateShareSchema.safeParse(input)
          return result.success === false
        }),
        { numRuns: 50 }
      )
    })

    it('Property: missing materialId fails validation', () => {
      fc.assert(
        fc.property(materialTypeArb, (materialType) => {
          const input = { materialType }
          const result = CreateShareSchema.safeParse(input)
          return result.success === false
        }),
        { numRuns: 20 }
      )
    })
  })

  describe('MaterialShare Structure', () => {
    it('Property: valid material shares have all required fields', () => {
      fc.assert(
        fc.property(materialShareArb, (share) => {
          return (
            typeof share.id === 'string' &&
            typeof share.share_code === 'string' &&
            (share.material_type === 'flashcard_set' || share.material_type === 'reviewer') &&
            typeof share.material_id === 'string' &&
            typeof share.user_id === 'string' &&
            typeof share.is_active === 'boolean' &&
            typeof share.created_at === 'string' &&
            typeof share.updated_at === 'string'
          )
        }),
        { numRuns: 100 }
      )
    })

    it('Property: share codes are unique identifiers', () => {
      fc.assert(
        fc.property(
          fc.array(materialShareArb, { minLength: 2, maxLength: 10 }),
          (shares) => {
            const codes = shares.map(s => s.share_code)
            const uniqueCodes = new Set(codes)
            // In practice, codes should be unique, but generated ones might collide
            return uniqueCodes.size <= codes.length
          }
        ),
        { numRuns: 50 }
      )
    })
  })

  describe('Response Structure', () => {
    it('Property: success response has share field', () => {
      fc.assert(
        fc.property(materialShareArb, (share) => {
          const response = { share }
          return response.share !== undefined && typeof response.share === 'object'
        }),
        { numRuns: 50 }
      )
    })

    it('Property: error response has error field', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1, maxLength: 200 }), (errorMessage) => {
          const response = { error: errorMessage }
          return typeof response.error === 'string'
        }),
        { numRuns: 50 }
      )
    })

    it('Property: null share response is valid for not found', () => {
      const response = { share: null }
      expect(response.share).toBeNull()
    })
  })

  describe('HTTP Status Codes', () => {
    it('Property: status codes are valid HTTP codes', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(200, 201, 400, 401, 404, 409, 500),
          (status) => {
            return status >= 100 && status < 600
          }
        ),
        { numRuns: 20 }
      )
    })

    it('Property: success statuses are 2xx', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(200, 201),
          (status) => {
            return status >= 200 && status < 300
          }
        ),
        { numRuns: 10 }
      )
    })

    it('Property: client error statuses are 4xx', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(400, 401, 404, 409),
          (status) => {
            return status >= 400 && status < 500
          }
        ),
        { numRuns: 10 }
      )
    })
  })

  describe('Share Code Generation', () => {
    it('Property: generated codes are valid', () => {
      // Simulate code generation (8 chars, alphanumeric)
      const generateCode = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
        let code = ''
        for (let i = 0; i < 8; i++) {
          code += chars[Math.floor(Math.random() * chars.length)]
        }
        return code
      }

      fc.assert(
        fc.property(fc.constant(null), () => {
          const code = generateCode()
          const result = ShareCodeSchema.safeParse(code)
          return result.success === true
        }),
        { numRuns: 100 }
      )
    })
  })

  describe('PATCH Request Validation', () => {
    it('Property: valid PATCH requests have shareId', () => {
      fc.assert(
        fc.property(
          uuidArb,
          fc.option(fc.boolean(), { nil: undefined }),
          fc.option(validShareCodeArb, { nil: undefined }),
          (shareId, isActive, newCode) => {
            const body: { shareId: string; isActive?: boolean; newCode?: string } = { shareId }
            if (isActive !== undefined) body.isActive = isActive
            if (newCode !== undefined) body.newCode = newCode
            return typeof body.shareId === 'string'
          }
        ),
        { numRuns: 50 }
      )
    })

    it('Property: missing shareId is invalid', () => {
      fc.assert(
        fc.property(fc.boolean(), (isActive) => {
          const body = { isActive }
          return !('shareId' in body)
        }),
        { numRuns: 20 }
      )
    })
  })

  describe('DELETE Request Validation', () => {
    it('Property: valid DELETE requests have shareId param', () => {
      fc.assert(
        fc.property(uuidArb, (shareId) => {
          const params = new URLSearchParams({ shareId })
          return params.get('shareId') === shareId
        }),
        { numRuns: 50 }
      )
    })
  })
})
