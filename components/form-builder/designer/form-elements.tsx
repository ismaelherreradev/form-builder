import { Separator } from "@/components/ui/separator"

import { FormElements } from "../elements"
import DesignerSidebarButtonElements from "./buttons-elements"

export default function FormElementsSidebar() {
  return (
    <div>
      <p className="text-sm text-foreground/70">Drag and drop elements</p>
      <Separator className="my-2" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 place-items-center">
        <p className="text-sm text-muted-foreground col-span-1 md:col-span-2 my-2 place-self-start">
          Layout elements
        </p>
        <DesignerSidebarButtonElements formElement={FormElements.TitleField} />
        <DesignerSidebarButtonElements
          formElement={FormElements.SubTitleField}
        />
        <DesignerSidebarButtonElements
          formElement={FormElements.ParagraphField}
        />
        <DesignerSidebarButtonElements
          formElement={FormElements.SeparatorField}
        />
        <DesignerSidebarButtonElements formElement={FormElements.SpacerField} />

        <p className="text-sm text-muted-foreground col-span-1 md:col-span-2 my-2 place-self-start">
          Form elements
        </p>
        <DesignerSidebarButtonElements formElement={FormElements.TextField} />
        <DesignerSidebarButtonElements formElement={FormElements.NumberField} />
        <DesignerSidebarButtonElements
          formElement={FormElements.TextAreaField}
        />
        <DesignerSidebarButtonElements formElement={FormElements.DateField} />
        <DesignerSidebarButtonElements formElement={FormElements.SelectField} />
        <DesignerSidebarButtonElements
          formElement={FormElements.CheckboxField}
        />
      </div>
    </div>
  )
}
