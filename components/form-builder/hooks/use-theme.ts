import { useFormTheme } from '@/components/providers/form-theme-provider'
import { useMemo } from 'react'

export function useTheme() {
  const { currentTheme, customizations, applyTheme } = useFormTheme()
  
  const theme = useMemo(() => {
    return applyTheme(currentTheme, customizations)
  }, [currentTheme, customizations, applyTheme])

  const getThemeStyles = useMemo(() => ({
    primary: { color: theme.colors.primary },
    secondary: { color: theme.colors.secondary },
    background: { backgroundColor: theme.colors.background },
    surface: { backgroundColor: theme.colors.surface },
    text: { color: theme.colors.text },
    textSecondary: { color: theme.colors.textSecondary },
    border: { borderColor: theme.colors.border },
    error: { color: theme.colors.error },
    success: { color: theme.colors.success },
    warning: { color: theme.colors.warning },
    info: { color: theme.colors.info },
    
    // Combined styles
    primaryButton: {
      backgroundColor: theme.colors.primary,
      color: theme.colors.background,
      borderRadius: `${theme.borderRadius}px`,
      padding: `${theme.spacing.small}px ${theme.spacing.medium}px`,
      fontFamily: theme.typography.fontFamily,
      fontSize: `${theme.typography.bodySize}px`,
      fontWeight: theme.typography.fontWeight.medium,
      transition: theme.animations.enabled ? `all ${theme.animations.duration}ms ${theme.animations.easing}` : 'none',
      boxShadow: theme.shadows ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
    },
    
    card: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderRadius: `${theme.borderRadius}px`,
      padding: `${theme.spacing.medium}px`,
      boxShadow: theme.shadows ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
    },
    
    input: {
      backgroundColor: theme.colors.background,
      borderColor: theme.colors.border,
      color: theme.colors.text,
      borderRadius: `${theme.borderRadius}px`,
      padding: `${theme.spacing.small}px ${theme.spacing.medium}px`,
      fontFamily: theme.typography.fontFamily,
      fontSize: `${theme.typography.bodySize}px`,
      lineHeight: theme.typography.lineHeight
    },
    
    heading: {
      color: theme.colors.text,
      fontFamily: theme.typography.fontFamily,
      fontSize: `${theme.typography.headingSize}px`,
      fontWeight: theme.typography.fontWeight.bold,
      lineHeight: theme.typography.lineHeight
    },
    
    body: {
      color: theme.colors.text,
      fontFamily: theme.typography.fontFamily,
      fontSize: `${theme.typography.bodySize}px`,
      fontWeight: theme.typography.fontWeight.normal,
      lineHeight: theme.typography.lineHeight
    }
  }), [theme])

  const getCSSVariables = useMemo(() => {
    const variables: Record<string, string> = {}
    
    // Color variables
    Object.entries(theme.colors).forEach(([key, value]) => {
      variables[`--form-theme-${key}`] = value
    })
    
    // Typography variables
    variables['--form-theme-font-family'] = theme.typography.fontFamily
    variables['--form-theme-heading-size'] = `${theme.typography.headingSize}px`
    variables['--form-theme-body-size'] = `${theme.typography.bodySize}px`
    variables['--form-theme-line-height'] = theme.typography.lineHeight.toString()
    
    Object.entries(theme.typography.fontWeight).forEach(([key, value]) => {
      variables[`--form-theme-font-weight-${key}`] = value
    })
    
    // Spacing variables
    Object.entries(theme.spacing).forEach(([key, value]) => {
      variables[`--form-theme-spacing-${key}`] = `${value}px`
    })
    
    // Other variables
    variables['--form-theme-border-radius'] = `${theme.borderRadius}px`
    variables['--form-theme-shadows'] = theme.shadows ? '1' : '0'
    variables['--form-theme-animation-duration'] = `${theme.animations.duration}ms`
    variables['--form-theme-animation-easing'] = theme.animations.easing
    
    return variables
  }, [theme])

  return {
    theme,
    styles: getThemeStyles,
    cssVariables: getCSSVariables,
    ...useFormTheme()
  }
}