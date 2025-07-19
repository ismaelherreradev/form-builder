import { describe, it, expect } from 'vitest'
import { DEFAULT_THEMES } from '@/lib/theme-types'

describe('Theme System Verification', () => {
  it('should have all required default themes', () => {
    expect(DEFAULT_THEMES).toHaveProperty('modern')
    expect(DEFAULT_THEMES).toHaveProperty('minimal')
    expect(DEFAULT_THEMES).toHaveProperty('vibrant')
  })

  it('should have valid theme structure', () => {
    Object.values(DEFAULT_THEMES).forEach(theme => {
      expect(theme).toHaveProperty('id')
      expect(theme).toHaveProperty('name')
      expect(theme).toHaveProperty('colors')
      expect(theme).toHaveProperty('typography')
      expect(theme).toHaveProperty('spacing')
      expect(theme).toHaveProperty('borderRadius')
      expect(theme).toHaveProperty('shadows')
      expect(theme).toHaveProperty('animations')
    })
  })

  it('should have valid color values', () => {
    Object.values(DEFAULT_THEMES).forEach(theme => {
      Object.values(theme.colors).forEach(color => {
        expect(color).toMatch(/^#[0-9a-fA-F]{6}$/)
      })
    })
  })

  it('should have positive numeric values', () => {
    Object.values(DEFAULT_THEMES).forEach(theme => {
      expect(theme.typography.headingSize).toBeGreaterThan(0)
      expect(theme.typography.bodySize).toBeGreaterThan(0)
      expect(theme.typography.lineHeight).toBeGreaterThan(0)
      expect(theme.spacing.small).toBeGreaterThan(0)
      expect(theme.spacing.medium).toBeGreaterThan(0)
      expect(theme.spacing.large).toBeGreaterThan(0)
      expect(theme.borderRadius).toBeGreaterThanOrEqual(0)
      expect(theme.animations.duration).toBeGreaterThanOrEqual(0)
    })
  })

  it('should have required color properties', () => {
    const requiredColors = [
      'primary', 'secondary', 'background', 'surface', 
      'text', 'textSecondary', 'border', 'error', 
      'success', 'warning', 'info'
    ]

    Object.values(DEFAULT_THEMES).forEach(theme => {
      requiredColors.forEach(colorKey => {
        expect(theme.colors).toHaveProperty(colorKey)
      })
    })
  })

  it('should have required typography properties', () => {
    Object.values(DEFAULT_THEMES).forEach(theme => {
      expect(theme.typography).toHaveProperty('fontFamily')
      expect(theme.typography).toHaveProperty('headingSize')
      expect(theme.typography).toHaveProperty('bodySize')
      expect(theme.typography).toHaveProperty('lineHeight')
      expect(theme.typography).toHaveProperty('fontWeight')
      
      expect(theme.typography.fontWeight).toHaveProperty('normal')
      expect(theme.typography.fontWeight).toHaveProperty('medium')
      expect(theme.typography.fontWeight).toHaveProperty('semibold')
      expect(theme.typography.fontWeight).toHaveProperty('bold')
    })
  })

  it('should have required spacing properties', () => {
    Object.values(DEFAULT_THEMES).forEach(theme => {
      expect(theme.spacing).toHaveProperty('small')
      expect(theme.spacing).toHaveProperty('medium')
      expect(theme.spacing).toHaveProperty('large')
      expect(theme.spacing).toHaveProperty('xlarge')
    })
  })

  it('should have required animation properties', () => {
    Object.values(DEFAULT_THEMES).forEach(theme => {
      expect(theme.animations).toHaveProperty('enabled')
      expect(theme.animations).toHaveProperty('duration')
      expect(theme.animations).toHaveProperty('easing')
    })
  })
})