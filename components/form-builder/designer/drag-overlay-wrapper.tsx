import { useState } from "react"
import { Active, DragOverlay, useDndMonitor } from "@dnd-kit/core"

import { ElementsType, FormElements } from "../elements"
import { DesignerSidebarButtonElementsDragOverlay } from "./buttons-elements"

export default function DragOverlayWrapper() {
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

  return <DragOverlay>{node}</DragOverlay>
}
