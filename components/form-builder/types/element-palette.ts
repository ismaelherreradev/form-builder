import { FormElement, ElementsType } from "../elements"

export interface ElementCategory {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  elements: FormElement[]
  color: string
  description?: string
}

export interface ElementPaletteProps {
  categories: ElementCategory[]
  searchQuery: string
  onSearch: (query: string) => void
  favoriteElements: string[]
  onToggleFavorite: (elementType: string) => void
  onElementSelect?: (element: FormElement) => void
}

export interface ElementSearchResult {
  element: FormElement
  category: ElementCategory
  matchScore: number
}

export interface FavoriteElementsStorage {
  favorites: string[]
  lastUpdated: number
}