import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFavoriteElements } from '@/components/form-builder/hooks/use-favorites'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('useFavoriteElements Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  it('should initialize with empty favorites when localStorage is empty', () => {
    const { result } = renderHook(() => useFavoriteElements())
    
    expect(result.current.favoriteElements).toEqual([])
    expect(result.current.isLoading).toBe(false)
  })

  it('should load favorites from localStorage on mount', () => {
    const storedFavorites = {
      favorites: ['TextField', 'CheckboxField'],
      lastUpdated: Date.now()
    }
    localStorageMock.getItem.mockReturnValue(JSON.stringify(storedFavorites))
    
    const { result } = renderHook(() => useFavoriteElements())
    
    expect(result.current.favoriteElements).toEqual(['TextField', 'CheckboxField'])
    expect(localStorageMock.getItem).toHaveBeenCalledWith('form-builder-favorite-elements')
  })

  it('should handle corrupted localStorage data gracefully', () => {
    localStorageMock.getItem.mockReturnValue('invalid json')
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    
    const { result } = renderHook(() => useFavoriteElements())
    
    expect(result.current.favoriteElements).toEqual([])
    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to load favorite elements from localStorage:',
      expect.any(Error)
    )
    
    consoleSpy.mockRestore()
  })

  it('should add element to favorites', () => {
    const { result } = renderHook(() => useFavoriteElements())
    
    act(() => {
      result.current.toggleFavorite('TextField')
    })
    
    expect(result.current.favoriteElements).toContain('TextField')
    expect(result.current.isFavorite('TextField')).toBe(true)
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'form-builder-favorite-elements',
      expect.stringContaining('TextField')
    )
  })

  it('should remove element from favorites', () => {
    const storedFavorites = {
      favorites: ['TextField', 'CheckboxField'],
      lastUpdated: Date.now()
    }
    localStorageMock.getItem.mockReturnValue(JSON.stringify(storedFavorites))
    
    const { result } = renderHook(() => useFavoriteElements())
    
    act(() => {
      result.current.toggleFavorite('TextField')
    })
    
    expect(result.current.favoriteElements).not.toContain('TextField')
    expect(result.current.favoriteElements).toContain('CheckboxField')
    expect(result.current.isFavorite('TextField')).toBe(false)
    expect(result.current.isFavorite('CheckboxField')).toBe(true)
  })

  it('should toggle favorite status correctly', () => {
    const { result } = renderHook(() => useFavoriteElements())
    
    // Add to favorites
    act(() => {
      result.current.toggleFavorite('TextField')
    })
    expect(result.current.isFavorite('TextField')).toBe(true)
    
    // Remove from favorites
    act(() => {
      result.current.toggleFavorite('TextField')
    })
    expect(result.current.isFavorite('TextField')).toBe(false)
  })

  it('should clear all favorites', () => {
    const storedFavorites = {
      favorites: ['TextField', 'CheckboxField', 'DateField'],
      lastUpdated: Date.now()
    }
    localStorageMock.getItem.mockReturnValue(JSON.stringify(storedFavorites))
    
    const { result } = renderHook(() => useFavoriteElements())
    
    act(() => {
      result.current.clearFavorites()
    })
    
    expect(result.current.favoriteElements).toEqual([])
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'form-builder-favorite-elements',
      JSON.stringify({ favorites: [], lastUpdated: expect.any(Number) })
    )
  })

  it('should handle localStorage errors gracefully when saving', () => {
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('Storage quota exceeded')
    })
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    
    const { result } = renderHook(() => useFavoriteElements())
    
    act(() => {
      result.current.toggleFavorite('TextField')
    })
    
    // Should still update state even if localStorage fails
    expect(result.current.favoriteElements).toContain('TextField')
    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to save favorite elements to localStorage:',
      expect.any(Error)
    )
    
    consoleSpy.mockRestore()
  })

  it('should maintain favorites order', () => {
    const { result } = renderHook(() => useFavoriteElements())
    
    act(() => {
      result.current.toggleFavorite('TextField')
      result.current.toggleFavorite('CheckboxField')
      result.current.toggleFavorite('DateField')
    })
    
    expect(result.current.favoriteElements).toEqual(['TextField', 'CheckboxField', 'DateField'])
  })

  it('should not add duplicate favorites', () => {
    const { result } = renderHook(() => useFavoriteElements())
    
    act(() => {
      result.current.toggleFavorite('TextField')
      result.current.toggleFavorite('TextField') // Toggle again
      result.current.toggleFavorite('TextField') // Toggle again
    })
    
    expect(result.current.favoriteElements).toEqual(['TextField'])
  })

  it('should save data with correct structure', () => {
    const { result } = renderHook(() => useFavoriteElements())
    
    act(() => {
      result.current.toggleFavorite('TextField')
    })
    
    const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1])
    expect(savedData).toMatchObject({
      favorites: ['TextField'],
      lastUpdated: expect.any(Number)
    })
    expect(typeof savedData.lastUpdated).toBe('number')
    expect(savedData.lastUpdated).toBeGreaterThan(0)
  })
})

describe('Favorites Performance', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  it('should handle large number of favorites efficiently', () => {
    const { result } = renderHook(() => useFavoriteElements())
    
    const startTime = performance.now()
    
    act(() => {
      // Add 100 favorites
      for (let i = 0; i < 100; i++) {
        result.current.toggleFavorite(`Element${i}`)
      }
    })
    
    const endTime = performance.now()
    
    expect(endTime - startTime).toBeLessThan(100) // Should complete in under 100ms
    expect(result.current.favoriteElements).toHaveLength(100)
  })

  it('should handle rapid toggle operations', () => {
    const { result } = renderHook(() => useFavoriteElements())
    
    const startTime = performance.now()
    
    act(() => {
      // Rapidly toggle the same element
      for (let i = 0; i < 50; i++) {
        result.current.toggleFavorite('TextField')
      }
    })
    
    const endTime = performance.now()
    
    expect(endTime - startTime).toBeLessThan(50) // Should complete quickly
    expect(result.current.favoriteElements).toEqual([]) // Should end up empty (even number of toggles)
  })
})