"use client"

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { FormTheme, ThemeCustomization, ThemeMode, ThemeContextType, DEFAULT_THEMES } from '@/lib/theme-types'

const FormThemeContext = createContext<ThemeContextType | null>(null)

interface FormThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: FormTheme
  storageKey?: string
}

export function FormThemeProvider({ 
  children, 
  defaultTheme = DEFAULT_THEMES.modern,
  storageKey = 'form-builder-theme'
}: FormThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<FormTheme>(defaultTheme)
  const [themeMode, setThemeMode] = useState<ThemeMode>('system')
  const [customizations, setCustomizations] = useState<ThemeCustomization>({})

  // Load theme from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const { theme, mode, customizations: storedCustomizations } = JSON.parse(stored)
        if (theme) setCurrentTheme(theme)
        if (mode) setThemeMode(mode)
        if (storedCustomizations) setCustomizations(storedCustomizations)
      }
    } catch (error) {
      console.warn('Failed to load theme from localStorage:', error)
    }
  }, [storageKey])

  // Save theme to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        theme: currentTheme,
        mode: themeMode,
        customizations
      }))
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error)
    }
  }, [currentTheme, themeMode, customizations, storageKey])

  const setTheme = useCallback((theme: FormTheme) => {
    setCurrentTheme(theme)
  }, [])

  const updateCustomizations = useCallback((newCustomizations: Partial<ThemeCustomization>) => {
    setCustomizations(prev => ({
      ...prev,
      ...newCustomizations,
      colors: { ...prev.colors, ...newCustomizations.colors },
      typography: { ...prev.typography, ...newCustomizations.typography },
      spacing: { ...prev.spacing, ...newCustomizations.spacing },
      animations: { ...prev.animations, ...newCustomizations.animations }
    }))
  }, [])

  const resetCustomizations = useCallback(() => {
    setCustomizations({})
  }, [])

  const applyTheme = useCallback((theme: FormTheme, customizations?: ThemeCustomization): FormTheme => {
    if (!customizations || Object.keys(customizations).length === 0) {
      return theme
    }

    return {
      ...theme,
      colors: { ...theme.colors, ...customizations.colors },
      typography: { ...theme.typography, ...customizations.typography },
      spacing: { ...theme.spacing, ...customizations.spacing },
      borderRadius: customizations.borderRadius ?? theme.borderRadius,
      shadows: customizations.shadows ?? theme.shadows,
      animations: { ...theme.animations, ...customizations.animations }
    }
  }, [])

  // Apply CSS custom properties to document root
  useEffect(() => {
    const appliedTheme = applyTheme(currentTheme, customizations)
    const root = document.documentElement

    // Apply color variables
    Object.entries(appliedTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--form-theme-${key}`, value)
    })

    // Apply typography variables
    root.style.setProperty('--form-theme-font-family', appliedTheme.typography.fontFamily)
    root.style.setProperty('--form-theme-heading-size', `${appliedTheme.typography.headingSize}px`)
    root.style.setProperty('--form-theme-body-size', `${appliedTheme.typography.bodySize}px`)
    root.style.setProperty('--form-theme-line-height', appliedTheme.typography.lineHeight.toString())
    
    Object.entries(appliedTheme.typography.fontWeight).forEach(([key, value]) => {
      root.style.setProperty(`--form-theme-font-weight-${key}`, value)
    })

    // Apply spacing variables
    Object.entries(appliedTheme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--form-theme-spacing-${key}`, `${value}px`)
    })

    // Apply other variables
    root.style.setProperty('--form-theme-border-radius', `${appliedTheme.borderRadius}px`)
    root.style.setProperty('--form-theme-shadows', appliedTheme.shadows ? '1' : '0')
    root.style.setProperty('--form-theme-animation-duration', `${appliedTheme.animations.duration}ms`)
    root.style.setProperty('--form-theme-animation-easing', appliedTheme.animations.easing)
  }, [currentTheme, customizations, applyTheme])

  const contextValue = useMemo(() => ({
    currentTheme,
    themeMode,
    customizations,
    setTheme,
    setThemeMode,
    updateCustomizations,
    resetCustomizations,
    applyTheme
  }), [
    currentTheme,
    themeMode,
    customizations,
    setTheme,
    setThemeMode,
    updateCustomizations,
    resetCustomizations,
    applyTheme
  ])

  return (
    <FormThemeContext.Provider value={contextValue}>
      {children}
    </FormThemeContext.Provider>
  )
}

export function useFormTheme() {
  const context = useContext(FormThemeContext)
  if (!context) {
    throw new Error('useFormTheme must be used within a FormThemeProvider')
  }
  return context
}