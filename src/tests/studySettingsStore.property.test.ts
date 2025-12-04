import { describe, it, beforeEach, vi } from 'vitest'
import * as fc from 'fast-check'

// Mock localStorage before importing the store
const localStorageMock = {
  store: {} as Record<string, string>,
  getItem: vi.fn((key: string) => localStorageMock.store[key] || null),
  setItem: vi.fn((key: string, value: string) => { localStorageMock.store[key] = value }),
  removeItem: vi.fn((key: string) => { delete localStorageMock.store[key] }),
  clear: vi.fn(() => { localStorageMock.store = {} }),
  length: 0,
  key: vi.fn(() => null),
}
vi.stubGlobal('localStorage', localStorageMock)

import { useStudySettingsStore, getQuestionTypeForStage } from '@/lib/stores/studySettingsStore'
import type { QuestionType, PracticeQuestionType, StudySettings, PracticeSettings } from '@/lib/stores/studySettingsStore'

// Arbitraries
const questionTypeArb = fc.constantFrom<QuestionType>('mcq', 'truefalse', 'written', 'flashcard')
const practiceQuestionTypeArb = fc.constantFrom<PracticeQuestionType>('multipleChoice', 'trueFalse', 'fillBlank')
const frontSideArb = fc.constantFrom<'term' | 'definition'>('term', 'definition')
const stageArb = fc.constantFrom<'new' | 'learning' | 'almost_done' | 'mastered'>('new', 'learning', 'almost_done', 'mastered')

const studySettingsArb: fc.Arbitrary<Partial<StudySettings>> = fc.record({
  cardsPerRound: fc.integer({ min: 1, max: 50 }),
  frontSide: frontSideArb,
  enabledQuestionTypes: fc.array(questionTypeArb, { minLength: 1, maxLength: 4 }),
  shuffleTerms: fc.boolean(),
  studyStarred: fc.boolean(),
  smartGrading: fc.boolean(),
  retypeAnswers: fc.boolean(),
  overrideWrong: fc.boolean(),
  autoNextAfterAnswer: fc.boolean(),
  autoNextDuration: fc.integer({ min: 1, max: 10 }),
  darkStudyMode: fc.boolean(),
}, { requiredKeys: [] })

const practiceSettingsArb: fc.Arbitrary<Partial<PracticeSettings>> = fc.record({
  cardCount: fc.oneof(fc.integer({ min: 1, max: 100 }), fc.constant('max' as const)),
  enabledQuestionTypes: fc.array(practiceQuestionTypeArb, { minLength: 1, maxLength: 3 }),
  shuffleTerms: fc.boolean(),
  autoNextAfterAnswer: fc.boolean(),
  autoNextDuration: fc.integer({ min: 1, max: 10 }),
  darkStudyMode: fc.boolean(),
}, { requiredKeys: [] })

