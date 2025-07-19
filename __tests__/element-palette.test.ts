import { describe, it, expect, beforeEach, vi } from 'vitest'
import { 
  createElementCategories, 
  searchElements, 
  getAllElements,
  getCategoryColorClasses 
} from '@/components/form-builder/utils/element-categories'
import { FormElements } from '@/components/form-builder/elements'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('Element Categories', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createElementCategories', () => {
    it('should create categories with correct structure', () => {
      const categories = createElementCategories()
      
      expect(categories).toHaveLength(3)
      expect(categories[0]).toMatchObject({
        id: 'layout',
        name: 'Layout',
        color: 'blue',
        description: 'Structure and organize your form'
      })
      expect(categories[0].elements).toHaveLength(5)
      expect(categories[0].icon).toBeDefined()
    })

    it('should categorize elements correctly', () => {
      const categories = createElementCategories()
      const layoutCategory = categories.find(cat => cat.id === 'layout')
      const inputCategory = categories.find(cat => cat.id === 'input')
      const selectionCategory = categories.find(cat => cat.id === 'selection')

      // Layout elements
      expect(layoutCategory?.elements).toContain(FormElements.TitleField)
      expect(layoutCategory?.elements).toContain(FormElements.SubTitleField)
      expect(layoutCategory?.elements).toContain(FormElements.ParagraphField)
      expect(layoutCategory?.elements).toContain(FormElements.SeparatorField)
      expect(layoutCategory?.elements).toContain(FormElements.SpacerField)

      // Input elements
      expect(inputCategory?.elements).toContain(FormElements.TextField)
      expect(inputCategory?.elements).toContain(FormElements.NumberField)
      expect(inputCategory?.elements).toContain(FormElements.TextAreaField)
      expect(inputCategory?.elements).toContain(FormElements.DateField)

      // Selection elements
      expect(selectionCategory?.elements).toContain(FormElements.SelectField)
      expect(selectionCategory?.elements).toContain(FormElements.CheckboxField)
    })
  })

  describe('searchElements', () => {
    const categories = createElementCategories()

    it('should return empty array for empty query', () => {
      const results = searchElements(categories, '')
      expect(results).toHaveLength(0)
    })

    it('should return empty array for whitespace query', () => {
      const results = searchElements(categories, '   ')
      expect(results).toHaveLength(0)
    })

    it('should find elements by exact label match', () => {
      const results = searchElements(categories, 'Text')
      expect(results.length).toBeGreaterThan(0)
      
      const textFieldResult = results.find(r => r.element.type === 'TextField')
      expect(textFieldResult).toBeDefined()
      expect(textFieldResult?.matchScore).toBe(100) // Exact match gets highest score
    })

    it('should find elements by partial label match', () => {
      const results = searchElements(categories, 'field')
      expect(results.length).toBeGreaterThan(0)
      
      // Should find TextField, NumberField, etc.
      const fieldElements = results.filter(r => 
        r.element.designerButtonElement.label.toLowerCase().includes('field')
      )
      expect(fieldElements.length).toBeGreaterThan(0)
    })

    it('should find elements by category name', () => {
      const results = searchElements(categories, 'layout')
      expect(results.length).toBeGreaterThan(0)
      
      // All results should be from layout category
      results.forEach(result => {
        expect(result.category.id).toBe('layout')
      })
    })

    it('should find elements by element type', () => {
      const results = searchElements(categories, 'checkbox')
      expect(results.length).toBeGreaterThan(0)
      
      const checkboxResult = results.find(r => r.element.type === 'CheckboxField')
      expect(checkboxResult).toBeDefined()
    })

    it('should return results sorted by match score', () => {
      const results = searchElements(categories, 'text')
      
      // Results should be sorted by match score (highest first)
      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].matchScore).toBeGreaterThanOrEqual(results[i + 1].matchScore)
      }
    })

    it('should be case insensitive', () => {
      const lowerResults = searchElements(categories, 'text')
      const upperResults = searchElements(categories, 'TEXT')
      const mixedResults = searchElements(categories, 'TeXt')
      
      expect(lowerResults).toEqual(upperResults)
      expect(lowerResults).toEqual(mixedResults)
    })

    it('should assign correct match scores', () => {
      // Test exact match
      const exactResults = searchElements(categories, 'Text')
      const exactMatch = exactResults.find(r => 
        r.element.designerButtonElement.label.toLowerCase() === 'text'
      )
      if (exactMatch) {
        expect(exactMatch.matchScore).toBe(100)
      }

      // Test starts with match
      const startsWithResults = searchElements(categories, 'tex')
      const startsWithMatch = startsWithResults.find(r => 
        r.element.designerButtonElement.label.toLowerCase().startsWith('tex')
      )
      if (startsWithMatch) {
        expect(startsWithMatch.matchScore).toBe(80)
      }
    })
  })

  describe('getAllElements', () => {
    it('should return all elements from all categories', () => {
      const categories = createElementCategories()
      const allElements = getAllElements(categories)
      
      const totalElementsInCategories = categories.reduce(
        (sum, category) => sum + category.elements.length, 
        0
      )
      
      expect(allElements).toHaveLength(totalElementsInCategories)
    })

    it('should not contain duplicate elements', () => {
      const categories = createElementCategories()
      const allElements = getAllElements(categories)
      
      const elementTypes = allElements.map(el => el.type)
      const uniqueTypes = [...new Set(elementTypes)]
      
      expect(elementTypes).toHaveLength(uniqueTypes.length)
    })
  })

  describe('getCategoryColorClasses', () => {
    it('should return correct color classes for known colors', () => {
      const blueClasses = getCategoryColorClasses('blue')
      expect(blueClasses.indicator).toBe('bg-blue-500')
      expect(blueClasses.hover).toBe('hover:bg-blue-50 dark:hover:bg-blue-950/20')
      expect(blueClasses.border).toBe('border-blue-200 dark:border-blue-800')
      expect(blueClasses.text).toBe('text-blue-700 dark:text-blue-300')

      const greenClasses = getCategoryColorClasses('green')
      expect(greenClasses.indicator).toBe('bg-green-500')
      
      const purpleClasses = getCategoryColorClasses('purple')
      expect(purpleClasses.indicator).toBe('bg-purple-500')
    })

    it('should return default blue classes for unknown colors', () => {
      const unknownClasses = getCategoryColorClasses('unknown')
      const blueClasses = getCategoryColorClasses('blue')
      
      expect(unknownClasses).toEqual(blueClasses)
    })
  })
})

describe('Element Search Performance', () => {
  it('should handle large search queries efficiently', () => {
    const categories = createElementCategories()
    const longQuery = 'a'.repeat(1000)
    
    const startTime = performance.now()
    const results = searchElements(categories, longQuery)
    const endTime = performance.now()
    
    expect(endTime - startTime).toBeLessThan(100) // Should complete in under 100ms
    expect(results).toHaveLength(0) // No matches expected for this query
  })

  it('should handle multiple rapid searches', () => {
    const categories = createElementCategories()
    const queries = ['text', 'field', 'input', 'layout', 'select']
    
    const startTime = performance.now()
    queries.forEach(query => {
      searchElements(categories, query)
    })
    const endTime = performance.now()
    
    expect(endTime - startTime).toBeLessThan(50) // Should complete all searches quickly
  })
})