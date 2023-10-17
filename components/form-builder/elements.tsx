import { TextFieldFormElement } from "./fields/text-field"

export type ElementsType = "TextField"

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
}
