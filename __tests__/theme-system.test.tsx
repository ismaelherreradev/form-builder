import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { FormThemeProvider, useFormTheme } from '@/components/providers/form-theme-provider'
import { useTheme } from '@/components/form-builder/hooks/use-theme'
import { DEFAULT_THEMES, type FormTheme, type ThemeCustomization } from '@/lib/theme-types'

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

describe('Theme System', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
    localStorageMock.removeItem.mockClear()
    localStorageMock.clear.mockClear()
  })

  afterEach(() => {
    cleanup()
  })

  describe('DEFAULT_THEMES', () => {
    it('should have all required themes', () => {
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
  })

  describe('FormThemeProvider', () => {
    it('should provide default theme', () => {
      function TestComponent() {
        const { currentTheme, customizations } = useFormTheme()
        return (
          <div>
            <div data-testid="theme-name">{currentTheme.name}</div>
            <div data-testid="primary-color">{currentTheme.colors.primary}</div>
            <div data-testid="has-customizations">{Object.keys(customizations).length > 0 ? 'yes' : 'no'}</div>
          </div>
        )
      }

      render(
        <FormThemeProvider>
          <TestComponent />
        </FormThemeProvider>
      )

      expect(screen.getByTestId('theme-name')).toHaveTextContent('Modern')
      expect(screen.getByTestId('primary-color')).toHaveTextContent('#3b82f6')
      expect(screen.getByTestId('has-customizations')).toHaveTextContent('no')
    })

    it('should allow theme changes', async () => {
      function TestComponent() {
        const { currentTheme, setTheme } = useFormTheme()
        return (
          <div>
            <div data-testid="theme-name">{currentTheme.name}</div>
            <button 
              data-testid="change-theme" 
              onClick={() => setTheme(DEFAULT_THEMES.minimal)}
            >
              Change Theme
            </button>
          </div>
        )
      }

      render(
        <FormThemeProvider>
          <TestComponent />
        </FormThemeProvider>
      )

      fireEvent.click(screen.getByTestId('change-theme'))

      await waitFor(() => {
        expect(screen.getByTestId('theme-name')).toHaveTextContent('Minimal')
      })
    })

    it('should handle customizations', async () => {
      function TestComponent() {
        const { customizations, updateCustomizations } = useFormTheme()
        return (
          <div>
            <div data-testid="has-customizations">{Object.keys(customizations).length > 0 ? 'yes' : 'no'}</div>
            <button 
              data-testid="update-color" 
              onClick={() => updateCustomizations({ colors: { primary: '#ff0000' } })}
            >
              Update Color
            </button>
          </div>
        )
      }

      render(
        <FormThemeProvider>
          <TestComponent />
        </FormThemeProvider>
      )

      fireEvent.click(screen.getByTestId('update-color'))

      await waitFor(() => {
        expect(screen.getByTestId('has-customizations')).toHaveTextContent('yes')
      })
    })

    it('should reset customizations', async () => {
      function TestComponent() {
        const { customizations, updateCustomizations, resetCustomizations } = useFormTheme()
        return (
          <div>
            <div data-testid="has-customizations">{Object.keys(customizations).length > 0 ? 'yes' : 'no'}</div>
            <button 
              data-testid="update-color" 
              onClick={() => updateCustomizations({ colors: { primary: '#ff0000' } })}
            >
              Update Color
            </button>
            <button 
              data-testid="reset" 
              onClick={resetCustomizations}
            >
              Reset
            </button>
          </div>
        )
      }

      render(
        <FormThemeProvider>
          <TestComponent />
        </FormThemeProvider>
      )

      // Add customization
      fireEvent.click(screen.getByTestId('update-color'))
      await waitFor(() => {
        expect(screen.getByTestId('has-customizations')).toHaveTextContent('yes')
      })

      // Reset customizations
      fireEvent.click(screen.getByTestId('reset'))
      await waitFor(() => {
        expect(screen.getByTestId('has-customizations')).toHaveTextContent('no')
      })
    })

    it('should persist theme to localStorage', async () => {
      function TestComponent() {
        const { setTheme } = useFormTheme()
        return (
          <button 
            data-testid="change-theme" 
            onClick={() => setTheme(DEFAULT_THEMES.minimal)}
          >
            Change Theme
          </button>
        )
      }

      render(
        <FormThemeProvider storageKey="test-theme">
          <TestComponent />
        </FormThemeProvider>
      )

      fireEvent.click(screen.getByTestId('change-theme'))

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'test-theme',
          expect.stringContaining('minimal')
        )
      })
    })

    it('should load theme from localStorage', () => {
      const storedTheme = {
        theme: DEFAULT_THEMES.vibrant,
        mode: 'light',
        customizations: { colors: { primary: '#ff0000' } }
      }
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(storedTheme))

      function TestComponent() {
        const { currentTheme, customizations } = useFormTheme()
        return (
          <div>
            <div data-testid="theme-name">{currentTheme.name}</div>
            <div data-testid="has-customizations">{Object.keys(customizations).length > 0 ? 'yes' : 'no'}</div>
          </div>
        )
      }

      render(
        <FormThemeProvider storageKey="test-theme">
          <TestComponent />
        </FormThemeProvider>
      )

      expect(screen.getByTestId('theme-name')).toHaveTextContent('Vibrant')
      expect(screen.getByTestId('has-customizations')).toHaveTextContent('yes')
    })

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage error')
      })

      function TestComponent() {
        const { currentTheme } = useFormTheme()
        return <div data-testid="theme-name">{currentTheme.name}</div>
      }

      expect(() => {
        render(
          <FormThemeProvider>
            <TestComponent />
          </FormThemeProvider>
        )
      }).not.toThrow()

      expect(screen.getByTestId('theme-name')).toHaveTextContent('Modern')
    })
  })

  describe('useTheme hook', () => {
    it('should provide theme styles', () => {
      function ThemeHookTestComponent() {
        const { theme, styles, cssVariables } = useTheme()
        
        return (
          <div>
            <div data-testid="theme-primary">{theme.colors.primary}</div>
            <div data-testid="primary-button-bg" style={styles.primaryButton}>
              Primary Button
            </div>
            <div data-testid="css-var-count">{Object.keys(cssVariables).length}</div>
          </div>
        )
      }

      render(
        <FormThemeProvider>
          <ThemeHookTestComponent />
        </FormThemeProvider>
      )

      expect(screen.getByTestId('theme-primary')).toHaveTextContent('#3b82f6')
      expect(screen.getByTestId('primary-button-bg')).toHaveStyle({
        backgroundColor: 'rgb(59, 130, 246)'
      })
    })

    it('should provide CSS variables', () => {
      function ThemeHookTestComponent() {
        const { cssVariables } = useTheme()
        return <div data-testid="css-var-count">{Object.keys(cssVariables).length}</div>
      }

      render(
        <FormThemeProvider>
          <ThemeHookTestComponent />
        </FormThemeProvider>
      )

      const cssVarCount = screen.getByTestId('css-var-count')
      expect(Number(cssVarCount.textContent)).toBeGreaterThan(20)
    })

    it('should apply customizations to styles', async () => {
      function CustomizedThemeTest() {
        const { updateCustomizations } = useFormTheme()
        const { theme } = useTheme()
        
        return (
          <div>
            <div data-testid="current-primary">{theme.colors.primary}</div>
            <button 
              data-testid="customize"
              onClick={() => updateCustomizations({ colors: { primary: '#00ff00' } })}
            >
              Customize
            </button>
          </div>
        )
      }

      render(
        <FormThemeProvider>
          <CustomizedThemeTest />
        </FormThemeProvider>
      )

      expect(screen.getByTestId('current-primary')).toHaveTextContent('#3b82f6')

      fireEvent.click(screen.getByTestId('customize'))

      await waitFor(() => {
        expect(screen.getByTestId('current-primary')).toHaveTextContent('#00ff00')
      })
    })
  })

  describe('Theme application', () => {
    it('should apply CSS custom properties to document root', async () => {
      const mockSetProperty = vi.fn()
      const mockDocumentElement = {
        style: {
          setProperty: mockSetProperty
        }
      }
      
      Object.defineProperty(document, 'documentElement', {
        value: mockDocumentElement,
        writable: true
      })

      render(
        <FormThemeProvider>
          <TestComponent />
        </FormThemeProvider>
      )

      await waitFor(() => {
        expect(mockSetProperty).toHaveBeenCalledWith('--form-theme-primary', '#3b82f6')
        expect(mockSetProperty).toHaveBeenCalledWith('--form-theme-font-family', 'Inter, system-ui, sans-serif')
        expect(mockSetProperty).toHaveBeenCalledWith('--form-theme-border-radius', '8px')
      })
    })
  })

  describe('Error handling', () => {
    it('should throw error when useFormTheme is used outside provider', () => {
      function TestComponent() {
        const { currentTheme } = useFormTheme()
        return <div>{currentTheme.name}</div>
      }

      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      expect(() => {
        render(<TestComponent />)
      }).toThrow('useFormTheme must be used within a FormThemeProvider')
      
      consoleSpy.mockRestore()
    })
  })
})