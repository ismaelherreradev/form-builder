import { Type } from "lucide-react"
import { ElementsType, FormElement } from "../elements"

const type: ElementsType = "TextField"

export const TextFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    extraAttributes: {
      label: 'Text field',
      helperText: 'Helped text',
      require: false,
      placeHolder: "Value here..."
    }
  }),
  designerButtonElement: {
    icon: Type,
    label: 'Text field',
  },
  designerComponent: () => <div>Designer component</div>,
  formComponent: () => <div>Form component</div>,
  propertiesComponent: () => <div>Properties component</div>,
}
