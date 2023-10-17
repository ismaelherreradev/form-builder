"use client"

import { createContext, Dispatch, SetStateAction, useState } from "react"
import { useImmer } from "use-immer"

import { FormElementInstance } from "../elements"

type DesignerContextType = {
  elements: FormElementInstance[]
  addElement: (index: number, element: FormElementInstance) => void
  setElements: Dispatch<SetStateAction<FormElementInstance[]>>
  removeElement: (id: string) => void
  updateElement: (id: string, element: FormElementInstance) => void
  selectedElement: FormElementInstance | null
  setSelectedElement: Dispatch<SetStateAction<FormElementInstance | null>>
}

export const DesignerContext = createContext<DesignerContextType | null>(null)

export default function DesignerContextProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [elements, setElements] = useImmer<FormElementInstance[]>([])

  const [selectedElement, setSelectedElement] =
    useImmer<FormElementInstance | null>(null)

  const addElement = (index: number, element: FormElementInstance) => {
    setElements((elements: FormElementInstance[]) => {
      const newElements = [...elements]
      newElements.splice(index, 0, element)
      return newElements
    })
  }

  const removeElement = (id: string) => {
    setElements((prev) => prev.filter((element) => element.id !== id))
  }

  const updateElement = (id: string, element: FormElementInstance) => {
    setElements((prev) => {
      const newElements = [...prev]
      const index = newElements.findIndex((el) => el.id === id)
      newElements[index] = element
      return newElements
    })
  }

  return (
    <DesignerContext.Provider
      value={{
        elements,
        addElement,
        setElements,
        removeElement,
        updateElement,
        selectedElement,
        setSelectedElement,
      }}
    >
      {children}
    </DesignerContext.Provider>
  )
}
