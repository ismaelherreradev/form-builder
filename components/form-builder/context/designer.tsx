"use client"

import { createContext, useCallback, useMemo } from "react"
import { useImmer } from "use-immer"

import { FormElementInstance } from "../elements"

type DesignerContextType = {
  elements: FormElementInstance[]
  setElements: (elements: FormElementInstance[]) => void
  addElement: (index: number, element: FormElementInstance) => void
  removeElement: (id: string) => void
  updateElement: (id: string, element: FormElementInstance) => void
  selectedElement: FormElementInstance | null
  setSelectedElement: (element: FormElementInstance | null) => void
  clearElements: () => void
}

export const DesignerContext = createContext<DesignerContextType | null>(null)

export default function DesignerContextProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [elements, updateElements] = useImmer<FormElementInstance[]>([])
  const [selectedElement, setSelectedElement] = useImmer<FormElementInstance | null>(null)

  const setElements = useCallback((newElements: FormElementInstance[]) => {
    updateElements(newElements)
  }, [updateElements])

  const addElement = useCallback((index: number, element: FormElementInstance) => {
    updateElements((draft) => {
      draft.splice(index, 0, element)
    })
  }, [updateElements])

  const removeElement = useCallback((id: string) => {
    updateElements((draft) => {
      const index = draft.findIndex((el) => el.id === id)
      if (index !== -1) {
        draft.splice(index, 1)
      }
    })
    // Clear selection if the selected element is being removed
    setSelectedElement((current) => current?.id === id ? null : current)
  }, [updateElements, setSelectedElement])

  const updateElement = useCallback((id: string, element: FormElementInstance) => {
    updateElements((draft) => {
      const index = draft.findIndex((el) => el.id === id)
      if (index !== -1) {
        draft[index] = element
      }
    })
    // Update selection if the selected element is being updated
    setSelectedElement((current) => current?.id === id ? element : current)
  }, [updateElements, setSelectedElement])

  const clearElements = useCallback(() => {
    updateElements([])
    setSelectedElement(null)
  }, [updateElements, setSelectedElement])

  const contextValue = useMemo(() => ({
    elements,
    setElements,
    addElement,
    removeElement,
    updateElement,
    selectedElement,
    setSelectedElement,
    clearElements,
  }), [elements, setElements, addElement, removeElement, updateElement, selectedElement, setSelectedElement, clearElements])

  return (
    <DesignerContext.Provider value={contextValue}>
      {children}
    </DesignerContext.Provider>
  )
}
