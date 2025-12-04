import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import * as fc from 'fast-check'
import { usePomodoroStore } from '@/lib/stores/pomodoroStore'
import type { TimerPhase, PomodoroSettings } from '@/lib/schemas/pomodoro'

// Mock external dependencies
vi.mock('@/services/activity', () => ({
  logPomodoroSession: vi.fn().mockResolvedValue(undefined),
  XP_REWARDS: { POMODORO_WORK: 10, POMODORO_BREAK: 5 },
}))

vi.mock('@/lib/stores/xpStore', () => ({
  useXPStore: { getState: () => ({ fetchXPStats: vi.fn() }) },
}))

vi.mock('@/lib/stores/activityStore', () => ({
  useActivityStore: { getState: () => ({ fetchActivity: vi.fn() }) },
}))

// Arbitraries
const timerPhaseArb = fc.constantFrom<TimerPhase>('work', 'shortBreak', 'longBreak')
const durationArb = fc.integer({ min: 1, max: 120 })
const timeLeftArb = fc.integer({ min: 0, max: 7200 })

const settingsArb: fc.Arbitrary<PomodoroSettings> = fc.record({
  workDuration: fc.integer({ min: 1, max: 60 }),
  shortBreakDuration: fc.integer({ min: 1, max: 30 }),
  longBreakDuration: fc.integer({ min: 1, max: 60 }),
})

const taskTextArb = fc.string({ minLength: 1, maxLength: 200 })
const reminderTimeArb = fc.option(
  fc.date({ min: new Date(), max: new Date(Date.now() + 86400000) }).map(d => d.toISOString()),
  { nil: null }
)

