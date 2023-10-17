import { FormElements } from "../elements"
import DesignerSidebarButtonElements from "./buttons-elements"

export default function FormElementsSidebar() {
  return (
    <div>
      Elements
      <DesignerSidebarButtonElements formElement={FormElements.TextField} />
    </div>
  )
}
