"use client"

import { DragEndEvent, useDndMonitor, useDroppable } from "@dnd-kit/core"

import { cn, idGenerator } from "@/lib/utils"

import {
  ElementsType,
  FormElement,
  FormElementInstance,
  FormElements,
} from "../elements"
import useDesigner from "../hooks/useDesigner"
import DesignerSidebar from "./sidebar"

export default function Designer() {
  const { elements, addElement } = useDesigner()

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

      if (isDesignerButtonElement) {
        const type = active.data?.current?.type
        const newElement = FormElements[type as ElementsType].construct(
          idGenerator()
        )

        addElement(0, newElement)
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
          {droppable.isOver || elements.length > 0 ? (
            <div className="p-4 w-full">
              <div className="h-[120px] rounded-md bg-purple-200"></div>
            </div>
          ) : (
            <p className="text-3xl text-muted-foreground flex flex-grow items-center font-bold">
              Drop here
            </p>
          )}
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

function DesignerElementWrapper({ element }: { element: FormElementInstance }) {
  const DesignerElement = FormElements[element.type].designerComponent

  return <DesignerElement elementInstance={element} />
}
