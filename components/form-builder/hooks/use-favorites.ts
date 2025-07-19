import { useState, useEffect, useCallback } from "react"
import { FavoriteElementsStorage } from "../types/element-palette"

const FAVORITES_STORAGE_KEY = "form-builder-favorite-elements"

export const useFavoriteElements = () => {
  const [favoriteElements, setFavoriteElements] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY)
      if (stored) {
        const data: FavoriteElementsStorage = JSON.parse(stored)
        setFavoriteElements(data.favorites || [])
      }
    } catch (error) {
      console.warn("Failed to load favorite elements from localStorage:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Save favorites to localStorage
  const saveFavorites = useCallback((favorites: string[]) => {
    try {
      const data: FavoriteElementsStorage = {
        favorites,
        lastUpdated: Date.now()
      }
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.warn("Failed to save favorite elements to localStorage:", error)
    }
  }, [])

  // Toggle favorite status of an element
  const toggleFavorite = useCallback((elementType: string) => {
    setFavoriteElements(prev => {
      const newFavorites = prev.includes(elementType)
        ? prev.filter(type => type !== elementType)
        : [...prev, elementType]
      
      saveFavorites(newFavorites)
      return newFavorites
    })
  }, [saveFavorites])

  // Check if element is favorite
  const isFavorite = useCallback((elementType: string) => {
    return favoriteElements.includes(elementType)
  }, [favoriteElements])

  // Clear all favorites
  const clearFavorites = useCallback(() => {
    setFavoriteElements([])
    saveFavorites([])
  }, [saveFavorites])

  return {
    favoriteElements,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    isLoading
  }
}