import { FormElements } from "../elements";
import DesignerSidebarButtonElements from "./buttons-elements";

export default function DesignerSidebar() {
  return (
    <aside className="w-[400px] max-w-[400px] flex flex-col flex-grow gap-2 border-l-2 border-muted p-4 bg-background overflow-y-auto h-full">
      Elements
      <DesignerSidebarButtonElements formElement={FormElements.TextField} />
    </aside>
  )
}
