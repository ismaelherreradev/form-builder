import { CheckboxFieldFormElement } from "./fields/checkbox-field"
import { DateFieldFormElement } from "./fields/date-field"
import { NumberFieldFormElement } from "./fields/number-field"
import { ParagprahFieldFormElement } from "./fields/paragraph-field"
import { SelectFieldFormElement } from "./fields/select-field"
import { SeparatorFieldFormElement } from "./fields/separator-field"
import { SpacerFieldFormElement } from "./fields/spacer-field"
import { SubTitleFieldFormElement } from "./fields/subtitle-field"
import { TextFieldFormElement } from "./fields/text-field"
import { TextAreaFormElement } from "./fields/textarea-field"
import { TitleFieldFormElement } from "./fields/title-field"

export type ElementsType =
  | "TextField"
  | "TitleField"
  | "CheckboxField"
  | "DateField"
  | "NumberField"
  | "ParagraphField"
  | "SelectField"
  | "SeparatorField"
  | "SpacerField"
  | "SubTitleField"
  | "TextAreaField"

export type SubmitFunction = (key: string, value: string) => void

export type FormElement = {
  type: ElementsType

  construct: (id: string) => FormElementInstance

  designerButtonElement: {
    icon: React.ElementType
    label: string
  }

  designerComponent: React.FC<{
    elementInstance: FormElementInstance
  }>
  formComponent: React.FC<{
    elementInstance: FormElementInstance
    submitValue?: SubmitFunction
    isInvalid?: boolean
    defaultValue?: string
  }>
  propertiesComponent: React.FC<{
    elementInstance: FormElementInstance
  }>

  validate: (formElement: FormElementInstance, currentValue: string) => boolean
}

// Enhanced styling properties
export interface ElementStyling {
  backgroundColor?: string
  textColor?: string
  borderColor?: string
  borderWidth?: number
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none'
  borderRadius?: number
  padding?: {
    top: number
    right: number
    bottom: number
    left: number
  }
  margin?: {
    top: number
    right: number
    bottom: number
    left: number
  }
  fontSize?: number
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold'
  fontFamily?: string
  textAlign?: 'left' | 'center' | 'right' | 'justify'
  lineHeight?: number
  letterSpacing?: number
  boxShadow?: string
  opacity?: number
}

// Animation properties
export interface ElementAnimation {
  entrance?: {
    type: 'fade' | 'slide' | 'scale' | 'bounce' | 'none'
    direction?: 'up' | 'down' | 'left' | 'right'
    duration: number
    delay: number
    easing: string
  }
  hover?: {
    scale?: number
    opacity?: number
    backgroundColor?: string
    borderColor?: string
    duration: number
  }
  focus?: {
    borderColor?: string
    boxShadow?: string
    scale?: number
  }
}

// Responsive settings for different breakpoints
export interface ResponsiveSettings {
  visible: boolean
  width?: 'auto' | 'full' | 'fit' | number
  order?: number
  styling?: Partial<ElementStyling>
}

// Position and layout properties
export interface ElementPosition {
  x: number
  y: number
  width: number | 'auto' | 'full'
  height: number | 'auto'
  zIndex?: number
}

// Conditional logic for showing/hiding elements
export interface ConditionalRule {
  id: string
  condition: {
    field: string
    operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty'
    value: string | number | boolean
  }
  action: 'show' | 'hide' | 'require' | 'disable'
  logicOperator?: 'and' | 'or' // For chaining multiple conditions
}

// Enhanced FormElementInstance with new properties
export type FormElementInstance = {
  id: string
  type: ElementsType
  extraAttributes?: Record<string, any>
  // Enhanced properties
  position?: ElementPosition
  styling?: ElementStyling
  animation?: ElementAnimation
  responsive?: {
    desktop: ResponsiveSettings
    tablet: ResponsiveSettings
    mobile: ResponsiveSettings
  }
  conditionalLogic?: ConditionalRule[]
  // Metadata
  metadata?: {
    label?: string
    description?: string
    category?: string
    tags?: string[]
    createdAt?: Date
    updatedAt?: Date
  }
}

type FormElementsType = {
  [key in ElementsType]: FormElement
}

export const FormElements: FormElementsType = {
  TextField: TextFieldFormElement,
  TitleField: TitleFieldFormElement,
  CheckboxField: CheckboxFieldFormElement,
  DateField: DateFieldFormElement,
  NumberField: NumberFieldFormElement,
  ParagraphField: ParagprahFieldFormElement,
  SelectField: SelectFieldFormElement,
  SeparatorField: SeparatorFieldFormElement,
  SpacerField: SpacerFieldFormElement,
  SubTitleField: SubTitleFieldFormElement,
  TextAreaField: TextAreaFormElement,
}
