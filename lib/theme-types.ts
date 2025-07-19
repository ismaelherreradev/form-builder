export interface FormTheme {
  id: string
  name: string
  colors: {
    primary: string
    secondary: string
    background: string
    surface: string
    text: string
    textSecondary: string
    border: string
    error: string
    success: string
    warning: string
    info: string
  }
  typography: {
    fontFamily: string
    headingSize: number
    bodySize: number
    lineHeight: number
    fontWeight: {
      normal: string
      medium: string
      semibold: string
      bold: string
    }
  }
  spacing: {
    small: number
    medium: number
    large: number
    xlarge: number
  }
  borderRadius: number
  shadows: boolean
  animations: {
    enabled: boolean
    duration: number
    easing: string
  }
}

export interface ThemeCustomization {
  colors?: Partial<FormTheme['colors']>
  typography?: Partial<FormTheme['typography']>
  spacing?: Partial<FormTheme['spacing']>
  borderRadius?: number
  shadows?: boolean
  animations?: Partial<FormTheme['animations']>
}

export type ThemeMode = 'light' | 'dark' | 'system'

export interface ThemeContextType {
  currentTheme: FormTheme
  themeMode: ThemeMode
  customizations: ThemeCustomization
  setTheme: (theme: FormTheme) => void
  setThemeMode: (mode: ThemeMode) => void
  updateCustomizations: (customizations: Partial<ThemeCustomization>) => void
  resetCustomizations: () => void
  applyTheme: (theme: FormTheme, customizations?: ThemeCustomization) => FormTheme
}

export const DEFAULT_THEMES: Record<string, FormTheme> = {
  modern: {
    id: 'modern',
    name: 'Modern',
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#0f172a',
      textSecondary: '#64748b',
      border: '#e2e8f0',
      error: '#ef4444',
      success: '#10b981',
      warning: '#f59e0b',
      info: '#3b82f6',
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      headingSize: 24,
      bodySize: 16,
      lineHeight: 1.5,
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
    },
    spacing: {
      small: 8,
      medium: 16,
      large: 24,
      xlarge: 32,
    },
    borderRadius: 8,
    shadows: true,
    animations: {
      enabled: true,
      duration: 200,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    colors: {
      primary: '#000000',
      secondary: '#6b7280',
      background: '#ffffff',
      surface: '#fafafa',
      text: '#111827',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      error: '#dc2626',
      success: '#059669',
      warning: '#d97706',
      info: '#2563eb',
    },
    typography: {
      fontFamily: 'system-ui, sans-serif',
      headingSize: 20,
      bodySize: 14,
      lineHeight: 1.4,
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
    },
    spacing: {
      small: 6,
      medium: 12,
      large: 18,
      xlarge: 24,
    },
    borderRadius: 4,
    shadows: false,
    animations: {
      enabled: false,
      duration: 0,
      easing: 'linear',
    },
  },
  vibrant: {
    id: 'vibrant',
    name: 'Vibrant',
    colors: {
      primary: '#8b5cf6',
      secondary: '#06b6d4',
      background: '#ffffff',
      surface: '#fef7ff',
      text: '#1f2937',
      textSecondary: '#4b5563',
      border: '#d1d5db',
      error: '#f43f5e',
      success: '#22c55e',
      warning: '#eab308',
      info: '#06b6d4',
    },
    typography: {
      fontFamily: 'Poppins, system-ui, sans-serif',
      headingSize: 28,
      bodySize: 16,
      lineHeight: 1.6,
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
    },
    spacing: {
      small: 10,
      medium: 20,
      large: 30,
      xlarge: 40,
    },
    borderRadius: 12,
    shadows: true,
    animations: {
      enabled: true,
      duration: 300,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
  },
}