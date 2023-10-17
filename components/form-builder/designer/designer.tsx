"use client"

import { DragEndEvent, useDndMonitor, useDroppable } from "@dnd-kit/core"

import { cn, idGenerator } from "@/lib/utils"

import { ElementsType, FormElements } from "../elements"
import useDesigner from "../hooks/useDesigner"
import DesignerElementWrapper from "./element-wrapper"
import DesignerSidebar from "./sidebar"

export default function Designer() {
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

  useDndMonitor({
    onDragEnd: (event: DragEndEvent) => {
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
    },
  })

  return (
    <div className="flex w-full h-full">
      <div className="p-4 w-full">
        <div
          ref={droppable.setNodeRef}
          className={cn(
            "bg-background max-w-[920px] h-full m-auto rounded-xl flex flex-col flex-grow items-center justify-start flex-1 overflow-y-auto",
            droppable.isOver ? "ring-2 ring-purple-200" : ""
          )}
        >
          {!droppable.isOver && elements.length === 0 ? (
            <p className="text-3xl text-muted-foreground flex flex-grow items-center font-bold">
              Drop here
            </p>
          ) : null}

          {droppable.isOver && elements.length === 0 ? (
            <div className="p-4 w-full">
              <div className="h-[120px] rounded-md bg-purple-200"></div>
            </div>
          ) : null}

          {elements.length > 0 ? (
            <div className="flex flex-col texr-has-background w-full gap-2 p-4">
              {elements.map((element) => (
                <DesignerElementWrapper key={element.id} element={element} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
      <DesignerSidebar />
    </div>
  )
}
