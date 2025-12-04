import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { AchievementIconSchema, AchievementSchema } from '@/lib/schemas/achievements'

// Arbitraries
const achievementIconArb = fc.constantFrom(
  'Trophy', 'Zap', 'BrainCircuit', 'Star', 'Flame',
  'Timer', 'Clock', 'BookOpen', 'FileText', 'Upload'
)

const achievementArb = fc.record({
  id: fc.string({ minLength: 1, maxLength: 50 }),
  title: fc.string({ minLength: 1, maxLength: 100 }),
  description: fc.string({ minLength: 1, maxLength: 500 }),
  icon: fc.string({ minLength: 1, maxLength: 50 }),
  color: fc.string({ minLength: 1, maxLength: 50 }),
  bg: fc.string({ minLength: 1, maxLength: 50 }),
  progress: fc.integer({ min: 0, max: 10000 }),
  requirement_value: fc.integer({ min: 1, max: 10000 }),
  unlocked: fc.boolean(),
  unlocked_at: fc.option(fc.date().map(d => d.toISOString()), { nil: null }),
})

describe('Achievements Schema Property Tests', () => {
  describe('AchievementIconSchema', () => {
    it('Property: Valid achievement icons always parse', () => {
      fc.assert(
        fc.property(achievementIconArb, (icon) => {
          const result = AchievementIconSchema.safeParse(icon)
          return result.success === true
        }),
        { numRuns: 100 }
      )
    })

    it('Property: Invalid achievement icons always fail', () => {
      const invalidIcons = fc.string().filter(s => 
        !['Trophy', 'Zap', 'BrainCircuit', 'Star', 'Flame', 'Timer', 'Clock', 'BookOpen', 'FileText', 'Upload'].includes(s)
      )
      fc.assert(
        fc.property(invalidIcons, (icon) => {
          const result = AchievementIconSchema.safeParse(icon)
          return result.success === false
        }),
        { numRuns: 100 }
      )
    })

    it('Property: All valid icons are enumerated', () => {
      const validIcons = ['Trophy', 'Zap', 'BrainCircuit', 'Star', 'Flame', 'Timer', 'Clock', 'BookOpen', 'FileText', 'Upload']
      for (const icon of validIcons) {
        const result = AchievementIconSchema.safeParse(icon)
        expect(result.success).toBe(true)
      }
    })
  })

  describe('AchievementSchema', () => {
    it('Property: Valid achievements always parse', () => {
      fc.assert(
        fc.property(achievementArb, (achievement) => {
          const result = AchievementSchema.safeParse(achievement)
          return result.success === true
        }),
        { numRuns: 500 }
      )
    })

    it('Property: Negative progress always fails', () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.string({ minLength: 1 }),
            title: fc.string({ minLength: 1 }),
            description: fc.string({ minLength: 1 }),
            icon: fc.string({ minLength: 1 }),
            color: fc.string({ minLength: 1 }),
            bg: fc.string({ minLength: 1 }),
            progress: fc.integer({ min: -1000, max: -1 }),
            requirement_value: fc.integer({ min: 1 }),
            unlocked: fc.boolean(),
          }),
          (achievement) => {
            const result = AchievementSchema.safeParse(achievement)
            return result.success === false
          }
        ),
        { numRuns: 100 }
      )
    })

    it('Property: Zero or negative requirement_value always fails', () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.string({ minLength: 1 }),
            title: fc.string({ minLength: 1 }),
            description: fc.string({ minLength: 1 }),
            icon: fc.string({ minLength: 1 }),
            color: fc.string({ minLength: 1 }),
            bg: fc.string({ minLength: 1 }),
            progress: fc.integer({ min: 0 }),
            requirement_value: fc.integer({ min: -1000, max: 0 }),
            unlocked: fc.boolean(),
          }),
          (achievement) => {
            const result = AchievementSchema.safeParse(achievement)
            return result.success === false
          }
        ),
        { numRuns: 100 }
      )
    })

    it('Property: Null unlocked_at is valid', () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.string({ minLength: 1 }),
            title: fc.string({ minLength: 1 }),
            description: fc.string({ minLength: 1 }),
            icon: fc.string({ minLength: 1 }),
            color: fc.string({ minLength: 1 }),
            bg: fc.string({ minLength: 1 }),
            progress: fc.integer({ min: 0 }),
            requirement_value: fc.integer({ min: 1 }),
            unlocked: fc.boolean(),
            unlocked_at: fc.constant(null),
          }),
          (achievement) => {
            const result = AchievementSchema.safeParse(achievement)
            return result.success === true
          }
        ),
        { numRuns: 100 }
      )
    })

    it('Property: Optional unlocked_at can be omitted', () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.string({ minLength: 1 }),
            title: fc.string({ minLength: 1 }),
            description: fc.string({ minLength: 1 }),
            icon: fc.string({ minLength: 1 }),
            color: fc.string({ minLength: 1 }),
            bg: fc.string({ minLength: 1 }),
            progress: fc.integer({ min: 0 }),
            requirement_value: fc.integer({ min: 1 }),
            unlocked: fc.boolean(),
          }),
          (achievement) => {
            const result = AchievementSchema.safeParse(achievement)
            return result.success === true
          }
        ),
        { numRuns: 100 }
      )
    })

    it('Property: Non-integer progress always fails', () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.string({ minLength: 1 }),
            title: fc.string({ minLength: 1 }),
            description: fc.string({ minLength: 1 }),
            icon: fc.string({ minLength: 1 }),
            color: fc.string({ minLength: 1 }),
            bg: fc.string({ minLength: 1 }),
            progress: fc.double({ min: 0.1, max: 100, noInteger: true }),
            requirement_value: fc.integer({ min: 1 }),
            unlocked: fc.boolean(),
          }),
          (achievement) => {
            const result = AchievementSchema.safeParse(achievement)
            return result.success === false
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('Business Logic Properties', () => {
    it('Property: Progress can exceed requirement_value (for display purposes)', () => {
      // This tests that the schema allows progress > requirement
      // which might happen before the unlocked flag is set
      fc.assert(
        fc.property(
          fc.record({
            id: fc.string({ minLength: 1 }),
            title: fc.string({ minLength: 1 }),
            description: fc.string({ minLength: 1 }),
            icon: fc.string({ minLength: 1 }),
            color: fc.string({ minLength: 1 }),
            bg: fc.string({ minLength: 1 }),
            progress: fc.integer({ min: 100, max: 1000 }),
            requirement_value: fc.integer({ min: 1, max: 99 }),
            unlocked: fc.boolean(),
          }),
          (achievement) => {
            const result = AchievementSchema.safeParse(achievement)
            return result.success === true
          }
        ),
        { numRuns: 100 }
      )
    })

    it('Property: Zero progress is valid (new achievement)', () => {
      const result = AchievementSchema.safeParse({
        id: 'test-1',
        title: 'First Steps',
        description: 'Complete your first study session',
        icon: 'Trophy',
        color: 'text-yellow-500',
        bg: 'bg-yellow-100',
        progress: 0,
        requirement_value: 1,
        unlocked: false,
      })
      expect(result.success).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('Property: Very large progress values are valid', () => {
      const result = AchievementSchema.safeParse({
        id: 'test-1',
        title: 'Marathon Learner',
        description: 'Study for 10000 minutes',
        icon: 'Timer',
        color: 'text-blue-500',
        bg: 'bg-blue-100',
        progress: 9999,
        requirement_value: 10000,
        unlocked: false,
      })
      expect(result.success).toBe(true)
    })

    it('Property: Minimum requirement_value of 1 is valid', () => {
      const result = AchievementSchema.safeParse({
        id: 'test-1',
        title: 'Quick Win',
        description: 'Do one thing',
        icon: 'Star',
        color: 'text-yellow-500',
        bg: 'bg-yellow-100',
        progress: 0,
        requirement_value: 1,
        unlocked: false,
      })
      expect(result.success).toBe(true)
    })
  })
})
