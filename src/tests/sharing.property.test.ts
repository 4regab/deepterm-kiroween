import { describe, it } from 'vitest'
import * as fc from 'fast-check'
import {
  ShareCodeSchema,
  ShareMaterialTypeSchema,
  MaterialShareSchema,
  SharedFlashcardSchema,
  SharedTermSchema,
  SharedCategorySchema,
  SharedOwnerSchema,
  SharedMaterialDataSchema,
} from '@/lib/schemas/sharing'

// Arbitraries
const uuidArb = fc.uuid()
const isoDateArb = fc.date().map(d => d.toISOString())

// Valid share code: 3-30 chars, lowercase letters, numbers, hyphens only
const validShareCodeArb = fc
  .string({ minLength: 3, maxLength: 30 })
  .filter((s: string) => /^[a-z0-9-]+$/.test(s))

const shareMaterialTypeArb = fc.constantFrom('flashcard_set', 'reviewer')

const materialShareArb = fc.record({
  id: uuidArb,
  share_code: fc.string({ minLength: 1, maxLength: 30 }),
  material_type: shareMaterialTypeArb,
  material_id: uuidArb,
  user_id: uuidArb,
  is_active: fc.boolean(),
  created_at: isoDateArb,
  updated_at: isoDateArb,
})

const sharedFlashcardArb = fc.record({
  id: fc.string({ minLength: 1 }),
  front: fc.string(),
  back: fc.string(),
})

const sharedTermArb = fc.record({
  id: fc.string({ minLength: 1 }),
  term: fc.string(),
  definition: fc.string(),
  examples: fc.option(fc.array(fc.string()), { nil: null }),
  keywords: fc.option(fc.array(fc.string()), { nil: null }),
})

const sharedCategoryArb = fc.record({
  id: fc.string({ minLength: 1 }),
  name: fc.string(),
  color: fc.string(),
  terms: fc.array(sharedTermArb, { minLength: 0, maxLength: 10 }),
})

const sharedOwnerArb = fc.record({
  name: fc.string(),
  avatar: fc.option(fc.string(), { nil: null }),
})

