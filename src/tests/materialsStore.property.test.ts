import { describe, it, expect, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import { useMaterialsStore } from '@/lib/stores/materialsStore'
import type { MaterialItem, MaterialFilter } from '@/lib/schemas/materials'

// Arbitraries
const uuidArb = fc.uuid()
const materialTypeArb = fc.constantFrom<'Note' | 'Flashcards' | 'Reviewer'>('Note', 'Flashcards', 'Reviewer')
const materialFilterArb = fc.constantFrom<MaterialFilter>('All', 'Note', 'Flashcards', 'Reviewer', 'Cards')
const isoDateArb = fc.date().map(d => d.toISOString())

const materialItemArb: fc.Arbitrary<MaterialItem> = fc.record({
  id: uuidArb,
  title: fc.string({ minLength: 1, maxLength: 100 }),
  type: materialTypeArb,
  itemsCount: fc.integer({ min: 0, max: 1000 }),
  lastAccessed: isoDateArb,
  sortDate: fc.option(isoDateArb, { nil: undefined }),
})

const materialsArrayArb = fc.array(materialItemArb, { minLength: 0, maxLength: 50 })

describe('Materials Store Property Tests', () => {
  beforeEach(() => {
    // Reset store state before each test
    useMaterialsStore.setState({
      items: [],
      searchQuery: '',
      activeFilter: 'All',
      loading: false,
      error: null,
    })
  })

  describe('setItems', () => {
    it('Property: setItems stores exactly the provided items', () => {
      fc.assert(
        fc.property(materialsArrayArb, (items) => {
          useMaterialsStore.getState().setItems(items)
          const stored = useMaterialsStore.getState().items
          return stored.length === items.length &&
            stored.every((item, i) => item.id === items[i].id)
        }),
        { numRuns: 200 }
      )
    })

    it('Property: setItems is idempotent', () => {
      fc.assert(
        fc.property(materialsArrayArb, (items) => {
          useMaterialsStore.getState().setItems(items)
          const first = [...useMaterialsStore.getState().items]
          useMaterialsStore.getState().setItems(items)
          const second = useMaterialsStore.getState().items
          return first.length === second.length &&
            first.every((item, i) => item.id === second[i].id)
        }),
        { numRuns: 100 }
      )
    })
  })

  describe('removeItem', () => {
    it('Property: removeItem decreases count by 1 when item exists', () => {
      fc.assert(
        fc.property(
          materialsArrayArb.filter(arr => arr.length > 0),
          (items) => {
            useMaterialsStore.getState().setItems(items)
            const initialCount = useMaterialsStore.getState().items.length
            const idToRemove = items[0].id
            useMaterialsStore.getState().removeItem(idToRemove)
            const finalCount = useMaterialsStore.getState().items.length
            return finalCount === initialCount - 1
          }
        ),
        { numRuns: 100 }
      )
    })

    it('Property: removeItem removes the correct item', () => {
      fc.assert(
        fc.property(
          materialsArrayArb.filter(arr => arr.length > 0),
          fc.integer({ min: 0, max: 49 }),
          (items, indexSeed) => {
            const validItems = items.slice(0, 50)
            if (validItems.length === 0) return true
            
            const index = indexSeed % validItems.length
            useMaterialsStore.getState().setItems(validItems)
            const idToRemove = validItems[index].id
            useMaterialsStore.getState().removeItem(idToRemove)
            const remaining = useMaterialsStore.getState().items
            return !remaining.some(item => item.id === idToRemove)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('Property: removeItem with non-existent ID does not change items', () => {
      fc.assert(
        fc.property(materialsArrayArb, uuidArb, (items, fakeId) => {
          // Ensure fakeId is not in items
          const safeItems = items.filter(item => item.id !== fakeId)
          useMaterialsStore.getState().setItems(safeItems)
          const initialCount = useMaterialsStore.getState().items.length
          useMaterialsStore.getState().removeItem(fakeId)
          const finalCount = useMaterialsStore.getState().items.length
          return finalCount === initialCount
        }),
        { numRuns: 100 }
      )
    })
  })

  describe('setSearchQuery', () => {
    it('Property: setSearchQuery stores the exact query', () => {
      fc.assert(
        fc.property(fc.string({ maxLength: 200 }), (query) => {
          useMaterialsStore.getState().setSearchQuery(query)
          return useMaterialsStore.getState().searchQuery === query
        }),
        { numRuns: 200 }
      )
    })

    it('Property: setSearchQuery is idempotent', () => {
      fc.assert(
        fc.property(fc.string({ maxLength: 100 }), (query) => {
          useMaterialsStore.getState().setSearchQuery(query)
          const first = useMaterialsStore.getState().searchQuery
          useMaterialsStore.getState().setSearchQuery(query)
          const second = useMaterialsStore.getState().searchQuery
          return first === second
        }),
        { numRuns: 100 }
      )
    })
  })

  describe('setActiveFilter', () => {
    it('Property: setActiveFilter stores the exact filter', () => {
      fc.assert(
        fc.property(materialFilterArb, (filter) => {
          useMaterialsStore.getState().setActiveFilter(filter)
          return useMaterialsStore.getState().activeFilter === filter
        }),
        { numRuns: 50 }
      )
    })
  })

  describe('getFilteredItems', () => {
    it('Property: Filter "All" returns all items matching search', () => {
      fc.assert(
        fc.property(materialsArrayArb, (items) => {
          useMaterialsStore.getState().setItems(items)
          useMaterialsStore.getState().setActiveFilter('All')
          useMaterialsStore.getState().setSearchQuery('')
          const filtered = useMaterialsStore.getState().getFilteredItems()
          return filtered.length === items.length
        }),
        { numRuns: 100 }
      )
    })

    it('Property: Type filter returns only items of that type', () => {
      fc.assert(
        fc.property(
          materialsArrayArb,
          fc.constantFrom<'Note' | 'Flashcards' | 'Reviewer'>('Note', 'Flashcards', 'Reviewer'),
          (items, filterType) => {
            useMaterialsStore.getState().setItems(items)
            useMaterialsStore.getState().setActiveFilter(filterType)
            useMaterialsStore.getState().setSearchQuery('')
            const filtered = useMaterialsStore.getState().getFilteredItems()
            return filtered.every(item => item.type === filterType)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('Property: Search filter is case-insensitive', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }),
          (searchTerm) => {
            const items: MaterialItem[] = [
              {
                id: '123e4567-e89b-12d3-a456-426614174000',
                title: searchTerm.toUpperCase(),
                type: 'Note',
                itemsCount: 5,
                lastAccessed: new Date().toISOString(),
              },
            ]
            useMaterialsStore.getState().setItems(items)
            useMaterialsStore.getState().setActiveFilter('All')
            useMaterialsStore.getState().setSearchQuery(searchTerm.toLowerCase())
            const filtered = useMaterialsStore.getState().getFilteredItems()
            return filtered.length === 1
          }
        ),
        { numRuns: 100 }
      )
    })

    it('Property: Empty search returns all items (with filter)', () => {
      fc.assert(
        fc.property(materialsArrayArb, materialFilterArb, (items, filter) => {
          useMaterialsStore.getState().setItems(items)
          useMaterialsStore.getState().setActiveFilter(filter)
          useMaterialsStore.getState().setSearchQuery('')
          const filtered = useMaterialsStore.getState().getFilteredItems()
          
          if (filter === 'All') {
            return filtered.length === items.length
          }
          return filtered.every(item => item.type === filter)
        }),
        { numRuns: 100 }
      )
    })

    it('Property: Filtered count is always <= total count', () => {
      fc.assert(
        fc.property(
          materialsArrayArb,
          materialFilterArb,
          fc.string({ maxLength: 50 }),
          (items, filter, query) => {
            useMaterialsStore.getState().setItems(items)
            useMaterialsStore.getState().setActiveFilter(filter)
            useMaterialsStore.getState().setSearchQuery(query)
            const filtered = useMaterialsStore.getState().getFilteredItems()
            return filtered.length <= items.length
          }
        ),
        { numRuns: 200 }
      )
    })

    it('Property: Search matches substring in title', () => {
      const items: MaterialItem[] = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          title: 'Biology Chapter 1',
          type: 'Note',
          itemsCount: 10,
          lastAccessed: new Date().toISOString(),
        },
        {
          id: '223e4567-e89b-12d3-a456-426614174001',
          title: 'Chemistry Notes',
          type: 'Note',
          itemsCount: 5,
          lastAccessed: new Date().toISOString(),
        },
      ]
      
      useMaterialsStore.getState().setItems(items)
      useMaterialsStore.getState().setActiveFilter('All')
      useMaterialsStore.getState().setSearchQuery('bio')
      const filtered = useMaterialsStore.getState().getFilteredItems()
      
      expect(filtered.length).toBe(1)
      expect(filtered[0].title).toBe('Biology Chapter 1')
    })
  })

  describe('Loading and Error State', () => {
    it('Property: setLoading stores the exact boolean', () => {
      fc.assert(
        fc.property(fc.boolean(), (loading) => {
          useMaterialsStore.getState().setLoading(loading)
          return useMaterialsStore.getState().loading === loading
        }),
        { numRuns: 20 }
      )
    })

    it('Property: setError stores the exact error or null', () => {
      fc.assert(
        fc.property(
          fc.option(fc.string().map(msg => new Error(msg)), { nil: null }),
          (error) => {
            useMaterialsStore.getState().setError(error)
            const stored = useMaterialsStore.getState().error
            if (error === null) return stored === null
            return stored?.message === error.message
          }
        ),
        { numRuns: 50 }
      )
    })
  })

  describe('State Independence', () => {
    it('Property: Filter changes do not affect stored items', () => {
      fc.assert(
        fc.property(materialsArrayArb, materialFilterArb, (items, filter) => {
          useMaterialsStore.getState().setItems(items)
          const beforeFilter = [...useMaterialsStore.getState().items]
          useMaterialsStore.getState().setActiveFilter(filter)
          const afterFilter = useMaterialsStore.getState().items
          return beforeFilter.length === afterFilter.length &&
            beforeFilter.every((item, i) => item.id === afterFilter[i].id)
        }),
        { numRuns: 100 }
      )
    })

    it('Property: Search changes do not affect stored items', () => {
      fc.assert(
        fc.property(materialsArrayArb, fc.string({ maxLength: 50 }), (items, query) => {
          useMaterialsStore.getState().setItems(items)
          const beforeSearch = [...useMaterialsStore.getState().items]
          useMaterialsStore.getState().setSearchQuery(query)
          const afterSearch = useMaterialsStore.getState().items
          return beforeSearch.length === afterSearch.length &&
            beforeSearch.every((item, i) => item.id === afterSearch[i].id)
        }),
        { numRuns: 100 }
      )
    })
  })
})
