import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

import { FormElements } from "../elements"
import useDesigner from "../hooks/useDesigner"

export default function PropertiesFormSidebar() {
  const { selectedElement, setSelectedElement } = useDesigner()
  if (!selectedElement) return null

  const PropertiesForm = FormElements[selectedElement?.type].propertiesComponent
  const elementInfo = FormElements[selectedElement.type].designerButtonElement

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <elementInfo.icon className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              {elementInfo.label}
            </h3>
            <p className="text-xs text-muted-foreground">Configure properties</p>
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setSelectedElement(null)}
          aria-label="Close properties panel"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <Separator />
      <div className="space-y-4">
        <PropertiesForm elementInstance={selectedElement} />
      </div>
    </div>
  )
}
