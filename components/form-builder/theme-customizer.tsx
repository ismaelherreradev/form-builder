"use client"

import { useState } from 'react'
import { Palette, Type, Layout, Zap, RotateCcw, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { useFormTheme } from '@/components/providers/form-theme-provider'
import { DEFAULT_THEMES } from '@/lib/theme-types'

interface ColorPickerProps {
  label: string
  value: string
  onChange: (value: string) => void
}

function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  return (
    <div className="flex items-center justify-between">
      <Label htmlFor={`color-${label}`} className="text-sm font-medium">
        {label}
      </Label>
      <div className="flex items-center gap-2">
        <div 
          className="w-8 h-8 rounded border-2 border-border cursor-pointer"
          style={{ backgroundColor: value }}
          onClick={() => document.getElementById(`color-${label}`)?.click()}
        />
        <Input
          id={`color-${label}`}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-0 h-0 opacity-0 absolute"
        />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-20 h-8 text-xs"
          placeholder="#000000"
        />
      </div>
    </div>
  )
}

export function ThemeCustomizer() {
  const { 
    currentTheme, 
    customizations, 
    updateCustomizations, 
    resetCustomizations,
    setTheme,
    applyTheme 
  } = useFormTheme()
  
  const [isOpen, setIsOpen] = useState(false)
  const appliedTheme = applyTheme(currentTheme, customizations)

  const handleColorChange = (colorKey: string, value: string) => {
    updateCustomizations({
      colors: {
        ...customizations.colors,
        [colorKey]: value
      }
    })
  }

  const handleTypographyChange = (key: string, value: string | number) => {
    updateCustomizations({
      typography: {
        ...customizations.typography,
        [key]: value
      }
    })
  }

  const handleSpacingChange = (key: string, value: number) => {
    updateCustomizations({
      spacing: {
        ...customizations.spacing,
        [key]: value
      }
    })
  }

  const handleFontWeightChange = (key: string, value: string) => {
    updateCustomizations({
      typography: {
        ...customizations.typography,
        fontWeight: {
          ...appliedTheme.typography.fontWeight,
          ...customizations.typography?.fontWeight,
          [key]: value
        }
      }
    })
  }

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-50"
      >
        <Palette className="w-4 h-4 mr-2" />
        Customize Theme
      </Button>
    )
  }

  return (
    <Card className="fixed top-4 right-4 w-80 max-h-[80vh] overflow-y-auto z-50 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Theme Customizer</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
          >
            ×
          </Button>
        </div>
        <CardDescription>
          Customize the appearance of your forms
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Theme Presets */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Theme Presets</Label>
          <div className="grid grid-cols-3 gap-2">
            {Object.values(DEFAULT_THEMES).map((theme) => (
              <Button
                key={theme.id}
                variant={currentTheme.id === theme.id ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme(theme)}
                className="text-xs"
              >
                {currentTheme.id === theme.id && <Check className="w-3 h-3 mr-1" />}
                {theme.name}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        <Tabs defaultValue="colors" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="colors" className="text-xs">
              <Palette className="w-3 h-3" />
            </TabsTrigger>
            <TabsTrigger value="typography" className="text-xs">
              <Type className="w-3 h-3" />
            </TabsTrigger>
            <TabsTrigger value="spacing" className="text-xs">
              <Layout className="w-3 h-3" />
            </TabsTrigger>
            <TabsTrigger value="effects" className="text-xs">
              <Zap className="w-3 h-3" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="colors" className="space-y-3 mt-4">
            <ColorPicker
              label="Primary"
              value={appliedTheme.colors.primary}
              onChange={(value) => handleColorChange('primary', value)}
            />
            <ColorPicker
              label="Secondary"
              value={appliedTheme.colors.secondary}
              onChange={(value) => handleColorChange('secondary', value)}
            />
            <ColorPicker
              label="Background"
              value={appliedTheme.colors.background}
              onChange={(value) => handleColorChange('background', value)}
            />
            <ColorPicker
              label="Surface"
              value={appliedTheme.colors.surface}
              onChange={(value) => handleColorChange('surface', value)}
            />
            <ColorPicker
              label="Text"
              value={appliedTheme.colors.text}
              onChange={(value) => handleColorChange('text', value)}
            />
            <ColorPicker
              label="Border"
              value={appliedTheme.colors.border}
              onChange={(value) => handleColorChange('border', value)}
            />
            <ColorPicker
              label="Error"
              value={appliedTheme.colors.error}
              onChange={(value) => handleColorChange('error', value)}
            />
            <ColorPicker
              label="Success"
              value={appliedTheme.colors.success}
              onChange={(value) => handleColorChange('success', value)}
            />
          </TabsContent>

          <TabsContent value="typography" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Font Family</Label>
              <Select
                value={appliedTheme.typography.fontFamily}
                onValueChange={(value) => handleTypographyChange('fontFamily', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inter, system-ui, sans-serif">Inter</SelectItem>
                  <SelectItem value="system-ui, sans-serif">System UI</SelectItem>
                  <SelectItem value="Poppins, system-ui, sans-serif">Poppins</SelectItem>
                  <SelectItem value="Roboto, system-ui, sans-serif">Roboto</SelectItem>
                  <SelectItem value="Georgia, serif">Georgia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Heading Size: {appliedTheme.typography.headingSize}px
              </Label>
              <Slider
                value={[appliedTheme.typography.headingSize]}
                onValueChange={([value]) => handleTypographyChange('headingSize', value)}
                min={16}
                max={48}
                step={2}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Body Size: {appliedTheme.typography.bodySize}px
              </Label>
              <Slider
                value={[appliedTheme.typography.bodySize]}
                onValueChange={([value]) => handleTypographyChange('bodySize', value)}
                min={12}
                max={24}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Line Height: {appliedTheme.typography.lineHeight}
              </Label>
              <Slider
                value={[appliedTheme.typography.lineHeight]}
                onValueChange={([value]) => handleTypographyChange('lineHeight', value)}
                min={1.2}
                max={2.0}
                step={0.1}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Normal</Label>
                <Select
                  value={appliedTheme.typography.fontWeight.normal}
                  onValueChange={(value) => handleFontWeightChange('normal', value)}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="300">300</SelectItem>
                    <SelectItem value="400">400</SelectItem>
                    <SelectItem value="500">500</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Bold</Label>
                <Select
                  value={appliedTheme.typography.fontWeight.bold}
                  onValueChange={(value) => handleFontWeightChange('bold', value)}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="600">600</SelectItem>
                    <SelectItem value="700">700</SelectItem>
                    <SelectItem value="800">800</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="spacing" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Small: {appliedTheme.spacing.small}px
              </Label>
              <Slider
                value={[appliedTheme.spacing.small]}
                onValueChange={([value]) => handleSpacingChange('small', value)}
                min={4}
                max={16}
                step={2}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Medium: {appliedTheme.spacing.medium}px
              </Label>
              <Slider
                value={[appliedTheme.spacing.medium]}
                onValueChange={([value]) => handleSpacingChange('medium', value)}
                min={8}
                max={32}
                step={4}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Large: {appliedTheme.spacing.large}px
              </Label>
              <Slider
                value={[appliedTheme.spacing.large]}
                onValueChange={([value]) => handleSpacingChange('large', value)}
                min={16}
                max={48}
                step={4}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Border Radius: {appliedTheme.borderRadius}px
              </Label>
              <Slider
                value={[appliedTheme.borderRadius]}
                onValueChange={([value]) => updateCustomizations({ borderRadius: value })}
                min={0}
                max={24}
                step={2}
                className="w-full"
              />
            </div>
          </TabsContent>

          <TabsContent value="effects" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Enable Shadows</Label>
              <Switch
                checked={appliedTheme.shadows}
                onCheckedChange={(checked) => updateCustomizations({ shadows: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Enable Animations</Label>
              <Switch
                checked={appliedTheme.animations.enabled}
                onCheckedChange={(checked) => 
                  updateCustomizations({ 
                    animations: { 
                      ...customizations.animations, 
                      enabled: checked 
                    } 
                  })
                }
              />
            </div>

            {appliedTheme.animations.enabled && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Animation Duration: {appliedTheme.animations.duration}ms
                </Label>
                <Slider
                  value={[appliedTheme.animations.duration]}
                  onValueChange={([value]) => 
                    updateCustomizations({ 
                      animations: { 
                        ...customizations.animations, 
                        duration: value 
                      } 
                    })
                  }
                  min={100}
                  max={1000}
                  step={50}
                  className="w-full"
                />
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Separator />

        <Button
          variant="outline"
          size="sm"
          onClick={resetCustomizations}
          className="w-full"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset Customizations
        </Button>
      </CardContent>
    </Card>
  )
}