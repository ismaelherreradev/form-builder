import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FormThemeProvider } from '@/components/providers/form-theme-provider'
import { ThemeCustomizer } from '@/components/form-builder/theme-customizer'
import { ThemeDemo } from '@/components/form-builder/theme-demo'

describe('Theme System Integration', () => {
  it('should render ThemeCustomizer without errors', () => {
    expect(() => {
      render(
        <FormThemeProvider>
          <ThemeCustomizer />
        </FormThemeProvider>
      )
    }).not.toThrow()
  })

  it('should render ThemeDemo without errors', () => {
    expect(() => {
      render(
        <FormThemeProvider>
          <ThemeDemo />
        </FormThemeProvider>
      )
    }).not.toThrow()
  })

  it('should display theme information in ThemeDemo', () => {
    render(
      <FormThemeProvider>
        <ThemeDemo />
      </FormThemeProvider>
    )

    expect(screen.getByText('Theme Demo')).toBeInTheDocument()
    expect(screen.getByText(/Current theme:/)).toBeInTheDocument()
    expect(screen.getByText('Primary Button')).toBeInTheDocument()
  })

  it('should show theme customizer button', () => {
    render(
      <FormThemeProvider>
        <ThemeCustomizer />
      </FormThemeProvider>
    )

    expect(screen.getByText('Customize Theme')).toBeInTheDocument()
  })
})