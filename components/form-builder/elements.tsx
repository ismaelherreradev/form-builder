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

export type FormElementInstance = {
  id: string
  type: ElementsType
  extraAttributes?: Record<string, any>
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
