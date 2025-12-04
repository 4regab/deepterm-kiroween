import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  ActivityDaySchema,
  UserStatsSchema,
  CalendarDataSchema,
} from '@/lib/schemas/activity'

// Arbitraries
const dateStringArb = fc.date().map(d => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
})

const activityDayArb = fc.record({
  activity_date: dateStringArb,
  minutes_studied: fc.integer({ min: 0, max: 1440 }), // Max 24 hours
  level: fc.integer({ min: 0, max: 4 }),
})

const userStatsArb = fc.record({
  total_study_minutes: fc.integer({ min: 0, max: 1000000 }),
  current_streak: fc.integer({ min: 0, max: 10000 }),
  longest_streak: fc.option(fc.integer({ min: 0, max: 10000 }), { nil: undefined }),
})

const calendarDataArb = fc.record({
  activity: fc.array(activityDayArb, { minLength: 0, maxLength: 365 }),
  stats: fc.option(userStatsArb, { nil: null }),
})

describe('Activity Schema Property Tests', () => {
  describe('ActivityDaySchema', () => {
    it('Property: Valid activity days always parse', () => {
      fc.assert(
        fc.property(activityDayArb, (day) => {
          const result = ActivityDaySchema.safeParse(day)
          return result.success === true
        }),
        { numRuns: 500 }
      )
    })

    it('Property: Negative minutes_studied always fails', () => {
      fc.assert(
        fc.property(
          fc.record({
            activity_date: dateStringArb,
            minutes_studied: fc.integer({ min: -1000, max: -1 }),
            level: fc.integer({ min: 0, max: 4 }),
          }),
          (day) => {
            const result = ActivityDaySchema.safeParse(day)
            return result.success === false
          }
        ),
        { numRuns: 100 }
      )
    })

    it('Property: Level below 0 always fails', () => {
      fc.assert(
        fc.property(
          fc.record({
            activity_date: dateStringArb,
            minutes_studied: fc.integer({ min: 0 }),
            level: fc.integer({ min: -100, max: -1 }),
          }),
          (day) => {
            const result = ActivityDaySchema.safeParse(day)
            return result.success === false
          }
        ),
        { numRuns: 100 }
      )
    })

    it('Property: Level above 4 always fails', () => {
      fc.assert(
        fc.property(
          fc.record({
            activity_date: dateStringArb,
            minutes_studied: fc.integer({ min: 0 }),
            level: fc.integer({ min: 5, max: 100 }),
          }),
          (day) => {
            const result = ActivityDaySchema.safeParse(day)
            return result.success === false
          }
        ),
        { numRuns: 100 }
      )
    })

    it('Property: All valid level values (0-4) parse successfully', () => {
      const validLevels = [0, 1, 2, 3, 4]
      for (const level of validLevels) {
        const result = ActivityDaySchema.safeParse({
          activity_date: '2024-01-15',
          minutes_studied: 60,
          level,
        })
        expect(result.success).toBe(true)
      }
    })
  })

  describe('UserStatsSchema', () => {
    it('Property: Valid user stats always parse', () => {
      fc.assert(
        fc.property(userStatsArb, (stats) => {
          const result = UserStatsSchema.safeParse(stats)
          return result.success === true
        }),
        { numRuns: 200 }
      )
    })

    it('Property: Negative total_study_minutes always fails', () => {
      fc.assert(
        fc.property(
          fc.record({
            total_study_minutes: fc.integer({ min: -10000, max: -1 }),
            current_streak: fc.integer({ min: 0 }),
          }),
          (stats) => {
            const result = UserStatsSchema.safeParse(stats)
            return result.success === false
          }
        ),
        { numRuns: 100 }
      )
    })

    it('Property: Negative current_streak always fails', () => {
      fc.assert(
        fc.property(
          fc.record({
            total_study_minutes: fc.integer({ min: 0 }),
            current_streak: fc.integer({ min: -10000, max: -1 }),
          }),
          (stats) => {
            const result = UserStatsSchema.safeParse(stats)
            return result.success === false
          }
        ),
        { numRuns: 100 }
      )
    })

    it('Property: Optional longest_streak can be undefined', () => {
      fc.assert(
        fc.property(
          fc.record({
            total_study_minutes: fc.integer({ min: 0 }),
            current_streak: fc.integer({ min: 0 }),
          }),
          (stats) => {
            const result = UserStatsSchema.safeParse(stats)
            return result.success === true
          }
        ),
        { numRuns: 100 }
      )
    })

    it('Property: Negative longest_streak always fails', () => {
      fc.assert(
        fc.property(
          fc.record({
            total_study_minutes: fc.integer({ min: 0 }),
            current_streak: fc.integer({ min: 0 }),
            longest_streak: fc.integer({ min: -10000, max: -1 }),
          }),
          (stats) => {
            const result = UserStatsSchema.safeParse(stats)
            return result.success === false
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('CalendarDataSchema', () => {
    it('Property: Valid calendar data always parses', () => {
      fc.assert(
        fc.property(calendarDataArb, (data) => {
          const result = CalendarDataSchema.safeParse(data)
          return result.success === true
        }),
        { numRuns: 200 }
      )
    })

    it('Property: Empty activity array is valid', () => {
      fc.assert(
        fc.property(
          fc.record({
            activity: fc.constant([]),
            stats: fc.option(userStatsArb, { nil: null }),
          }),
          (data) => {
            const result = CalendarDataSchema.safeParse(data)
            return result.success === true
          }
        ),
        { numRuns: 50 }
      )
    })

    it('Property: Null stats is valid', () => {
      fc.assert(
        fc.property(
          fc.record({
            activity: fc.array(activityDayArb, { minLength: 0, maxLength: 10 }),
            stats: fc.constant(null),
          }),
          (data) => {
            const result = CalendarDataSchema.safeParse(data)
            return result.success === true
          }
        ),
        { numRuns: 50 }
      )
    })
  })

  describe('Edge Cases', () => {
    it('Property: Zero values are valid for all numeric fields', () => {
      const zeroStats = {
        total_study_minutes: 0,
        current_streak: 0,
        longest_streak: 0,
      }
      expect(UserStatsSchema.safeParse(zeroStats).success).toBe(true)

      const zeroActivity = {
        activity_date: '2024-01-01',
        minutes_studied: 0,
        level: 0,
      }
      expect(ActivityDaySchema.safeParse(zeroActivity).success).toBe(true)
    })

    it('Property: Large but valid values parse successfully', () => {
      const largeStats = {
        total_study_minutes: 999999,
        current_streak: 9999,
        longest_streak: 9999,
      }
      expect(UserStatsSchema.safeParse(largeStats).success).toBe(true)
    })
  })
})
