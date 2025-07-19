import { 
  Type, 
  Hash, 
  Calendar, 
  CheckSquare, 
  List, 
  Minus, 
  Space, 
  AlignLeft,
  Heading1,
  Heading2
} from "lucide-react"
import { FormElements, FormElement } from "../elements"
import { ElementCategory } from "../types/element-palette"

// Category icons
export const CategoryIcons = {
  Layout: AlignLeft,
  Input: Type,
  Selection: List,
  Display: Heading1,
  Structure: Hash,
} as const

// Define element categories with their associated elements
export const createElementCategories = (): ElementCategory[] => [
  {
    id: "layout",
    name: "Layout",
    icon: CategoryIcons.Layout,
    color: "blue",
    description: "Structure and organize your form",
    elements: [
      FormElements.TitleField,
      FormElements.SubTitleField,
      FormElements.ParagraphField,
      FormElements.SeparatorField,
      FormElements.SpacerField,
    ]
  },
  {
    id: "input",
    name: "Input Fields",
    icon: CategoryIcons.Input,
    color: "green",
    description: "Collect user information",
    elements: [
      FormElements.TextField,
      FormElements.NumberField,
      FormElements.TextAreaField,
      FormElements.DateField,
    ]
  },
  {
    id: "selection",
    name: "Selection",
    icon: CategoryIcons.Selection,
    color: "purple",
    description: "Multiple choice and selection fields",
    elements: [
      FormElements.SelectField,
      FormElements.CheckboxField,
    ]
  }
]

// Get category color classes
export const getCategoryColorClasses = (color: string) => {
  const colorMap = {
    blue: {
      indicator: "bg-blue-500",
      hover: "hover:bg-blue-50 dark:hover:bg-blue-950/20",
      border: "border-blue-200 dark:border-blue-800",
      text: "text-blue-700 dark:text-blue-300"
    },
    green: {
      indicator: "bg-green-500",
      hover: "hover:bg-green-50 dark:hover:bg-green-950/20",
      border: "border-green-200 dark:border-green-800",
      text: "text-green-700 dark:text-green-300"
    },
    purple: {
      indicator: "bg-purple-500",
      hover: "hover:bg-purple-50 dark:hover:bg-purple-950/20",
      border: "border-purple-200 dark:border-purple-800",
      text: "text-purple-700 dark:text-purple-300"
    },
    orange: {
      indicator: "bg-orange-500",
      hover: "hover:bg-orange-50 dark:hover:bg-orange-950/20",
      border: "border-orange-200 dark:border-orange-800",
      text: "text-orange-700 dark:text-orange-300"
    }
  }
  
  return colorMap[color as keyof typeof colorMap] || colorMap.blue
}

// Search elements across categories
export const searchElements = (
  categories: ElementCategory[], 
  query: string
): { element: FormElement; category: ElementCategory; matchScore: number }[] => {
  if (!query.trim()) return []
  
  const results: { element: FormElement; category: ElementCategory; matchScore: number }[] = []
  const searchTerm = query.toLowerCase().trim()
  
  categories.forEach(category => {
    category.elements.forEach(element => {
      const label = element.designerButtonElement.label.toLowerCase()
      const categoryName = category.name.toLowerCase()
      
      let matchScore = 0
      
      // Exact match in label gets highest score
      if (label === searchTerm) {
        matchScore = 100
      }
      // Label starts with search term
      else if (label.startsWith(searchTerm)) {
        matchScore = 80
      }
      // Label contains search term
      else if (label.includes(searchTerm)) {
        matchScore = 60
      }
      // Category name matches
      else if (categoryName.includes(searchTerm)) {
        matchScore = 40
      }
      // Element type matches
      else if (element.type.toLowerCase().includes(searchTerm)) {
        matchScore = 30
      }
      
      if (matchScore > 0) {
        results.push({ element, category, matchScore })
      }
    })
  })
  
  // Sort by match score (highest first)
  return results.sort((a, b) => b.matchScore - a.matchScore)
}

// Get all elements from categories
export const getAllElements = (categories: ElementCategory[]): FormElement[] => {
  return categories.flatMap(category => category.elements)
}