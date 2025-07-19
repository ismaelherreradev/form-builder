import { memo } from "react"
import { useDraggable } from "@dnd-kit/core"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

import { FormElement } from "../elements"

function DesignerSidebarButtonElements({
  formElement,
}: {
  formElement: FormElement
}) {
  const { label, icon: Icon } = formElement.designerButtonElement
  const draggable = useDraggable({
    id: `designer-button-${formElement.type}`,
    data: {
      type: formElement.type,
      isDesignerButtonElement: true,
    },
  })

  return (
    <Button
      ref={draggable.setNodeRef}
      variant={"outline"}
      className={cn(
        "designer-sidebar-button flex flex-col gap-2 h-[120px] w-[120px] cursor-grab transition-all hover:scale-105 hover:shadow-md",
        draggable.isDragging ? "ring-2 ring-primary/50 scale-105" : ""
      )}
      {...draggable.listeners}
      {...draggable.attributes}
    >
      <Icon className="h-8 w-8 text-primary cursor-grab" />
      <p className="text-xs font-medium">{label}</p>
    </Button>
  )
}

export default memo(DesignerSidebarButtonElements)

export function DesignerSidebarButtonElementsDragOverlay({
  formElement,
}: {
  formElement: FormElement
}) {
  const { label, icon: Icon } = formElement.designerButtonElement

  return (
    <Button
      variant={"outline"}
      className="flex flex-col gap-2 h-[120px] w-[120px] cursor-grab"
    >
      <Icon className="h-8 w-8 text-primary cursor-grab" />
      <p className="text-xs font-medium">{label}</p>
    </Button>
  )
}
