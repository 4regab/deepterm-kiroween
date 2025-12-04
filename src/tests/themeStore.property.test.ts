import { describe, it, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import { useThemeStore } from '@/lib/stores/themeStore'
import type { ThemeMode } from '@/lib/stores/themeStore'

// Arbitraries
const themeModeArb = fc.constantFrom<ThemeMode>('normal', 'spooky')

describe('Theme Store Property Tests', () => {
  beforeEach(() => {
    useThemeStore.setState({
      theme: 'spooky',
      soundEnabled: false,
    })
  })

  describe('setTheme', () => {
    it('Property: setTheme stores exact theme value', () => {
      fc.assert(
        fc.property(themeModeArb, (theme) => {
          useThemeStore.getState().setTheme(theme)
          return useThemeStore.getState().theme === theme
        }),
        { numRuns: 20 }
      )
    })

    it('Property: setTheme is idempotent', () => {
      fc.assert(
        fc.property(themeModeArb, (theme) => {
          useThemeStore.getState().setTheme(theme)
          const first = useThemeStore.getState().theme
          useThemeStore.getState().setTheme(theme)
          const second = useThemeStore.getState().theme
          return first === second
        }),
        { numRuns: 20 }
      )
    })
  })

  describe('toggleTheme', () => {
    it('Property: toggleTheme alternates between normal and spooky', () => {
      fc.assert(
        fc.property(themeModeArb, (initialTheme) => {
          useThemeStore.setState({ theme: initialTheme })
          useThemeStore.getState().toggleTheme()
          const expected = initialTheme === 'normal' ? 'spooky' : 'normal'
          return useThemeStore.getState().theme === expected
        }),
        { numRuns: 20 }
      )
    })

    it('Property: double toggle returns to original theme', () => {
      fc.assert(
        fc.property(themeModeArb, (initialTheme) => {
          useThemeStore.setState({ theme: initialTheme })
          useThemeStore.getState().toggleTheme()
          useThemeStore.getState().toggleTheme()
          return useThemeStore.getState().theme === initialTheme
        }),
        { numRuns: 20 }
      )
    })

    it('Property: toggle does not affect soundEnabled', () => {
      fc.assert(
        fc.property(themeModeArb, fc.boolean(), (theme, soundEnabled) => {
          useThemeStore.setState({ theme, soundEnabled })
          const soundBefore = useThemeStore.getState().soundEnabled
          useThemeStore.getState().toggleTheme()
          return useThemeStore.getState().soundEnabled === soundBefore
        }),
        { numRuns: 20 }
      )
    })
  })

  describe('setSoundEnabled', () => {
    it('Property: setSoundEnabled stores exact boolean value', () => {
      fc.assert(
        fc.property(fc.boolean(), (enabled) => {
          useThemeStore.getState().setSoundEnabled(enabled)
          return useThemeStore.getState().soundEnabled === enabled
        }),
        { numRuns: 20 }
      )
    })

    it('Property: setSoundEnabled is idempotent', () => {
      fc.assert(
        fc.property(fc.boolean(), (enabled) => {
          useThemeStore.getState().setSoundEnabled(enabled)
          const first = useThemeStore.getState().soundEnabled
          useThemeStore.getState().setSoundEnabled(enabled)
          const second = useThemeStore.getState().soundEnabled
          return first === second
        }),
        { numRuns: 20 }
      )
    })

    it('Property: setSoundEnabled does not affect theme', () => {
      fc.assert(
        fc.property(themeModeArb, fc.boolean(), (theme, enabled) => {
          useThemeStore.setState({ theme })
          const themeBefore = useThemeStore.getState().theme
          useThemeStore.getState().setSoundEnabled(enabled)
          return useThemeStore.getState().theme === themeBefore
        }),
        { numRuns: 20 }
      )
    })
  })

  describe('toggleSound', () => {
    it('Property: toggleSound flips soundEnabled', () => {
      fc.assert(
        fc.property(fc.boolean(), (initialSound) => {
          useThemeStore.setState({ soundEnabled: initialSound })
          useThemeStore.getState().toggleSound()
          return useThemeStore.getState().soundEnabled === !initialSound
        }),
        { numRuns: 20 }
      )
    })

    it('Property: double toggleSound returns to original', () => {
      fc.assert(
        fc.property(fc.boolean(), (initialSound) => {
          useThemeStore.setState({ soundEnabled: initialSound })
          useThemeStore.getState().toggleSound()
          useThemeStore.getState().toggleSound()
          return useThemeStore.getState().soundEnabled === initialSound
        }),
        { numRuns: 20 }
      )
    })

    it('Property: toggleSound does not affect theme', () => {
      fc.assert(
        fc.property(themeModeArb, fc.boolean(), (theme, soundEnabled) => {
          useThemeStore.setState({ theme, soundEnabled })
          const themeBefore = useThemeStore.getState().theme
          useThemeStore.getState().toggleSound()
          return useThemeStore.getState().theme === themeBefore
        }),
        { numRuns: 20 }
      )
    })
  })

  describe('State Independence', () => {
    it('Property: theme and sound are independent', () => {
      fc.assert(
        fc.property(themeModeArb, fc.boolean(), (theme, sound) => {
          useThemeStore.setState({ theme, soundEnabled: sound })
          
          // Toggle theme
          useThemeStore.getState().toggleTheme()
          const soundAfterThemeToggle = useThemeStore.getState().soundEnabled
          
          // Toggle sound
          useThemeStore.getState().toggleSound()
          const themeAfterSoundToggle = useThemeStore.getState().theme
          
          // Sound should be unchanged after theme toggle
          // Theme should be the toggled value after sound toggle
          const expectedTheme = theme === 'normal' ? 'spooky' : 'normal'
          return soundAfterThemeToggle === sound && themeAfterSoundToggle === expectedTheme
        }),
        { numRuns: 20 }
      )
    })
  })
})
