import { describe, it, expect } from 'vitest'
import type { FormElementInstance } from '../components/form-builder/elements'
import {
  validateFormElement,
  getDefaultStyling,
} from '../components/form-builder/schemas/element-validation'
import {
  createEnhancedElement,
} from '../components/form-builder/utils/element-helpers'

describe('Enhanced Form Elements', () => {
  describe('Element Creation', () => {
    it('should create enhanced element with all required properties', () => {
      const element = createEnhancedElement('test-1', 'TextField', {
        label: 'Test Field',
        required: true,
      })

      expect(element.id).toBe('test-1')
      expect(element.type).toBe('TextField')
      expect(element.extraAttributes).toEqual({
        label: 'Test Field',
        required: true,
      })
      expect(element.position).toBeDefined()
      expect(element.styling).toBeDefined()
      expect(element.animation).toBeDefined()
      expect(element.responsive).toBeDefined()
      expect(element.conditionalLogic).toEqual([])
      expect(element.metadata).toBeDefined()
    })

    it('should validate enhanced element structure', () => {
      const element = createEnhancedElement('test-1', 'TextField')
      const validation = validateFormElement(element)

      expect(validation.isValid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })
  })

  describe('Default Values', () => {
    it('should provide correct default styling', () => {
      const defaultStyling = getDefaultStyling()

      expect(defaultStyling.padding).toEqual({
        top: 8,
        right: 12,
        bottom: 8,
        left: 12,
      })
      expect(defaultStyling.margin).toEqual({
        top: 4,
        right: 0,
        bottom: 4,
        left: 0,
      })
      expect(defaultStyling.borderRadius).toBe(4)
      expect(defaultStyling.fontSize).toBe(14)
      expect(defaultStyling.fontWeight).toBe('normal')
      expect(defaultStyling.opacity).toBe(1)
    })
  })
})