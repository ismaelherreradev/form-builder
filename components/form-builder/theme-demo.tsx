"use client"

import { useTheme } from '@/components/form-builder/hooks/use-theme'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function ThemeDemo() {
  const { theme, styles, setTheme } = useTheme()

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle style={styles.heading}>Theme Demo</CardTitle>
        <CardDescription style={styles.body}>
          Current theme: {theme.name}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div style={styles.card} className="p-4 rounded">
          <p style={styles.body}>This card uses theme styles</p>
        </div>
        
        <Button style={styles.primaryButton}>
          Primary Button
        </Button>
        
        <div className="grid grid-cols-2 gap-2">
          <div 
            className="w-full h-8 rounded flex items-center justify-center text-xs font-medium"
            style={{ backgroundColor: theme.colors.primary, color: theme.colors.background }}
          >
            Primary
          </div>
          <div 
            className="w-full h-8 rounded flex items-center justify-center text-xs font-medium"
            style={{ backgroundColor: theme.colors.secondary, color: theme.colors.background }}
          >
            Secondary
          </div>
          <div 
            className="w-full h-8 rounded flex items-center justify-center text-xs font-medium"
            style={{ backgroundColor: theme.colors.success, color: theme.colors.background }}
          >
            Success
          </div>
          <div 
            className="w-full h-8 rounded flex items-center justify-center text-xs font-medium"
            style={{ backgroundColor: theme.colors.error, color: theme.colors.background }}
          >
            Error
          </div>
        </div>
        
        <div className="text-sm space-y-1" style={styles.body}>
          <p>Font: {theme.typography.fontFamily}</p>
          <p>Heading Size: {theme.typography.headingSize}px</p>
          <p>Body Size: {theme.typography.bodySize}px</p>
          <p>Border Radius: {theme.borderRadius}px</p>
          <p>Shadows: {theme.shadows ? 'Enabled' : 'Disabled'}</p>
          <p>Animations: {theme.animations.enabled ? 'Enabled' : 'Disabled'}</p>
        </div>
      </CardContent>
    </Card>
  )
}