describe('Study Settings Store Property Tests', () => {
  beforeEach(() => {
    useStudySettingsStore.setState({
      studySettings: {
        cardsPerRound: 7,
        frontSide: 'definition',
        enabledQuestionTypes: ['mcq', 'truefalse', 'written', 'flashcard'],
        shuffleTerms: false,
        studyStarred: false,
        smartGrading: true,
        retypeAnswers: true,
        overrideWrong: true,
        autoNextAfterAnswer: true,
        autoNextDuration: 2,
        darkStudyMode: true,
      },
      practiceSettings: {
        cardCount: 'max',
        enabledQuestionTypes: ['multipleChoice', 'trueFalse', 'fillBlank'],
        shuffleTerms: true,
        autoNextAfterAnswer: true,
        autoNextDuration: 2,
        darkStudyMode: true,
      },
      settingsVersion: 0,
    })
  })


  describe('updateStudySettings', () => {
    it('Property: updateStudySettings merges partial settings correctly', () => {
      fc.assert(
        fc.property(studySettingsArb, (newSettings) => {
          const before = { ...useStudySettingsStore.getState().studySettings }
          useStudySettingsStore.getState().updateStudySettings(newSettings)
          const after = useStudySettingsStore.getState().studySettings

          // Check that provided keys are updated
          for (const key of Object.keys(newSettings) as (keyof StudySettings)[]) {
            const newVal = newSettings[key]
            const afterVal = after[key]
            if (Array.isArray(newVal)) {
              if (JSON.stringify(newVal) !== JSON.stringify(afterVal)) return false
            } else if (newVal !== afterVal) {
              return false
            }
          }

          // Check that non-provided keys remain unchanged
          for (const key of Object.keys(before) as (keyof StudySettings)[]) {
            if (!(key in newSettings)) {
              const beforeVal = before[key]
              const afterVal = after[key]
              if (Array.isArray(beforeVal)) {
                if (JSON.stringify(beforeVal) !== JSON.stringify(afterVal)) return false
              } else if (beforeVal !== afterVal) {
                return false
              }
            }
          }
          return true
        }),
        { numRuns: 100 }
      )
    })

    it('Property: updateStudySettings increments settingsVersion', () => {
      fc.assert(
        fc.property(studySettingsArb, (newSettings) => {
          const versionBefore = useStudySettingsStore.getState().settingsVersion
          useStudySettingsStore.getState().updateStudySettings(newSettings)
          const versionAfter = useStudySettingsStore.getState().settingsVersion
          return versionAfter === versionBefore + 1
        }),
        { numRuns: 50 }
      )
    })

    it('Property: cardsPerRound is always stored correctly', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 50 }), (cardsPerRound) => {
          useStudySettingsStore.getState().updateStudySettings({ cardsPerRound })
          return useStudySettingsStore.getState().studySettings.cardsPerRound === cardsPerRound
        }),
        { numRuns: 100 }
      )
    })

    it('Property: frontSide is always stored correctly', () => {
      fc.assert(
        fc.property(frontSideArb, (frontSide) => {
          useStudySettingsStore.getState().updateStudySettings({ frontSide })
          return useStudySettingsStore.getState().studySettings.frontSide === frontSide
        }),
        { numRuns: 20 }
      )
    })

    it('Property: enabledQuestionTypes preserves array contents', () => {
      fc.assert(
        fc.property(
          fc.array(questionTypeArb, { minLength: 1, maxLength: 4 }),
          (enabledQuestionTypes) => {
            useStudySettingsStore.getState().updateStudySettings({ enabledQuestionTypes })
            const stored = useStudySettingsStore.getState().studySettings.enabledQuestionTypes
            return (
              stored.length === enabledQuestionTypes.length &&
              enabledQuestionTypes.every((type, i) => stored[i] === type)
            )
          }
        ),
        { numRuns: 50 }
      )
    })
  })

  describe('updatePracticeSettings', () => {
    it('Property: updatePracticeSettings merges partial settings correctly', () => {
      fc.assert(
        fc.property(practiceSettingsArb, (newSettings) => {
          const before = { ...useStudySettingsStore.getState().practiceSettings }
          useStudySettingsStore.getState().updatePracticeSettings(newSettings)
          const after = useStudySettingsStore.getState().practiceSettings

          for (const key of Object.keys(newSettings) as (keyof PracticeSettings)[]) {
            const newVal = newSettings[key]
            const afterVal = after[key]
            if (Array.isArray(newVal)) {
              if (JSON.stringify(newVal) !== JSON.stringify(afterVal)) return false
            } else if (newVal !== afterVal) {
              return false
            }
          }

          for (const key of Object.keys(before) as (keyof PracticeSettings)[]) {
            if (!(key in newSettings)) {
              const beforeVal = before[key]
              const afterVal = after[key]
              if (Array.isArray(beforeVal)) {
                if (JSON.stringify(beforeVal) !== JSON.stringify(afterVal)) return false
              } else if (beforeVal !== afterVal) {
                return false
              }
            }
          }
          return true
        }),
        { numRuns: 100 }
      )
    })

    it('Property: updatePracticeSettings increments settingsVersion', () => {
      fc.assert(
        fc.property(practiceSettingsArb, (newSettings) => {
          const versionBefore = useStudySettingsStore.getState().settingsVersion
          useStudySettingsStore.getState().updatePracticeSettings(newSettings)
          const versionAfter = useStudySettingsStore.getState().settingsVersion
          return versionAfter === versionBefore + 1
        }),
        { numRuns: 50 }
      )
    })

    it('Property: cardCount handles both number and "max"', () => {
      fc.assert(
        fc.property(
          fc.oneof(fc.integer({ min: 1, max: 100 }), fc.constant('max' as const)),
          (cardCount) => {
            useStudySettingsStore.getState().updatePracticeSettings({ cardCount })
            return useStudySettingsStore.getState().practiceSettings.cardCount === cardCount
          }
        ),
        { numRuns: 50 }
      )
    })

    it('Property: practiceQuestionTypes preserves array contents', () => {
      fc.assert(
        fc.property(
          fc.array(practiceQuestionTypeArb, { minLength: 1, maxLength: 3 }),
          (enabledQuestionTypes) => {
            useStudySettingsStore.getState().updatePracticeSettings({ enabledQuestionTypes })
            const stored = useStudySettingsStore.getState().practiceSettings.enabledQuestionTypes
            return (
              stored.length === enabledQuestionTypes.length &&
              enabledQuestionTypes.every((type, i) => stored[i] === type)
            )
          }
        ),
        { numRuns: 50 }
      )
    })
  })


  describe('resetStudySettings', () => {
    it('Property: resetStudySettings restores default values', () => {
      fc.assert(
        fc.property(studySettingsArb, (randomSettings) => {
          // Apply random settings first
          useStudySettingsStore.getState().updateStudySettings(randomSettings)
          // Reset
          useStudySettingsStore.getState().resetStudySettings()
          const after = useStudySettingsStore.getState().studySettings

          return (
            after.cardsPerRound === 7 &&
            after.frontSide === 'definition' &&
            after.enabledQuestionTypes.length === 4 &&
            after.shuffleTerms === false &&
            after.studyStarred === false &&
            after.smartGrading === true &&
            after.retypeAnswers === true &&
            after.overrideWrong === true &&
            after.autoNextAfterAnswer === true &&
            after.autoNextDuration === 2 &&
            after.darkStudyMode === true
          )
        }),
        { numRuns: 50 }
      )
    })

    it('Property: resetStudySettings increments settingsVersion', () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 100 }), (initialVersion) => {
          useStudySettingsStore.setState({ settingsVersion: initialVersion })
          useStudySettingsStore.getState().resetStudySettings()
          return useStudySettingsStore.getState().settingsVersion === initialVersion + 1
        }),
        { numRuns: 50 }
      )
    })
  })

  describe('resetPracticeSettings', () => {
    it('Property: resetPracticeSettings restores default values', () => {
      fc.assert(
        fc.property(practiceSettingsArb, (randomSettings) => {
          useStudySettingsStore.getState().updatePracticeSettings(randomSettings)
          useStudySettingsStore.getState().resetPracticeSettings()
          const after = useStudySettingsStore.getState().practiceSettings

          return (
            after.cardCount === 'max' &&
            after.enabledQuestionTypes.length === 3 &&
            after.shuffleTerms === true &&
            after.autoNextAfterAnswer === true &&
            after.autoNextDuration === 2 &&
            after.darkStudyMode === true
          )
        }),
        { numRuns: 50 }
      )
    })

    it('Property: resetPracticeSettings increments settingsVersion', () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 100 }), (initialVersion) => {
          useStudySettingsStore.setState({ settingsVersion: initialVersion })
          useStudySettingsStore.getState().resetPracticeSettings()
          return useStudySettingsStore.getState().settingsVersion === initialVersion + 1
        }),
        { numRuns: 50 }
      )
    })
  })

  describe('getQuestionTypeForStage helper', () => {
    it('Property: returns preferred type when enabled', () => {
      const stageDefaults: Record<string, QuestionType> = {
        new: 'mcq',
        learning: 'truefalse',
        almost_done: 'written',
        mastered: 'flashcard',
      }

      fc.assert(
        fc.property(stageArb, (stage) => {
          const preferred = stageDefaults[stage]
          const enabledTypes: QuestionType[] = [preferred, 'mcq']
          const result = getQuestionTypeForStage(stage, enabledTypes)
          return result === preferred
        }),
        { numRuns: 40 }
      )
    })

    it('Property: falls back to first enabled type when preferred not available', () => {
      fc.assert(
        fc.property(
          fc.array(questionTypeArb, { minLength: 1, maxLength: 4 }),
          (enabledTypes) => {
            // Use a stage whose preferred type is not in enabledTypes
            const uniqueTypes = [...new Set(enabledTypes)]
            const result = getQuestionTypeForStage('new', uniqueTypes)
            // Should return either 'mcq' if enabled, or first type
            if (uniqueTypes.includes('mcq')) {
              return result === 'mcq'
            }
            return result === uniqueTypes[0]
          }
        ),
        { numRuns: 50 }
      )
    })

    it('Property: returns mcq as ultimate fallback for empty array', () => {
      fc.assert(
        fc.property(stageArb, (stage) => {
          const result = getQuestionTypeForStage(stage, [])
          return result === 'mcq'
        }),
        { numRuns: 20 }
      )
    })
  })

  describe('State Independence', () => {
    it('Property: study settings changes do not affect practice settings', () => {
      fc.assert(
        fc.property(studySettingsArb, (newStudySettings) => {
          const practiceBefore = { ...useStudySettingsStore.getState().practiceSettings }
          useStudySettingsStore.getState().updateStudySettings(newStudySettings)
          const practiceAfter = useStudySettingsStore.getState().practiceSettings

          return JSON.stringify(practiceBefore) === JSON.stringify(practiceAfter)
        }),
        { numRuns: 50 }
      )
    })

    it('Property: practice settings changes do not affect study settings', () => {
      fc.assert(
        fc.property(practiceSettingsArb, (newPracticeSettings) => {
          const studyBefore = { ...useStudySettingsStore.getState().studySettings }
          useStudySettingsStore.getState().updatePracticeSettings(newPracticeSettings)
          const studyAfter = useStudySettingsStore.getState().studySettings

          return JSON.stringify(studyBefore) === JSON.stringify(studyAfter)
        }),
        { numRuns: 50 }
      )
    })
  })
})