describe('Pomodoro Store Property Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    usePomodoroStore.setState({
      settings: { workDuration: 25, shortBreakDuration: 5, longBreakDuration: 15 },
      timeLeft: 25 * 60,
      isRunning: false,
      phase: 'work',
      sessionCount: 0,
      tasks: [],
      showSettings: false,
      showToast: false,
      toastMessage: '',
      showConfetti: false,
      pendingPhasePrompt: false,
      pendingNextPhase: null,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  describe('setSettings', () => {
    it('Property: setSettings merges partial settings correctly', () => {
      fc.assert(
        fc.property(settingsArb, (newSettings) => {
          const initialSettings = usePomodoroStore.getState().settings
          usePomodoroStore.getState().setSettings(newSettings)
          const updated = usePomodoroStore.getState().settings
          
          return (
            updated.workDuration === newSettings.workDuration &&
            updated.shortBreakDuration === newSettings.shortBreakDuration &&
            updated.longBreakDuration === newSettings.longBreakDuration
          )
        }),
        { numRuns: 100 }
      )
    })

    it('Property: setSettings updates timeLeft when not running', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 60 }),
          timerPhaseArb,
          (workDuration, phase) => {
            usePomodoroStore.setState({ isRunning: false, phase })
            usePomodoroStore.getState().setSettings({ workDuration })
            
            const { timeLeft, settings } = usePomodoroStore.getState()
            const expectedDuration = phase === 'work' 
              ? settings.workDuration 
              : phase === 'shortBreak' 
                ? settings.shortBreakDuration 
                : settings.longBreakDuration
            
            return timeLeft === expectedDuration * 60
          }
        ),
        { numRuns: 100 }
      )
    })

    it('Property: setSettings does not change timeLeft when running', () => {
      fc.assert(
        fc.property(settingsArb, timeLeftArb, (newSettings, initialTimeLeft) => {
          usePomodoroStore.setState({ isRunning: true, timeLeft: initialTimeLeft })
          usePomodoroStore.getState().setSettings(newSettings)
          return usePomodoroStore.getState().timeLeft === initialTimeLeft
        }),
        { numRuns: 100 }
      )
    })
  })

  describe('setTimeLeft', () => {
    it('Property: setTimeLeft stores exact value', () => {
      fc.assert(
        fc.property(timeLeftArb, (time) => {
          usePomodoroStore.getState().setTimeLeft(time)
          return usePomodoroStore.getState().timeLeft === time
        }),
        { numRuns: 200 }
      )
    })
  })

  describe('setIsRunning', () => {
    it('Property: setIsRunning stores exact boolean', () => {
      fc.assert(
        fc.property(fc.boolean(), (running) => {
          usePomodoroStore.getState().setIsRunning(running)
          return usePomodoroStore.getState().isRunning === running
        }),
        { numRuns: 20 }
      )
    })
  })

  describe('setPhase', () => {
    it('Property: setPhase stores exact phase', () => {
      fc.assert(
        fc.property(timerPhaseArb, (phase) => {
          usePomodoroStore.getState().setPhase(phase)
          return usePomodoroStore.getState().phase === phase
        }),
        { numRuns: 30 }
      )
    })
  })

  describe('incrementSession', () => {
    it('Property: incrementSession increases count by 1', () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 100 }), (initialCount) => {
          usePomodoroStore.setState({ sessionCount: initialCount })
          usePomodoroStore.getState().incrementSession()
          return usePomodoroStore.getState().sessionCount === initialCount + 1
        }),
        { numRuns: 100 }
      )
    })
  })

  describe('Task Management', () => {
    it('Property: addTask increases task count by 1', () => {
      fc.assert(
        fc.property(taskTextArb, (text) => {
          const initialCount = usePomodoroStore.getState().tasks.length
          usePomodoroStore.getState().addTask(text)
          return usePomodoroStore.getState().tasks.length === initialCount + 1
        }),
        { numRuns: 100 }
      )
    })

    it('Property: addTask creates task with correct text', () => {
      fc.assert(
        fc.property(taskTextArb, (text) => {
          usePomodoroStore.setState({ tasks: [] })
          usePomodoroStore.getState().addTask(text)
          const tasks = usePomodoroStore.getState().tasks
          return tasks[0].text === text && tasks[0].completed === false
        }),
        { numRuns: 100 }
      )
    })

    it('Property: addTask with reminder creates task with reminder', () => {
      fc.assert(
        fc.property(
          taskTextArb,
          fc.date({ min: new Date() }).map(d => d.toISOString()),
          (text, reminderTime) => {
            usePomodoroStore.setState({ tasks: [] })
            usePomodoroStore.getState().addTask(text, reminderTime)
            const task = usePomodoroStore.getState().tasks[0]
            return (
              task.reminder !== undefined &&
              task.reminder.enabled === true &&
              task.reminder.time === reminderTime &&
              task.reminder.notified === false
            )
          }
        ),
        { numRuns: 50 }
      )
    })

    it('Property: toggleTask flips completed state', () => {
      fc.assert(
        fc.property(taskTextArb, fc.boolean(), (text, initialCompleted) => {
          usePomodoroStore.setState({ tasks: [] })
          usePomodoroStore.getState().addTask(text)
          const taskId = usePomodoroStore.getState().tasks[0].id
          
          // Set initial state
          usePomodoroStore.setState({
            tasks: usePomodoroStore.getState().tasks.map(t => 
              t.id === taskId ? { ...t, completed: initialCompleted } : t
            )
          })
          
          usePomodoroStore.getState().toggleTask(taskId)
          const task = usePomodoroStore.getState().tasks.find(t => t.id === taskId)
          return task?.completed === !initialCompleted
        }),
        { numRuns: 50 }
      )
    })

    it('Property: removeTask decreases count by 1', () => {
      fc.assert(
        fc.property(
          fc.array(taskTextArb, { minLength: 1, maxLength: 10 }),
          (texts) => {
            usePomodoroStore.setState({ tasks: [] })
            texts.forEach(text => usePomodoroStore.getState().addTask(text))
            
            const initialCount = usePomodoroStore.getState().tasks.length
            const taskId = usePomodoroStore.getState().tasks[0].id
            usePomodoroStore.getState().removeTask(taskId)
            
            return usePomodoroStore.getState().tasks.length === initialCount - 1
          }
        ),
        { numRuns: 50 }
      )
    })

    it('Property: removeTask removes correct task', () => {
      fc.assert(
        fc.property(
          fc.array(taskTextArb, { minLength: 2, maxLength: 10 }),
          fc.integer({ min: 0, max: 9 }),
          (texts, indexSeed) => {
            usePomodoroStore.setState({ tasks: [] })
            texts.forEach(text => usePomodoroStore.getState().addTask(text))
            
            const tasks = usePomodoroStore.getState().tasks
            const index = indexSeed % tasks.length
            const taskId = tasks[index].id
            
            usePomodoroStore.getState().removeTask(taskId)
            
            return !usePomodoroStore.getState().tasks.some(t => t.id === taskId)
          }
        ),
        { numRuns: 50 }
      )
    })

    it('Property: markTaskNotified sets notified to true', () => {
      fc.assert(
        fc.property(
          taskTextArb,
          fc.date({ min: new Date() }).map(d => d.toISOString()),
          (text, reminderTime) => {
            usePomodoroStore.setState({ tasks: [] })
            usePomodoroStore.getState().addTask(text, reminderTime)
            const taskId = usePomodoroStore.getState().tasks[0].id
            
            usePomodoroStore.getState().markTaskNotified(taskId)
            const task = usePomodoroStore.getState().tasks.find(t => t.id === taskId)
            
            return task?.reminder?.notified === true
          }
        ),
        { numRuns: 50 }
      )
    })
  })

  describe('switchPhase', () => {
    it('Property: switchPhase sets correct phase and timeLeft', () => {
      fc.assert(
        fc.property(timerPhaseArb, settingsArb, (newPhase, settings) => {
          usePomodoroStore.setState({ settings, isRunning: true })
          usePomodoroStore.getState().switchPhase(newPhase)
          
          const state = usePomodoroStore.getState()
          const expectedDuration = newPhase === 'work' 
            ? settings.workDuration 
            : newPhase === 'shortBreak' 
              ? settings.shortBreakDuration 
              : settings.longBreakDuration
          
          return (
            state.phase === newPhase &&
            state.timeLeft === expectedDuration * 60 &&
            state.isRunning === false
          )
        }),
        { numRuns: 100 }
      )
    })
  })

  describe('resetTimer', () => {
    it('Property: resetTimer resets to initial state for current phase', () => {
      fc.assert(
        fc.property(timerPhaseArb, settingsArb, (phase, settings) => {
          usePomodoroStore.setState({ 
            settings, 
            phase, 
            isRunning: true, 
            sessionCount: 5,
            timeLeft: 100 
          })
          
          usePomodoroStore.getState().resetTimer()
          const state = usePomodoroStore.getState()
          
          const expectedDuration = phase === 'work' 
            ? settings.workDuration 
            : phase === 'shortBreak' 
              ? settings.shortBreakDuration 
              : settings.longBreakDuration
          
          return (
            state.timeLeft === expectedDuration * 60 &&
            state.isRunning === false &&
            state.sessionCount === 0
          )
        }),
        { numRuns: 100 }
      )
    })
  })

  describe('UI State', () => {
    it('Property: setShowSettings stores exact boolean', () => {
      fc.assert(
        fc.property(fc.boolean(), (show) => {
          usePomodoroStore.getState().setShowSettings(show)
          return usePomodoroStore.getState().showSettings === show
        }),
        { numRuns: 20 }
      )
    })

    it('Property: setShowToast stores exact boolean', () => {
      fc.assert(
        fc.property(fc.boolean(), (show) => {
          usePomodoroStore.getState().setShowToast(show)
          return usePomodoroStore.getState().showToast === show
        }),
        { numRuns: 20 }
      )
    })

    it('Property: setToastMessage stores exact string', () => {
      fc.assert(
        fc.property(fc.string({ maxLength: 200 }), (message) => {
          usePomodoroStore.getState().setToastMessage(message)
          return usePomodoroStore.getState().toastMessage === message
        }),
        { numRuns: 100 }
      )
    })

    it('Property: setShowConfetti stores exact boolean', () => {
      fc.assert(
        fc.property(fc.boolean(), (show) => {
          usePomodoroStore.getState().setShowConfetti(show)
          return usePomodoroStore.getState().showConfetti === show
        }),
        { numRuns: 20 }
      )
    })
  })

  describe('Phase Prompt', () => {
    it('Property: dismissPhasePrompt clears pending state and sets up next phase', () => {
      fc.assert(
        fc.property(timerPhaseArb, settingsArb, (nextPhase, settings) => {
          usePomodoroStore.setState({
            settings,
            pendingPhasePrompt: true,
            pendingNextPhase: nextPhase,
          })
          
          usePomodoroStore.getState().dismissPhasePrompt()
          const state = usePomodoroStore.getState()
          
          const expectedDuration = nextPhase === 'work' 
            ? settings.workDuration 
            : nextPhase === 'shortBreak' 
              ? settings.shortBreakDuration 
              : settings.longBreakDuration
          
          return (
            state.pendingPhasePrompt === false &&
            state.pendingNextPhase === null &&
            state.phase === nextPhase &&
            state.timeLeft === expectedDuration * 60
          )
        }),
        { numRuns: 50 }
      )
    })
  })
})
