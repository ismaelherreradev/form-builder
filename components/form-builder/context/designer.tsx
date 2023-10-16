"use client"

import { createContext } from "react"
import { useImmer } from "use-immer"

import { FormElementInstance } from "../elements"

type DesignerContextType = {
  elements: FormElementInstance[]
  addElement: (index: number, element: FormElementInstance) => void
}

export const DesignerContext = createContext<DesignerContextType | null>(null)

export default function DesignerContextProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [elements, setElements] = useImmer<FormElementInstance[]>([])

  const addElement = (index: number, element: FormElementInstance) => {
    setElements((elements: FormElementInstance[]) => {
      const newElements = [...elements]
      newElements.splice(index, 0, element)
      return newElements
    })
  }

  return (
    <DesignerContext.Provider
      value={{
        elements,
        addElement,
      }}
    >
      {children}
    </DesignerContext.Provider>
  )
}
