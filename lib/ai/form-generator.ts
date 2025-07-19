import { FormElementInstance, ElementsType } from "@/components/form-builder/elements"

// AI Prompt Interface
export interface AIPrompt {
  description: string
  industry?: string
  formType?: 'contact' | 'survey' | 'registration' | 'feedback' | 'application' | 'booking' | 'custom'
  targetAudience?: string
  additionalRequirements?: string[]
  maxFields?: number
  includeValidation?: boolean
}

// AI Generated Form Result
export interface AIGeneratedForm {
  elements: FormElementInstance[]
  metadata: {
    title: string
    description: string
    estimatedCompletionTime: number
    suggestedValidations: ValidationRule[]
    confidence: number
  }
  explanation: string
  suggestions: string[]
}

// Field Suggestion Interface
export interface FieldSuggestion {
  type: ElementsType
  label: string
  placeholder?: string
  required: boolean
  validationRules: ValidationRule[]
  confidence: number
  reasoning: string
  position?: number
}

// Validation Rule Interface
export interface ValidationRule {
  type: 'required' | 'email' | 'phone' | 'url' | 'min_length' | 'max_length' | 'pattern' | 'numeric' | 'date'
  value?: any
  message: string
}

// Optimization Suggestion Interface
export interface OptimizationSuggestion {
  type: 'field_order' | 'field_grouping' | 'validation' | 'labeling' | 'styling' | 'accessibility'
  elementId?: string
  severity: 'low' | 'medium' | 'high'
  description: string
  recommendation: string
  impact: string
}

// AI Error Types
export interface AIError {
  type: 'rate_limit' | 'invalid_prompt' | 'generation_failed' | 'network_error' | 'service_unavailable'
  message: string
  retryable: boolean
  fallbackOptions: string[]
  retryAfter?: number
}

// AI Form Templates
export interface AIFormTemplate {
  id: string
  name: string
  description: string
  industry: string
  formType: string
  elements: FormElementInstance[]
  tags: string[]
  popularity: number
  useCount: number
  createdAt: Date
  updatedAt: Date
}

// AI Service Interface
export interface AIFormService {
  generateForm(prompt: AIPrompt): Promise<AIGeneratedForm>
  suggestFields(context: string, existingFields?: FormElementInstance[]): Promise<FieldSuggestion[]>
  generateValidation(fieldType: ElementsType, context: string): Promise<ValidationRule[]>
  optimizeForm(elements: FormElementInstance[]): Promise<OptimizationSuggestion[]>
  getTemplates(filters?: { industry?: string; formType?: string }): Promise<AIFormTemplate[]>
  improveLabeling(elements: FormElementInstance[]): Promise<{ elementId: string; suggestedLabel: string; reasoning: string }[]>
}

