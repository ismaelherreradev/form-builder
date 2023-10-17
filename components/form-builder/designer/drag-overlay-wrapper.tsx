"use client"


import { useState } from "react"
import { Active, DragOverlay, useDndMonitor } from "@dnd-kit/core"

import { ElementsType, FormElements } from "../elements"
import useDesigner from "../hooks/useDesigner"
import { DesignerSidebarButtonElementsDragOverlay } from "./buttons-elements"

export default function DragOverlayWrapper() {
  const { elements } = useDesigner()
  const [draggedItem, setDraggedItem] = useState<Active | null>(null)

  useDndMonitor({
    onDragStart: (event) => {
      setDraggedItem(event.active)
    },
    onDragCancel: () => {
      setDraggedItem(null)
    },
    onDragEnd: () => {
      setDraggedItem(null)
    },
  })

  if (!draggedItem) return null

  let node = <div>No drag overlay</div>
  const isDesignerButtonElement =
    draggedItem?.data?.current?.isDesignerButtonElement

  if (isDesignerButtonElement) {
    const type = draggedItem.data?.current?.type as ElementsType
    node = (
      <DesignerSidebarButtonElementsDragOverlay
        formElement={FormElements[type]}
      />
    )
  }

  const isDesignerElement = draggedItem.data?.current?.isDesignerElement
  if (isDesignerElement) {
    const elementId = draggedItem.data?.current?.elementId
    const element = elements.find((el) => el.id === elementId)
    if (!element) node = <div>Element not found!</div>
    else {
      const DesignerElementComponent =
        FormElements[element.type].designerComponent

      node = (
        <div className="flex bg-accent border rounded-md h-[120px] w-full py-2 px-4 opacity-80 pointer pointer-events-none">
          <DesignerElementComponent elementInstance={element} />
        </div>
      )
    }
  }

  return <DragOverlay>{node}</DragOverlay>
}
