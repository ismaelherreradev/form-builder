import useDesigner from "../hooks/useDesigner"
import FormElementsSidebar from "./form-elements"
import PropertiesFormSidebar from "./properties-form-sidebar"

export default function DesignerSidebar() {
  const { selectedElement } = useDesigner()

  return (
    <aside className="designer-sidebar w-full lg:w-[400px] lg:max-w-[400px] flex flex-col gap-2 border-t-2 lg:border-t-0 lg:border-l-2 border-muted p-4 bg-background overflow-y-auto h-full lg:min-h-0">
      {!selectedElement ? <FormElementsSidebar /> : <PropertiesFormSidebar />}
    </aside>
  )
}