// Mock AI Service Implementation
export class MockAIFormService implements AIFormService {
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }

  async generateForm(prompt: AIPrompt): Promise<AIGeneratedForm> {
    // Simulate API delay
    await this.delay(2000 + Math.random() * 1000)

    // Mock form generation based on prompt
    const elements: FormElementInstance[] = []
    let confidence = 0.8

    // Generate title field
    elements.push({
      id: this.generateId(),
      type: "TitleField",
      extraAttributes: {
        title: this.generateFormTitle(prompt)
      }
    })

    // Generate subtitle with description
    if (prompt.description) {
      elements.push({
        id: this.generateId(),
        type: "SubTitleField",
        extraAttributes: {
          title: prompt.description
        }
      })
    }

    // Generate fields based on form type
    const fieldGenerators = {
      contact: this.generateContactFields.bind(this),
      survey: this.generateSurveyFields.bind(this),
      registration: this.generateRegistrationFields.bind(this),
      feedback: this.generateFeedbackFields.bind(this),
      application: this.generateApplicationFields.bind(this),
      booking: this.generateBookingFields.bind(this),
      custom: this.generateCustomFields.bind(this)
    }

    const formType = prompt.formType || 'custom'
    const generatedFields = fieldGenerators[formType](prompt)
    elements.push(...generatedFields)

    // Add separator before submit area
    elements.push({
      id: this.generateId(),
      type: "SeparatorField"
    })

    // Generate validation rules
    const suggestedValidations: ValidationRule[] = elements
      .filter(el => ['TextField', 'NumberField', 'TextAreaField'].includes(el.type))
      .map(el => ({
        type: 'required' as const,
        message: `${el.extraAttributes?.label || 'This field'} is required`,
        value: true
      }))

    // Calculate confidence based on prompt complexity
    if (prompt.additionalRequirements && prompt.additionalRequirements.length > 0) {
      confidence -= 0.1
    }
    if (!prompt.formType || prompt.formType === 'custom') {
      confidence -= 0.2
    }

    return {
      elements,
      metadata: {
        title: this.generateFormTitle(prompt),
        description: prompt.description || "AI-generated form based on your requirements",
        estimatedCompletionTime: Math.ceil(elements.length * 0.5), // 30 seconds per field
        suggestedValidations,
        confidence: Math.max(0.5, confidence)
      },
      explanation: this.generateExplanation(prompt, elements),
      suggestions: this.generateSuggestions(prompt, elements)
    }
  }

  async suggestFields(context: string, existingFields?: FormElementInstance[]): Promise<FieldSuggestion[]> {
    await this.delay(500)

    const suggestions: FieldSuggestion[] = []
    const existingTypes = new Set(existingFields?.map(f => f.type) || [])

    // Suggest common missing fields based on context
    if (context.toLowerCase().includes('contact') && !existingTypes.has('TextField')) {
      suggestions.push({
        type: 'TextField',
        label: 'Email Address',
        placeholder: 'Enter your email',
        required: true,
        validationRules: [{ type: 'email', message: 'Please enter a valid email' }],
        confidence: 0.9,
        reasoning: 'Email is essential for contact forms',
        position: 1
      })
    }

    if (context.toLowerCase().includes('survey') && !existingTypes.has('SelectField')) {
      suggestions.push({
        type: 'SelectField',
        label: 'How did you hear about us?',
        required: false,
        validationRules: [],
        confidence: 0.8,
        reasoning: 'Source tracking is valuable for surveys',
        position: suggestions.length + 1
      })
    }

    return suggestions
  }

  async generateValidation(fieldType: ElementsType, context: string): Promise<ValidationRule[]> {
    await this.delay(300)

    const rules: ValidationRule[] = []

    switch (fieldType) {
      case 'TextField':
        if (context.toLowerCase().includes('email')) {
          rules.push({ type: 'email', message: 'Please enter a valid email address' })
        }
        if (context.toLowerCase().includes('phone')) {
          rules.push({ type: 'phone', message: 'Please enter a valid phone number' })
        }
        if (context.toLowerCase().includes('name')) {
          rules.push({ type: 'min_length', value: 2, message: 'Name must be at least 2 characters' })
        }
        break

      case 'NumberField':
        rules.push({ type: 'numeric', message: 'Please enter a valid number' })
        break

      case 'TextAreaField':
        rules.push({ type: 'min_length', value: 10, message: 'Please provide more detail (at least 10 characters)' })
        break
    }

    return rules
  }

  async optimizeForm(elements: FormElementInstance[]): Promise<OptimizationSuggestion[]> {
    await this.delay(800)

    const suggestions: OptimizationSuggestion[] = []

    // Check for long forms
    if (elements.length > 10) {
      suggestions.push({
        type: 'field_grouping',
        severity: 'medium',
        description: 'Form has many fields',
        recommendation: 'Consider grouping related fields into sections',
        impact: 'Improved user experience and completion rates'
      })
    }

    // Check for missing required fields
    const hasEmail = elements.some(el =>
      el.type === 'TextField' &&
      el.extraAttributes?.label?.toLowerCase().includes('email')
    )

    if (!hasEmail && elements.some(el => el.type === 'TextField')) {
      suggestions.push({
        type: 'field_order',
        severity: 'low',
        description: 'No email field detected',
        recommendation: 'Consider adding an email field for contact purposes',
        impact: 'Better user communication and follow-up capabilities'
      })
    }

    // Check field labeling
    elements.forEach(el => {
      if (['TextField', 'TextAreaField', 'NumberField'].includes(el.type)) {
        if (!el.extraAttributes?.label || el.extraAttributes.label.length < 3) {
          suggestions.push({
            type: 'labeling',
            elementId: el.id,
            severity: 'high',
            description: 'Field has unclear or missing label',
            recommendation: 'Provide clear, descriptive labels for all form fields',
            impact: 'Reduced user confusion and form abandonment'
          })
        }
      }
    })

    return suggestions
  }

  async getTemplates(filters?: { industry?: string; formType?: string }): Promise<AIFormTemplate[]> {
    await this.delay(400)

    const templates: AIFormTemplate[] = [
      {
        id: '1',
        name: 'Contact Form',
        description: 'Basic contact form with name, email, and message',
        industry: 'general',
        formType: 'contact',
        elements: [], // Would contain actual elements
        tags: ['contact', 'basic', 'communication'],
        popularity: 95,
        useCount: 1250,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: '2',
        name: 'Customer Feedback Survey',
        description: 'Comprehensive feedback form for customer satisfaction',
        industry: 'retail',
        formType: 'survey',
        elements: [],
        tags: ['feedback', 'survey', 'customer'],
        popularity: 87,
        useCount: 890,
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-20')
      }
    ]

    // Apply filters
    let filtered = templates

    if (filters?.industry) {
      filtered = filtered.filter(t => t.industry === filters.industry || t.industry === 'general')
    }

    if (filters?.formType) {
      filtered = filtered.filter(t => t.formType === filters.formType)
    }

    return filtered
  }

  async improveLabeling(elements: FormElementInstance[]): Promise<{ elementId: string; suggestedLabel: string; reasoning: string }[]> {
    await this.delay(600)

    const improvements: { elementId: string; suggestedLabel: string; reasoning: string }[] = []

    elements.forEach(el => {
      const currentLabel = el.extraAttributes?.label || ''

      if (el.type === 'TextField' && currentLabel.toLowerCase().includes('name')) {
        if (currentLabel.length < 10) {
          improvements.push({
            elementId: el.id,
            suggestedLabel: 'Full Name (First and Last)',
            reasoning: 'More specific label reduces user confusion about what name information is needed'
          })
        }
      }

      if (el.type === 'TextAreaField' && currentLabel.toLowerCase().includes('message')) {
        improvements.push({
          elementId: el.id,
          suggestedLabel: 'Your Message (Please be specific)',
          reasoning: 'Encouraging specificity leads to more actionable feedback'
        })
      }
    })

    return improvements
  }

  // Helper methods for generating different form types
  private generateContactFields(prompt: AIPrompt): FormElementInstance[] {
    return [
      {
        id: this.generateId(),
        type: "TextField",
        extraAttributes: {
          label: "Full Name",
          placeholder: "Enter your full name",
          required: true
        }
      },
      {
        id: this.generateId(),
        type: "TextField",
        extraAttributes: {
          label: "Email Address",
          placeholder: "Enter your email",
          required: true
        }
      },
      {
        id: this.generateId(),
        type: "TextField",
        extraAttributes: {
          label: "Phone Number",
          placeholder: "Enter your phone number",
          required: false
        }
      },
      {
        id: this.generateId(),
        type: "TextAreaField",
        extraAttributes: {
          label: "Message",
          placeholder: "How can we help you?",
          required: true,
          rows: 4
        }
      }
    ]
  }

  private generateSurveyFields(prompt: AIPrompt): FormElementInstance[] {
    return [
      {
        id: this.generateId(),
        type: "SelectField",
        extraAttributes: {
          label: "How would you rate your experience?",
          placeholder: "Select rating",
          options: [
            { label: "Excellent", value: "excellent" },
            { label: "Good", value: "good" },
            { label: "Fair", value: "fair" },
            { label: "Poor", value: "poor" }
          ],
          required: true
        }
      },
      {
        id: this.generateId(),
        type: "CheckboxField",
        extraAttributes: {
          label: "What features do you use most?",
          required: false
        }
      },
      {
        id: this.generateId(),
        type: "TextAreaField",
        extraAttributes: {
          label: "Additional Comments",
          placeholder: "Please share any additional feedback",
          required: false,
          rows: 3
        }
      }
    ]
  }

  private generateRegistrationFields(prompt: AIPrompt): FormElementInstance[] {
    return [
      {
        id: this.generateId(),
        type: "TextField",
        extraAttributes: {
          label: "First Name",
          placeholder: "Enter your first name",
          required: true
        }
      },
      {
        id: this.generateId(),
        type: "TextField",
        extraAttributes: {
          label: "Last Name",
          placeholder: "Enter your last name",
          required: true
        }
      },
      {
        id: this.generateId(),
        type: "TextField",
        extraAttributes: {
          label: "Email Address",
          placeholder: "Enter your email",
          required: true
        }
      },
      {
        id: this.generateId(),
        type: "DateField",
        extraAttributes: {
          label: "Date of Birth",
          required: false
        }
      },
      {
        id: this.generateId(),
        type: "CheckboxField",
        extraAttributes: {
          label: "I agree to the terms and conditions",
          required: true
        }
      }
    ]
  }

  private generateFeedbackFields(prompt: AIPrompt): FormElementInstance[] {
    return [
      {
        id: this.generateId(),
        type: "TextField",
        extraAttributes: {
          label: "Your Name (Optional)",
          placeholder: "Enter your name",
          required: false
        }
      },
      {
        id: this.generateId(),
        type: "SelectField",
        extraAttributes: {
          label: "Feedback Category",
          placeholder: "Select category",
          options: [
            { label: "Bug Report", value: "bug" },
            { label: "Feature Request", value: "feature" },
            { label: "General Feedback", value: "general" },
            { label: "Complaint", value: "complaint" }
          ],
          required: true
        }
      },
      {
        id: this.generateId(),
        type: "TextAreaField",
        extraAttributes: {
          label: "Detailed Feedback",
          placeholder: "Please provide detailed feedback",
          required: true,
          rows: 5
        }
      }
    ]
  }

  private generateApplicationFields(prompt: AIPrompt): FormElementInstance[] {
    return [
      {
        id: this.generateId(),
        type: "TextField",
        extraAttributes: {
          label: "Full Name",
          placeholder: "Enter your full name",
          required: true
        }
      },
      {
        id: this.generateId(),
        type: "TextField",
        extraAttributes: {
          label: "Email Address",
          placeholder: "Enter your email",
          required: true
        }
      },
      {
        id: this.generateId(),
        type: "TextField",
        extraAttributes: {
          label: "Position Applied For",
          placeholder: "Enter position title",
          required: true
        }
      },
      {
        id: this.generateId(),
        type: "NumberField",
        extraAttributes: {
          label: "Years of Experience",
          placeholder: "Enter years",
          required: true
        }
      },
      {
        id: this.generateId(),
        type: "TextAreaField",
        extraAttributes: {
          label: "Cover Letter",
          placeholder: "Tell us why you're a great fit",
          required: true,
          rows: 6
        }
      }
    ]
  }

  private generateBookingFields(prompt: AIPrompt): FormElementInstance[] {
    return [
      {
        id: this.generateId(),
        type: "TextField",
        extraAttributes: {
          label: "Full Name",
          placeholder: "Enter your full name",
          required: true
        }
      },
      {
        id: this.generateId(),
        type: "TextField",
        extraAttributes: {
          label: "Email Address",
          placeholder: "Enter your email",
          required: true
        }
      },
      {
        id: this.generateId(),
        type: "DateField",
        extraAttributes: {
          label: "Preferred Date",
          required: true
        }
      },
      {
        id: this.generateId(),
        type: "SelectField",
        extraAttributes: {
          label: "Preferred Time",
          placeholder: "Select time slot",
          options: [
            { label: "9:00 AM", value: "09:00" },
            { label: "11:00 AM", value: "11:00" },
            { label: "2:00 PM", value: "14:00" },
            { label: "4:00 PM", value: "16:00" }
          ],
          required: true
        }
      },
      {
        id: this.generateId(),
        type: "NumberField",
        extraAttributes: {
          label: "Number of People",
          placeholder: "Enter number",
          required: true
        }
      }
    ]
  }

  private generateCustomFields(prompt: AIPrompt): FormElementInstance[] {
    // Generate basic fields for custom forms
    const fields: FormElementInstance[] = []

    // Always include name and email for custom forms
    fields.push({
      id: this.generateId(),
      type: "TextField",
      extraAttributes: {
        label: "Name",
        placeholder: "Enter your name",
        required: true
      }
    })

    fields.push({
      id: this.generateId(),
      type: "TextField",
      extraAttributes: {
        label: "Email",
        placeholder: "Enter your email",
        required: true
      }
    })

    // Add a message field
    fields.push({
      id: this.generateId(),
      type: "TextAreaField",
      extraAttributes: {
        label: "Message",
        placeholder: "Enter your message",
        required: false,
        rows: 4
      }
    })

    return fields
  }

  private generateFormTitle(prompt: AIPrompt): string {
    const typeToTitle = {
      contact: "Contact Us",
      survey: "Feedback Survey",
      registration: "Registration Form",
      feedback: "Share Your Feedback",
      application: "Job Application",
      booking: "Book an Appointment",
      custom: "Form"
    }

    const baseTitle = typeToTitle[prompt.formType || 'custom']

    if (prompt.industry) {
      return `${prompt.industry} ${baseTitle}`
    }

    return baseTitle
  }

  private generateExplanation(prompt: AIPrompt, elements: FormElementInstance[]): string {
    const fieldCount = elements.filter(el => !['TitleField', 'SubTitleField', 'SeparatorField'].includes(el.type)).length

    return `I've created a ${prompt.formType || 'custom'} form with ${fieldCount} input fields based on your requirements. The form includes essential fields for collecting the necessary information while maintaining a user-friendly experience. The structure follows best practices for ${prompt.formType || 'custom'} forms${prompt.industry ? ` in the ${prompt.industry} industry` : ''}.`
  }

  private generateSuggestions(prompt: AIPrompt, elements: FormElementInstance[]): string[] {
    const suggestions = [
      "Consider adding conditional logic to show/hide fields based on user responses",
      "Test the form on different devices to ensure mobile responsiveness",
      "Add clear validation messages to help users understand requirements"
    ]

    if (prompt.formType === 'contact') {
      suggestions.push("Consider adding a subject field to help categorize inquiries")
    }

    if (prompt.formType === 'survey') {
      suggestions.push("Add progress indicators for longer surveys to improve completion rates")
    }

    return suggestions
  }
}

// Singleton instance
export const aiFormService = new MockAIFormService()

// Error handling utility
export function createAIError(type: AIError['type'], message: string, retryable: boolean = false): AIError {
  const fallbackOptions: string[] = []

  switch (type) {
    case 'rate_limit':
      fallbackOptions.push('Try again in a few minutes', 'Use a form template instead')
      break
    case 'invalid_prompt':
      fallbackOptions.push('Provide more specific requirements', 'Try a different form type')
      break
    case 'generation_failed':
      fallbackOptions.push('Retry with simpler requirements', 'Build form manually')
      break
    case 'network_error':
      fallbackOptions.push('Check your internet connection', 'Try again later')
      break
    case 'service_unavailable':
      fallbackOptions.push('AI service is temporarily unavailable', 'Use manual form builder')
      break
  }

  return {
    type,
    message,
    retryable,
    fallbackOptions
  }
}
