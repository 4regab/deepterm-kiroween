import { describe, it, beforeEach, vi } from 'vitest'
import * as fc from 'fast-check'
import { useUIStore } from '@/lib/stores/uiStore'

// Mock localStorage and window
const localStorageMock = {
  store: {} as Record<string, string>,
  getItem: vi.fn((key: string) => localStorageMock.store[key] || null),
  setItem: vi.fn((key: string, value: string) => { localStorageMock.store[key] = value }),
  removeItem: vi.fn((key: string) => { delete localStorageMock.store[key] }),
  clear: vi.fn(() => { localStorageMock.store = {} }),
}

vi.stubGlobal('localStorage', localStorageMock)
vi.stubGlobal('window', {
  localStorage: localStorageMock,
  dispatchEvent: vi.fn(),
})

describe('UI Store Property Tests', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
    useUIStore.setState({
      sidebarPinned: false,
      sidebarMobileOpen: false,
      profileMenuOpen: false,
    })
  })

  describe('setSidebarPinned', () => {
    it('Property: setSidebarPinned stores exact boolean value', () => {
      fc.assert(
        fc.property(fc.boolean(), (pinned) => {
          useUIStore.getState().setSidebarPinned(pinned)
          return useUIStore.getState().sidebarPinned === pinned
        }),
        { numRuns: 20 }
      )
    })

    it('Property: setSidebarPinned is idempotent', () => {
      fc.assert(
        fc.property(fc.boolean(), (pinned) => {
          useUIStore.getState().setSidebarPinned(pinned)
          const first = useUIStore.getState().sidebarPinned
          useUIStore.getState().setSidebarPinned(pinned)
          const second = useUIStore.getState().sidebarPinned
          return first === second
        }),
        { numRuns: 20 }
      )
    })

    it('Property: setSidebarPinned does not affect other UI state', () => {
      fc.assert(
        fc.property(fc.boolean(), fc.boolean(), fc.boolean(), (pinned, mobileOpen, menuOpen) => {
          useUIStore.setState({ sidebarMobileOpen: mobileOpen, profileMenuOpen: menuOpen })
          useUIStore.getState().setSidebarPinned(pinned)
          return (
            useUIStore.getState().sidebarMobileOpen === mobileOpen &&
            useUIStore.getState().profileMenuOpen === menuOpen
          )
        }),
        { numRuns: 20 }
      )
    })
  })

  describe('toggleSidebarPinned', () => {
    it('Property: toggleSidebarPinned flips the pinned state', () => {
      fc.assert(
        fc.property(fc.boolean(), (initialPinned) => {
          useUIStore.setState({ sidebarPinned: initialPinned })
          useUIStore.getState().toggleSidebarPinned()
          return useUIStore.getState().sidebarPinned === !initialPinned
        }),
        { numRuns: 20 }
      )
    })

    it('Property: double toggle returns to original state', () => {
      fc.assert(
        fc.property(fc.boolean(), (initialPinned) => {
          useUIStore.setState({ sidebarPinned: initialPinned })
          useUIStore.getState().toggleSidebarPinned()
          useUIStore.getState().toggleSidebarPinned()
          return useUIStore.getState().sidebarPinned === initialPinned
        }),
        { numRuns: 20 }
      )
    })

    it('Property: toggle does not affect other UI state', () => {
      fc.assert(
        fc.property(fc.boolean(), fc.boolean(), fc.boolean(), (pinned, mobileOpen, menuOpen) => {
          useUIStore.setState({ sidebarPinned: pinned, sidebarMobileOpen: mobileOpen, profileMenuOpen: menuOpen })
          useUIStore.getState().toggleSidebarPinned()
          return (
            useUIStore.getState().sidebarMobileOpen === mobileOpen &&
            useUIStore.getState().profileMenuOpen === menuOpen
          )
        }),
        { numRuns: 20 }
      )
    })
  })

  describe('setSidebarMobileOpen', () => {
    it('Property: setSidebarMobileOpen stores exact boolean value', () => {
      fc.assert(
        fc.property(fc.boolean(), (open) => {
          useUIStore.getState().setSidebarMobileOpen(open)
          return useUIStore.getState().sidebarMobileOpen === open
        }),
        { numRuns: 20 }
      )
    })

    it('Property: setSidebarMobileOpen is idempotent', () => {
      fc.assert(
        fc.property(fc.boolean(), (open) => {
          useUIStore.getState().setSidebarMobileOpen(open)
          const first = useUIStore.getState().sidebarMobileOpen
          useUIStore.getState().setSidebarMobileOpen(open)
          const second = useUIStore.getState().sidebarMobileOpen
          return first === second
        }),
        { numRuns: 20 }
      )
    })

    it('Property: setSidebarMobileOpen does not affect other UI state', () => {
      fc.assert(
        fc.property(fc.boolean(), fc.boolean(), fc.boolean(), (pinned, mobileOpen, menuOpen) => {
          useUIStore.setState({ sidebarPinned: pinned, profileMenuOpen: menuOpen })
          useUIStore.getState().setSidebarMobileOpen(mobileOpen)
          return (
            useUIStore.getState().sidebarPinned === pinned &&
            useUIStore.getState().profileMenuOpen === menuOpen
          )
        }),
        { numRuns: 20 }
      )
    })
  })

  describe('setProfileMenuOpen', () => {
    it('Property: setProfileMenuOpen stores exact boolean value', () => {
      fc.assert(
        fc.property(fc.boolean(), (open) => {
          useUIStore.getState().setProfileMenuOpen(open)
          return useUIStore.getState().profileMenuOpen === open
        }),
        { numRuns: 20 }
      )
    })

    it('Property: setProfileMenuOpen is idempotent', () => {
      fc.assert(
        fc.property(fc.boolean(), (open) => {
          useUIStore.getState().setProfileMenuOpen(open)
          const first = useUIStore.getState().profileMenuOpen
          useUIStore.getState().setProfileMenuOpen(open)
          const second = useUIStore.getState().profileMenuOpen
          return first === second
        }),
        { numRuns: 20 }
      )
    })

    it('Property: setProfileMenuOpen does not affect other UI state', () => {
      fc.assert(
        fc.property(fc.boolean(), fc.boolean(), fc.boolean(), (pinned, mobileOpen, menuOpen) => {
          useUIStore.setState({ sidebarPinned: pinned, sidebarMobileOpen: mobileOpen })
          useUIStore.getState().setProfileMenuOpen(menuOpen)
          return (
            useUIStore.getState().sidebarPinned === pinned &&
            useUIStore.getState().sidebarMobileOpen === mobileOpen
          )
        }),
        { numRuns: 20 }
      )
    })
  })

  describe('State Independence', () => {
    it('Property: all UI states are independent', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          fc.boolean(),
          fc.boolean(),
          (pinned, mobileOpen, menuOpen) => {
            useUIStore.setState({
              sidebarPinned: pinned,
              sidebarMobileOpen: mobileOpen,
              profileMenuOpen: menuOpen,
            })

            // Verify all states are set correctly
            const state = useUIStore.getState()
            return (
              state.sidebarPinned === pinned &&
              state.sidebarMobileOpen === mobileOpen &&
              state.profileMenuOpen === menuOpen
            )
          }
        ),
        { numRuns: 50 }
      )
    })

    it('Property: sequential state changes are independent', () => {
      fc.assert(
        fc.property(
          fc.array(fc.tuple(
            fc.constantFrom('pinned', 'mobile', 'menu'),
            fc.boolean()
          ), { minLength: 1, maxLength: 10 }),
          (operations) => {
            useUIStore.setState({
              sidebarPinned: false,
              sidebarMobileOpen: false,
              profileMenuOpen: false,
            })

            let expectedPinned = false
            let expectedMobile = false
            let expectedMenu = false

            for (const [op, value] of operations) {
              switch (op) {
                case 'pinned':
                  useUIStore.getState().setSidebarPinned(value)
                  expectedPinned = value
                  break
                case 'mobile':
                  useUIStore.getState().setSidebarMobileOpen(value)
                  expectedMobile = value
                  break
                case 'menu':
                  useUIStore.getState().setProfileMenuOpen(value)
                  expectedMenu = value
                  break
              }
            }

            const state = useUIStore.getState()
            return (
              state.sidebarPinned === expectedPinned &&
              state.sidebarMobileOpen === expectedMobile &&
              state.profileMenuOpen === expectedMenu
            )
          }
        ),
        { numRuns: 50 }
      )
    })
  })
})
