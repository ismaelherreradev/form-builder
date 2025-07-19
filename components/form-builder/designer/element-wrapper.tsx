import { useState, memo, useCallback } from "react"
import { useDraggable, useDroppable } from "@dnd-kit/core"
import { Trash2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

import { FormElementInstance, FormElements } from "../elements"
import useDesigner from "../hooks/useDesigner"

function DesignerElementWrapper({
  element,
}: {
  element: FormElementInstance
}) {
  const { removeElement, setSelectedElement } = useDesigner()

  const [mouseIsOver, setMouseIsOver] = useState<boolean>(false)

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedElement(element)
  }, [element, setSelectedElement])

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    removeElement(element.id)
  }, [element.id, removeElement])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setSelectedElement(element)
    }
  }, [element, setSelectedElement])

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
      isBottomHalfDesignerElement: true,
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
      className="designer-element-wrapper relative h-[120px] flex flex-col text-foreground hover:cursor-pointer rounded-md ring-1 ring-accent ring-inset transition-all duration-200 hover:ring-2 hover:ring-primary/50 group"
      onMouseEnter={() => {
        setMouseIsOver(true)
      }}
      onMouseLeave={() => {
        setMouseIsOver(false)
      }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`Form element: ${element.type}`}
      onKeyDown={handleKeyDown}
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
          <div className="absolute right-0 top-0 z-10">
            <Button
              size="sm"
              className="h-8 w-8 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-l-none"
              variant="destructive"
              onClick={handleDelete}
              aria-label="Delete element"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-md">
            <div className="text-center">
              <p className="text-sm font-medium text-foreground mb-1">
                {FormElements[element.type].designerButtonElement.label}
              </p>
              <p className="text-xs text-muted-foreground">
                Click to edit • Drag to move
              </p>
            </div>
          </div>
        </>
      ) : null}
      {topHalf.isOver ? (
        <div className="absolute top-0 w-full rounded-md h-[7px] bg-primary rounded-b-none" />
      ) : null}
      <div
        className={cn(
          "flex w-full h-[120px] items-center rounded-md bg-accent/40 px-4 py-2 pointer-events-none transition-opacity duration-200",
          mouseIsOver ? "opacity-20" : "opacity-100"
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

export default memo(DesignerElementWrapper)
