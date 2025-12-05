import { describe, it } from 'vitest'
import * as fc from 'fast-check'
import { z } from 'zod'
import {
  MaterialTypeSchema,
  MaterialItemSchema,
  MaterialFilterSchema,
  FlashcardSchema,
} from '@/lib/schemas/materials'

// Arbitraries for materials
const uuidArb = fc.uuid()
const materialTypeArb = fc.constantFrom('Note', 'Flashcards', 'Reviewer')
const materialFilterArb = fc.constantFrom('All', 'Note', 'Flashcards', 'Reviewer', 'Cards')
const isoDateArb = fc.date({ 
  min: new Date('1970-01-01'), 
  max: new Date('2100-12-31'),
  noInvalidDate: true 
}).map(d => d.toISOString())

const materialItemArb = fc.record({
  id: uuidArb,
  title: fc.string({ minLength: 1, maxLength: 200 }),
  type: materialTypeArb,
  itemsCount: fc.integer({ min: 0, max: 10000 }),
  lastAccessed: isoDateArb,
  sortDate: fc.option(isoDateArb, { nil: undefined }),
})

const flashcardArb = fc.record({
  id: uuidArb,
  term: fc.string({ minLength: 1, maxLength: 1000 }),
  definition: fc.string({ minLength: 1, maxLength: 5000 }),
  set_id: uuidArb,
})

describe('Materials Schema Property Tests', () => {
  describe('MaterialTypeSchema', () => {
    it('Property: Valid material types always parse successfully', () => {
      fc.assert(
        fc.property(materialTypeArb, (type) => {
          const result = MaterialTypeSchema.safeParse(type)
          return result.success === true
        }),
        { numRuns: 100 }
      )
    })

    it('Property: Invalid material types always fail parsing', () => {
      const invalidTypes = fc.string().filter(s => !['Note', 'Flashcards', 'Reviewer'].includes(s))
      fc.assert(
        fc.property(invalidTypes, (type) => {
          const result = MaterialTypeSchema.safeParse(type)
          return result.success === false
        }),
        { numRuns: 100 }
      )
    })
  })

  describe('MaterialItemSchema', () => {
    it('Property: Valid material items always parse successfully', () => {
      fc.assert(
        fc.property(materialItemArb, (item) => {
          const result = MaterialItemSchema.safeParse(item)
          return result.success === true
        }),
        { numRuns: 200 }
      )
    })

    it('Property: Empty title always fails validation', () => {
      fc.assert(
        fc.property(
          fc.record({
            id: uuidArb,
            title: fc.constant(''),
            type: materialTypeArb,
            itemsCount: fc.integer({ min: 0 }),
            lastAccessed: isoDateArb,
          }),
          (item) => {
            const result = MaterialItemSchema.safeParse(item)
            return result.success === false
          }
        ),
        { numRuns: 50 }
      )
    })

    it('Property: Negative itemsCount always fails validation', () => {
      fc.assert(
        fc.property(
          fc.record({
            id: uuidArb,
            title: fc.string({ minLength: 1 }),
            type: materialTypeArb,
            itemsCount: fc.integer({ min: -1000, max: -1 }),
            lastAccessed: isoDateArb,
          }),
          (item) => {
            const result = MaterialItemSchema.safeParse(item)
            return result.success === false
          }
        ),
        { numRuns: 50 }
      )
    })

    it('Property: Invalid UUID always fails validation', () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.string().filter(s => !z.string().uuid().safeParse(s).success),
            title: fc.string({ minLength: 1 }),
            type: materialTypeArb,
            itemsCount: fc.integer({ min: 0 }),
            lastAccessed: isoDateArb,
          }),
          (item) => {
            const result = MaterialItemSchema.safeParse(item)
            return result.success === false
          }
        ),
        { numRuns: 50 }
      )
    })
  })

  describe('FlashcardSchema', () => {
    it('Property: Valid flashcards always parse successfully', () => {
      fc.assert(
        fc.property(flashcardArb, (card) => {
          const result = FlashcardSchema.safeParse(card)
          return result.success === true
        }),
        { numRuns: 200 }
      )
    })

    it('Property: Empty term always fails validation', () => {
      fc.assert(
        fc.property(
          fc.record({
            id: uuidArb,
            term: fc.constant(''),
            definition: fc.string({ minLength: 1 }),
            set_id: uuidArb,
          }),
          (card) => {
            const result = FlashcardSchema.safeParse(card)
            return result.success === false
          }
        ),
        { numRuns: 50 }
      )
    })

    it('Property: Empty definition always fails validation', () => {
      fc.assert(
        fc.property(
          fc.record({
            id: uuidArb,
            term: fc.string({ minLength: 1 }),
            definition: fc.constant(''),
            set_id: uuidArb,
          }),
          (card) => {
            const result = FlashcardSchema.safeParse(card)
            return result.success === false
          }
        ),
        { numRuns: 50 }
      )
    })
  })

  describe('MaterialFilterSchema', () => {
    it('Property: Valid filters always parse successfully', () => {
      fc.assert(
        fc.property(materialFilterArb, (filter) => {
          const result = MaterialFilterSchema.safeParse(filter)
          return result.success === true
        }),
        { numRuns: 50 }
      )
    })
  })
})
