import { useState } from "react"
import { useDraggable, useDroppable } from "@dnd-kit/core"
import { Trash2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

import { FormElementInstance, FormElements } from "../elements"
import useDesigner from "../hooks/useDesigner"

export default function DesignerElementWrapper({
  element,
}: {
  element: FormElementInstance
}) {
  const { removeElement, setSelectedElement } = useDesigner()

  const [mouseIsOver, setMouseIsOver] = useState<boolean>(false)

  const DesignerElement = FormElements[element.type].designerComponent

  const topHalf = useDroppable({
    id: `designer-element-${element.id}-top-half`,
    data: {
      type: element.type,
      elementId: element.id,
      isTopHalfDesignerElement: true,
    },
  })

  const bottomHalf = useDroppable({
    id: `designer-element-${element.id}-bottom-half`,
    data: {
      type: element.type,
      elementId: element.id,
      isTopHalfDesignerElement: true,
    },
  })

  const draggable = useDraggable({
    id: `designer-element-${element.id}-drag-handler`,
    data: {
      type: element.type,
      elementId: element.id,
      isDesignerElement: true,
    },
  })

  if (draggable.isDragging) return null // temporary remove the element from designer

  return (
    <div
      ref={draggable.setNodeRef}
      {...draggable.listeners}
      {...draggable.attributes}
      className="relative h-[120px] flex flex-col text-foreground hover:cursor-pointer rounded-md ring-1 ring-accent ring-inset"
      onMouseEnter={() => {
        setMouseIsOver(true)
      }}
      onMouseLeave={() => {
        setMouseIsOver(false)
      }}
      onClick={(e) => {
        e.stopPropagation()
        setSelectedElement(element)
      }}
    >
      <div
        ref={topHalf.setNodeRef}
        className="absolute w-full h-1/2 rounded-t-md"
      />
      <div
        ref={bottomHalf.setNodeRef}
        className="absolute  w-full bottom-0 h-1/2 rounded-b-md"
      />
      {mouseIsOver ? (
        <>
          <div className="absolute right-0 h-full">
            <Button
              className="flex justify-center h-full border rounded-md rounded-l-none bg-red-500"
              variant={"outline"}
              onClick={(e) => {
                e.stopPropagation() // avoid selection of element while deleting
                removeElement(element.id)
              }}
            >
              <Trash2 className="h-6 w-6" />
            </Button>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse">
            <p className="text-muted-foreground text-sm">
              Click for properties or drag to move
            </p>
          </div>
        </>
      ) : null}
      {topHalf.isOver ? (
        <div className="absolute top-0 w-full rounded-md h-[7px] bg-primary rounded-b-none" />
      ) : null}
      <div
        className={cn(
          "flex w-full h-[120px] items-center rounded-md bg-accent/40 px-4 py-2 pointer-events-none opacity-100",
          mouseIsOver ? "opacity-30" : ""
        )}
      >
        <DesignerElement elementInstance={element} />
      </div>
      {bottomHalf.isOver ? (
        <div className="absolute bottom-0 w-full rounded-md h-[7px] bg-primary rounded-t-none" />
      ) : null}
    </div>
  )
}
