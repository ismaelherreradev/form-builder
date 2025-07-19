"use client"

import { useState, useMemo, useCallback, useRef, useEffect } from "react"
import { Monitor, Tablet, Smartphone, RotateCcw, Play, Pause, CheckCircle, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

import { FormElementInstance, FormElements } from "../elements"
import useDesigner from "../hooks/useDesigner"

export type DeviceType = 'desktop' | 'tablet' | 'mobile'
export type Orientation = 'portrait' | 'landscape'

interface DevicePreset {
  name: string
  width: number
  height: number
  scale: number
}

const DEVICE_PRESETS: Record<DeviceType, Record<Orientation, DevicePreset>> = {
  desktop: {
    portrait: { name: 'Desktop', width: 1200, height: 800, scale: 0.6 },
    landscape: { name: 'Desktop', width: 1200, height: 800, scale: 0.6 }
  },
  tablet: {
    portrait: { name: 'iPad', width: 768, height: 1024, scale: 0.7 },
    landscape: { name: 'iPad', width: 1024, height: 768, scale: 0.7 }
  },
  mobile: {
    portrait: { name: 'iPhone', width: 375, height: 667, scale: 0.8 },
    landscape: { name: 'iPhone', width: 667, height: 375, scale: 0.8 }
  }
}

interface PreviewInteraction {
  type: 'click' | 'input' | 'submit' | 'validation'
  elementId: string
  value?: any
  timestamp: number
  isValid?: boolean
}

interface EnhancedPreviewProps {
  formTitle?: string
  formDescription?: string
  showValidation?: boolean
  interactiveMode?: boolean
  onSubmit?: (data: Record<string, any>) => void
}

export default function EnhancedPreview({
  formTitle = "Preview Form",
  formDescription,
  showValidation = true,
  interactiveMode = true,
  onSubmit
}: EnhancedPreviewProps) {
  const { elements } = useDesigner()
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop')
  const [orientation, setOrientation] = useState<Orientation>('portrait')
  const [isInteractive, setIsInteractive] = useState(interactiveMode)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [interactions, setInteractions] = useState<PreviewInteraction[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  // Get current device preset
  const currentDevice = useMemo(() =>
    DEVICE_PRESETS[deviceType][orientation],
    [deviceType, orientation]
  )

  // Handle device type change
  const handleDeviceChange = useCallback((newDevice: DeviceType) => {
    setDeviceType(newDevice)
    // Reset orientation to portrait when changing device
    setOrientation('portrait')
  }, [])

  // Handle orientation toggle
  const handleOrientationToggle = useCallback(() => {
    setOrientation(prev => prev === 'portrait' ? 'landscape' : 'portrait')
  }, [])

  // Handle form input changes
  const handleInputChange = useCallback((elementId: string, value: any) => {
    if (!isInteractive) return

    setFormData(prev => ({ ...prev, [elementId]: value }))

    // Clear validation error for this field
    setValidationErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[elementId]
      return newErrors
    })

    // Record interaction
    const interaction: PreviewInteraction = {
      type: 'input',
      elementId,
      value,
      timestamp: Date.now()
    }
    setInteractions(prev => [...prev, interaction])
  }, [isInteractive])

  // Validate form
  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {}

    elements.forEach(element => {
      const formElement = FormElements[element.type]
      const value = formData[element.id] || ''

      // Check if element is required
      if (element.extraAttributes?.required && !value) {
        errors[element.id] = 'This field is required'
        return
      }

      // Use element's validation function
      if (value && !formElement.validate(element, value)) {
        errors[element.id] = 'Invalid value'
      }
    })

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }, [elements, formData])

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isInteractive) return

    setIsSubmitting(true)

    // Validate form
    const isValid = validateForm()

    // Record submission interaction
    const interaction: PreviewInteraction = {
      type: 'submit',
      elementId: 'form',
      value: formData,
      timestamp: Date.now(),
      isValid
    }
    setInteractions(prev => [...prev, interaction])

    if (isValid) {
      try {
        await onSubmit?.(formData)
        // Show success message or reset form
        setFormData({})
      } catch (error) {
        console.error('Form submission error:', error)
      }
    }

    setIsSubmitting(false)
  }, [isInteractive, validateForm, formData, onSubmit])

  // Reset preview
  const handleReset = useCallback(() => {
    setFormData({})
    setValidationErrors({})
    setInteractions([])
  }, [])

  // Render form element
  const renderFormElement = useCallback((element: FormElementInstance) => {
    const FormComponent = FormElements[element.type].formComponent
    const value = formData[element.id] || ''
    const error = validationErrors[element.id]

    return (
      <div key={element.id} className="relative">
        <FormComponent
          elementInstance={element}
          submitValue={(key, value) => handleInputChange(element.id, value)}
          isInvalid={!!error}
          defaultValue={value}
        />
        {showValidation && error && (
          <div className="text-xs text-destructive mt-1 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {error}
          </div>
        )}
      </div>
    )
  }, [formData, validationErrors, showValidation, handleInputChange])

  // Calculate form completion
  const formCompletion = useMemo(() => {
    const requiredElements = elements.filter(el => el.extraAttributes?.required)
    if (requiredElements.length === 0) return 100

    const completedRequired = requiredElements.filter(el => formData[el.id]).length
    return Math.round((completedRequired / requiredElements.length) * 100)
  }, [elements, formData])

  return (
    <div className="flex flex-col h-full bg-muted/30">
      {/* Preview Toolbar */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            {/* Device Selection */}
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={deviceType === 'desktop' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleDeviceChange('desktop')}
                    >
                      <Monitor className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Desktop View</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={deviceType === 'tablet' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleDeviceChange('tablet')}
                    >
                      <Tablet className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Tablet View</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={deviceType === 'mobile' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleDeviceChange('mobile')}
                    >
                      <Smartphone className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Mobile View</TooltipContent>
                </Tooltip>

                {/* Orientation Toggle */}
                {deviceType !== 'desktop' && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleOrientationToggle}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Switch to {orientation === 'portrait' ? 'Landscape' : 'Portrait'}
                    </TooltipContent>
                  </Tooltip>
                )}
              </TooltipProvider>
            </div>

            {/* Device Info */}
            <div className="text-sm text-muted-foreground">
              {currentDevice.name} • {currentDevice.width} × {currentDevice.height}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Interactive Mode Toggle */}
            <Button
              variant={isInteractive ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIsInteractive(!isInteractive)}
            >
              {isInteractive ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
              {isInteractive ? 'Interactive' : 'Static'}
            </Button>

            {/* Reset Button */}
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>

            {/* Form Stats */}
            {isInteractive && (
              <Badge variant="secondary">
                {formCompletion}% Complete
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="flex justify-center">
          {/* Device Frame */}
          <div
            className={cn(
              "bg-background rounded-lg border-2 shadow-lg transition-all duration-300",
              deviceType === 'mobile' && "border-8 border-gray-800 rounded-[2rem]",
              deviceType === 'tablet' && "border-4 border-gray-700 rounded-xl"
            )}
            style={{
              width: currentDevice.width * currentDevice.scale,
              height: currentDevice.height * currentDevice.scale,
              minHeight: 400
            }}
          >
            <div
              ref={previewRef}
              className="w-full h-full overflow-auto rounded-lg"
              style={{
                transform: `scale(${currentDevice.scale})`,
                transformOrigin: 'top left',
                width: currentDevice.width,
                height: currentDevice.height
              }}
            >
              {/* Form Preview */}
              <div className="p-6 h-full">
                {elements.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="text-4xl text-muted-foreground/30 mb-4">📋</div>
                    <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                      No Form Elements
                    </h3>
                    <p className="text-sm text-muted-foreground/70">
                      Add elements to the designer to see them here
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Form Header */}
                    <div className="text-center space-y-2">
                      <h1 className="text-2xl font-bold">{formTitle}</h1>
                      {formDescription && (
                        <p className="text-muted-foreground">{formDescription}</p>
                      )}
                      {isInteractive && showValidation && (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${formCompletion}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground min-w-[40px]">
                            {formCompletion}%
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Form Elements */}
                    <div className="space-y-4">
                      {elements.map(renderFormElement)}
                    </div>

                    {/* Submit Button */}
                    {isInteractive && (
                      <div className="pt-4">
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Submitting...' : 'Submit Form'}
                        </Button>
                      </div>
                    )}

                    {/* Validation Summary */}
                    {isInteractive && showValidation && Object.keys(validationErrors).length > 0 && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Please fix {Object.keys(validationErrors).length} error(s) before submitting.
                        </AlertDescription>
                      </Alert>
                    )}
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Debug Panel */}
      {isInteractive && interactions.length > 0 && (
        <div className="border-t bg-background/95">
          <Tabs defaultValue="interactions" className="w-full">
            <TabsList className="w-full justify-start p-4 h-auto">
              <TabsTrigger value="interactions">
                Interactions ({interactions.length})
              </TabsTrigger>
              <TabsTrigger value="data">
                Form Data ({Object.keys(formData).length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="interactions" className="p-4 pt-0">
              <ScrollArea className="h-32">
                <div className="space-y-1">
                  {interactions.slice(-10).map((interaction, index) => (
                    <div
                      key={index}
                      className="text-xs p-2 bg-muted rounded flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {interaction.type}
                        </Badge>
                        <span>{interaction.elementId}</span>
                        {interaction.isValid !== undefined && (
                          interaction.isValid ? (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          ) : (
                            <AlertCircle className="h-3 w-3 text-red-500" />
                          )
                        )}
                      </div>
                      <span className="text-muted-foreground">
                        {new Date(interaction.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="data" className="p-4 pt-0">
              <ScrollArea className="h-32">
                <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                  {JSON.stringify(formData, null, 2)}
                </pre>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}
