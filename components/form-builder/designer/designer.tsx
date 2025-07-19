"use client"

import { useCallback, useMemo } from "react"
import { DragEndEvent, useDndMonitor, useDroppable } from "@dnd-kit/core"

import { cn, idGenerator } from "@/lib/utils"

import { ElementsType, FormElements } from "../elements"
import useDesigner from "../hooks/useDesigner"
import DesignerElementWrapper from "./element-wrapper"
import DesignerSidebar from "./sidebar"
import { DesignerErrorBoundary } from "./error-boundary"

function DesignerContent() {
  const {
    elements,
    addElement,
    selectedElement,
    setSelectedElement,
    removeElement,
  } = useDesigner()

  const droppable = useDroppable({
    id: "designer-drop-area",
    data: {
      isDesignerDropArea: true,
    },
  })

  const handleDragEnd = useCallback((event: DragEndEvent) => {
      const { active, over } = event
      if (!active || !over) return

      const isDesignerButtonElement =
        active.data?.current?.isDesignerButtonElement
      const isDroppingOverDesignerDropArea =
        over.data?.current?.isDesignerDropArea

      const droppingSidebarBtnOverDesignerDropArea =
        isDesignerButtonElement && isDroppingOverDesignerDropArea

      // First scenario
      if (droppingSidebarBtnOverDesignerDropArea) {
        const type = active.data?.current?.type
        const newElement = FormElements[type as ElementsType].construct(
          idGenerator()
        )

        addElement(elements.length, newElement)
        return
      }

      const isDroppingOverDesignerElementTopHalf =
        over.data?.current?.isTopHalfDesignerElement

      const isDroppingOverDesignerElementBottomHalf =
        over.data?.current?.isBottomHalfDesignerElement

      const isDroppingOverDesignerElement =
        isDroppingOverDesignerElementTopHalf ||
        isDroppingOverDesignerElementBottomHalf

      const droppingSidebarBtnOverDesignerElement =
        isDesignerButtonElement && isDroppingOverDesignerElement

      // Second scenario
      if (droppingSidebarBtnOverDesignerElement) {
        const type = active.data?.current?.type
        const newElement = FormElements[type as ElementsType].construct(
          idGenerator()
        )

        const overId = over.data?.current?.elementId

        const overElementIndex = elements.findIndex((el) => el.id === overId)
        if (overElementIndex === -1) {
          throw new Error("element not found")
        }

        let indexForNewElement = overElementIndex // i assume i'm on top-half
        if (isDroppingOverDesignerElementBottomHalf) {
          indexForNewElement = overElementIndex + 1
        }

        addElement(indexForNewElement, newElement)
        return
      }

      // Third scenario
      const isDraggingDesignerElement = active.data?.current?.isDesignerElement

      const draggingDesignerElementOverAnotherDesignerElement =
        isDroppingOverDesignerElement && isDraggingDesignerElement

      if (draggingDesignerElementOverAnotherDesignerElement) {
        const activeId = active.data?.current?.elementId
        const overId = over.data?.current?.elementId

        const activeElementIndex = elements.findIndex(
          (el) => el.id === activeId
        )

        const overElementIndex = elements.findIndex((el) => el.id === overId)

        if (activeElementIndex === -1 || overElementIndex === -1) {
          throw new Error("element not found")
        }

        const activeElement = { ...elements[activeElementIndex] }
        removeElement(activeId)

        let indexForNewElement = overElementIndex // i assume i'm on top-half
        if (isDroppingOverDesignerElementBottomHalf) {
          indexForNewElement = overElementIndex + 1
        }

        addElement(indexForNewElement, activeElement)
      }
    }, [elements, addElement, removeElement])

  useDndMonitor({
    onDragEnd: handleDragEnd,
  })

  const renderedElements = useMemo(() => 
    elements.map((element) => (
      <DesignerElementWrapper key={element.id} element={element} />
    )), [elements]
  )

  return (
    <div className="flex w-full h-full flex-col lg:flex-row">
      <div className="p-4 w-full flex-1 min-h-0">
        <div
          ref={droppable.setNodeRef}
          className={cn(
            "designer-drop-area bg-background max-w-[920px] h-full m-auto rounded-xl flex flex-col flex-grow items-center justify-start flex-1 overflow-y-auto border-2 border-dashed border-muted-foreground/20 transition-colors",
            droppable.isOver ? "ring-2 ring-primary/50 border-primary/50 bg-primary/5" : ""
          )}
          role="region"
          aria-label="Form designer drop area"
        >
          {!droppable.isOver && elements.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-grow gap-4 text-center">
              <div className="text-6xl text-muted-foreground/30">📝</div>
              <div>
                <p className="text-2xl font-semibold text-muted-foreground mb-2">
                  Start Building Your Form
                </p>
                <p className="text-sm text-muted-foreground/70 max-w-md">
                  Drag and drop elements from the sidebar to create your form
                </p>
              </div>
            </div>
          ) : null}

          {droppable.isOver && elements.length === 0 ? (
            <div className="p-4 w-full">
              <div className="h-[120px] rounded-md bg-primary/10 border-2 border-dashed border-primary/30 flex items-center justify-center">
                <p className="text-primary font-medium">Drop element here</p>
              </div>
            </div>
          ) : null}

          {elements.length > 0 ? (
            <div className="flex flex-col w-full gap-2 p-4">
              {renderedElements}
            </div>
          ) : null}
        </div>
      </div>
      <DesignerSidebar />
    </div>
  )
}

export default function Designer() {
  return (
    <DesignerErrorBoundary>
      <DesignerContent />
    </DesignerErrorBoundary>
  )
}
