import { useDraggable } from "@dnd-kit/core"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

import { FormElement } from "../elements"

export default function DesignerSidebarButtonElements({
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
        "flex flex-col gap-2 h-[120px] w-[120px] cursor-grab",
        draggable.isDragging ? "ring-2 ring-purple-200" : ""
      )}
      {...draggable.listeners}
      {...draggable.attributes}
    >
      <Icon className="h-8 w-8 text-primary cursos-grab" />
      <p className="text-xs">{label}</p>
    </Button>
  )
}

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
      <Icon className="h-8 w-8 text-primary cursos-grab" />
      <p className="text-xs">{label}</p>
    </Button>
  )
}