describe('Sharing Schema Property Tests', () => {
  describe('ShareCodeSchema', () => {
    it('Property: Valid share codes (3-30 chars, lowercase alphanumeric + hyphen) always parse', () => {
      fc.assert(
        fc.property(validShareCodeArb, (code) => {
          const result = ShareCodeSchema.safeParse(code)
          return result.success === true
        }),
        { numRuns: 500 }
      )
    })

    it('Property: Share codes shorter than 3 chars always fail', () => {
      const shortCodes = fc.string({ minLength: 0, maxLength: 2 })
        .filter((s: string) => /^[a-z0-9-]*$/.test(s))
      fc.assert(
        fc.property(shortCodes, (code) => {
          const result = ShareCodeSchema.safeParse(code)
          return result.success === false
        }),
        { numRuns: 100 }
      )
    })

    it('Property: Share codes longer than 30 chars always fail', () => {
      const longCodes = fc.string({ minLength: 31, maxLength: 100 })
        .filter((s: string) => /^[a-z0-9-]+$/.test(s))
      fc.assert(
        fc.property(longCodes, (code) => {
          const result = ShareCodeSchema.safeParse(code)
          return result.success === false
        }),
        { numRuns: 100 }
      )
    })

    it('Property: Share codes with uppercase letters always fail', () => {
      const upperCaseCodes = fc
        .string({ minLength: 3, maxLength: 30 })
        .filter(s => /[A-Z]/.test(s))
      fc.assert(
        fc.property(upperCaseCodes, (code) => {
          const result = ShareCodeSchema.safeParse(code)
          return result.success === false
        }),
        { numRuns: 100 }
      )
    })

    it('Property: Share codes with special characters (except hyphen) always fail', () => {
      const specialCharCodes = fc
        .string({ minLength: 3, maxLength: 30 })
        .filter(s => /[^a-z0-9-]/.test(s) && !/[A-Z]/.test(s))
      fc.assert(
        fc.property(specialCharCodes, (code) => {
          const result = ShareCodeSchema.safeParse(code)
          return result.success === false
        }),
        { numRuns: 100 }
      )
    })
  })

  describe('ShareMaterialTypeSchema', () => {
    it('Property: Valid material types always parse', () => {
      fc.assert(
        fc.property(shareMaterialTypeArb, (type) => {
          const result = ShareMaterialTypeSchema.safeParse(type)
          return result.success === true
        }),
        { numRuns: 50 }
      )
    })

    it('Property: Invalid material types always fail', () => {
      const invalidTypes = fc.string().filter(s => !['flashcard_set', 'reviewer'].includes(s))
      fc.assert(
        fc.property(invalidTypes, (type) => {
          const result = ShareMaterialTypeSchema.safeParse(type)
          return result.success === false
        }),
        { numRuns: 100 }
      )
    })
  })

  describe('MaterialShareSchema', () => {
    it('Property: Valid material shares always parse', () => {
      fc.assert(
        fc.property(materialShareArb, (share) => {
          const result = MaterialShareSchema.safeParse(share)
          return result.success === true
        }),
        { numRuns: 200 }
      )
    })

    it('Property: Invalid UUIDs always fail', () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.string().filter(s => s.length > 0 && s.length < 36),
            share_code: fc.string({ minLength: 1 }),
            material_type: shareMaterialTypeArb,
            material_id: uuidArb,
            user_id: uuidArb,
            is_active: fc.boolean(),
            created_at: isoDateArb,
            updated_at: isoDateArb,
          }),
          (share) => {
            const result = MaterialShareSchema.safeParse(share)
            return result.success === false
          }
        ),
        { numRuns: 50 }
      )
    })
  })

  describe('SharedFlashcardSchema', () => {
    it('Property: Valid shared flashcards always parse', () => {
      fc.assert(
        fc.property(sharedFlashcardArb, (card) => {
          const result = SharedFlashcardSchema.safeParse(card)
          return result.success === true
        }),
        { numRuns: 200 }
      )
    })
  })

  describe('SharedTermSchema', () => {
    it('Property: Valid shared terms always parse', () => {
      fc.assert(
        fc.property(sharedTermArb, (term) => {
          const result = SharedTermSchema.safeParse(term)
          return result.success === true
        }),
        { numRuns: 200 }
      )
    })

    it('Property: Null examples and keywords are valid', () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.string({ minLength: 1 }),
            term: fc.string(),
            definition: fc.string(),
            examples: fc.constant(null),
            keywords: fc.constant(null),
          }),
          (term) => {
            const result = SharedTermSchema.safeParse(term)
            return result.success === true
          }
        ),
        { numRuns: 50 }
      )
    })
  })

  describe('SharedCategorySchema', () => {
    it('Property: Valid shared categories always parse', () => {
      fc.assert(
        fc.property(sharedCategoryArb, (category) => {
          const result = SharedCategorySchema.safeParse(category)
          return result.success === true
        }),
        { numRuns: 100 }
      )
    })

    it('Property: Empty terms array is valid', () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.string({ minLength: 1 }),
            name: fc.string(),
            color: fc.string(),
            terms: fc.constant([]),
          }),
          (category) => {
            const result = SharedCategorySchema.safeParse(category)
            return result.success === true
          }
        ),
        { numRuns: 50 }
      )
    })
  })

  describe('SharedOwnerSchema', () => {
    it('Property: Valid shared owners always parse', () => {
      fc.assert(
        fc.property(sharedOwnerArb, (owner) => {
          const result = SharedOwnerSchema.safeParse(owner)
          return result.success === true
        }),
        { numRuns: 100 }
      )
    })

    it('Property: Null avatar is valid', () => {
      fc.assert(
        fc.property(
          fc.record({
            name: fc.string(),
            avatar: fc.constant(null),
          }),
          (owner) => {
            const result = SharedOwnerSchema.safeParse(owner)
            return result.success === true
          }
        ),
        { numRuns: 50 }
      )
    })
  })

  describe('SharedMaterialDataSchema (Discriminated Union)', () => {
    it('Property: Flashcard set data with type="flashcard_set" always parses', () => {
      const flashcardSetDataArb = fc.record({
        type: fc.constant('flashcard_set' as const),
        share: fc.record({
          id: fc.string({ minLength: 1 }),
          code: fc.string({ minLength: 1 }),
          created_at: isoDateArb,
        }),
        material: fc.record({
          id: fc.string({ minLength: 1 }),
          title: fc.string(),
          created_at: isoDateArb,
        }),
        items: fc.array(sharedFlashcardArb, { minLength: 0, maxLength: 10 }),
        owner: sharedOwnerArb,
      })

      fc.assert(
        fc.property(flashcardSetDataArb, (data) => {
          const result = SharedMaterialDataSchema.safeParse(data)
          return result.success === true
        }),
        { numRuns: 100 }
      )
    })

    it('Property: Reviewer data with type="reviewer" always parses', () => {
      const reviewerDataArb = fc.record({
        type: fc.constant('reviewer' as const),
        share: fc.record({
          id: fc.string({ minLength: 1 }),
          code: fc.string({ minLength: 1 }),
          created_at: isoDateArb,
        }),
        material: fc.record({
          id: fc.string({ minLength: 1 }),
          title: fc.string(),
          extraction_mode: fc.string(),
          created_at: isoDateArb,
        }),
        categories: fc.array(sharedCategoryArb, { minLength: 0, maxLength: 5 }),
        owner: sharedOwnerArb,
      })

      fc.assert(
        fc.property(reviewerDataArb, (data) => {
          const result = SharedMaterialDataSchema.safeParse(data)
          return result.success === true
        }),
        { numRuns: 100 }
      )
    })

    it('Property: Invalid type discriminator always fails', () => {
      fc.assert(
        fc.property(
          fc.record({
            type: fc.string().filter(s => !['flashcard_set', 'reviewer'].includes(s)),
            share: fc.record({
              id: fc.string({ minLength: 1 }),
              code: fc.string({ minLength: 1 }),
              created_at: isoDateArb,
            }),
            material: fc.record({
              id: fc.string({ minLength: 1 }),
              title: fc.string(),
              created_at: isoDateArb,
            }),
            items: fc.array(sharedFlashcardArb),
            owner: sharedOwnerArb,
          }),
          (data) => {
            const result = SharedMaterialDataSchema.safeParse(data)
            return result.success === false
          }
        ),
        { numRuns: 50 }
      )
    })
  })
})
