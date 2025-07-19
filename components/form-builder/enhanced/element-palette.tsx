import { useState, useMemo } from "react"
import { Search, Star, StarOff, Grid3X3, List } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

import { FormElement } from "../elements"
import { ElementCategory, ElementPaletteProps } from "../types/element-palette"
import { searchElements, getCategoryColorClasses } from "../utils/element-categories"
import { useFavoriteElements } from "../hooks/use-favorites"
import DesignerSidebarButtonElements from "../designer/buttons-elements"

interface EnhancedElementPaletteProps {
  categories: ElementCategory[]
  onElementSelect?: (element: FormElement) => void
}

export default function EnhancedElementPalette({ 
  categories, 
  onElementSelect 
}: EnhancedElementPaletteProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const { favoriteElements, toggleFavorite, isFavorite } = useFavoriteElements()

  // Search results
  const searchResults = useMemo(() => {
    return searchElements(categories, searchQuery)
  }, [categories, searchQuery])

  // Favorite elements
  const favoriteElementsList = useMemo(() => {
    return categories.flatMap(category => 
      category.elements.filter(element => 
        favoriteElements.includes(element.type)
      ).map(element => ({ element, category }))
    )
  }, [categories, favoriteElements])

  const handleElementClick = (element: FormElement) => {
    onElementSelect?.(element)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-1">Form Elements</h3>
        <p className="text-xs text-muted-foreground">Drag and drop to add elements</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search elements..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-8"
        />
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className="h-7 w-7 p-0"
          >
            <Grid3X3 className="h-3 w-3" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="h-7 w-7 p-0"
          >
            <List className="h-3 w-3" />
          </Button>
        </div>
        <Badge variant="secondary" className="text-xs">
          {categories.reduce((acc, cat) => acc + cat.elements.length, 0)} elements
        </Badge>
      </div>

      {/* Content */}
      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-8">
          <TabsTrigger value="categories" className="text-xs">Categories</TabsTrigger>
          <TabsTrigger value="favorites" className="text-xs">
            Favorites ({favoriteElementsList.length})
          </TabsTrigger>
          <TabsTrigger value="search" className="text-xs">
            Search ({searchResults.length})
          </TabsTrigger>
        </TabsList>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4 mt-4">
          {categories.map((category) => (
            <CategorySection
              key={category.id}
              category={category}
              viewMode={viewMode}
              favoriteElements={favoriteElements}
              onToggleFavorite={toggleFavorite}
              onElementClick={handleElementClick}
            />
          ))}
        </TabsContent>

        {/* Favorites Tab */}
        <TabsContent value="favorites" className="mt-4">
          {favoriteElementsList.length > 0 ? (
            <div className={cn(
              viewMode === "grid" 
                ? "grid grid-cols-2 gap-2" 
                : "space-y-2"
            )}>
              {favoriteElementsList.map(({ element, category }) => (
                <ElementItem
                  key={element.type}
                  element={element}
                  category={category}
                  viewMode={viewMode}
                  isFavorite={true}
                  onToggleFavorite={toggleFavorite}
                  onElementClick={handleElementClick}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No favorite elements yet</p>
              <p className="text-xs">Click the star icon to add favorites</p>
            </div>
          )}
        </TabsContent>

        {/* Search Tab */}
        <TabsContent value="search" className="mt-4">
          {searchQuery.trim() ? (
            searchResults.length > 0 ? (
              <div className={cn(
                viewMode === "grid" 
                  ? "grid grid-cols-2 gap-2" 
                  : "space-y-2"
              )}>
                {searchResults.map(({ element, category }) => (
                  <ElementItem
                    key={element.type}
                    element={element}
                    category={category}
                    viewMode={viewMode}
                    isFavorite={isFavorite(element.type)}
                    onToggleFavorite={toggleFavorite}
                    onElementClick={handleElementClick}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No elements found</p>
                <p className="text-xs">Try a different search term</p>
              </div>
            )
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Enter a search term</p>
              <p className="text-xs">Search by element name or category</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Category Section Component
interface CategorySectionProps {
  category: ElementCategory
  viewMode: "grid" | "list"
  favoriteElements: string[]
  onToggleFavorite: (elementType: string) => void
  onElementClick: (element: FormElement) => void
}

function CategorySection({
  category,
  viewMode,
  favoriteElements,
  onToggleFavorite,
  onElementClick
}: CategorySectionProps) {
  const colorClasses = getCategoryColorClasses(category.color)
  const Icon = category.icon

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className={cn("w-2 h-2 rounded-full", colorClasses.indicator)} />
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h4 className="text-sm font-medium text-foreground">{category.name}</h4>
        <Badge variant="outline" className="text-xs">
          {category.elements.length}
        </Badge>
      </div>
      
      <div className={cn(
        viewMode === "grid" 
          ? "grid grid-cols-2 gap-2" 
          : "space-y-2"
      )}>
        {category.elements.map((element) => (
          <ElementItem
            key={element.type}
            element={element}
            category={category}
            viewMode={viewMode}
            isFavorite={favoriteElements.includes(element.type)}
            onToggleFavorite={onToggleFavorite}
            onElementClick={onElementClick}
          />
        ))}
      </div>
    </div>
  )
}

// Element Item Component
interface ElementItemProps {
  element: FormElement
  category: ElementCategory
  viewMode: "grid" | "list"
  isFavorite: boolean
  onToggleFavorite: (elementType: string) => void
  onElementClick: (element: FormElement) => void
}

function ElementItem({
  element,
  category,
  viewMode,
  isFavorite,
  onToggleFavorite,
  onElementClick
}: ElementItemProps) {
  const colorClasses = getCategoryColorClasses(category.color)

  if (viewMode === "list") {
    return (
      <div className={cn(
        "flex items-center gap-3 p-2 rounded-md border transition-colors",
        colorClasses.hover,
        colorClasses.border
      )}>
        <div className="flex-1">
          <DesignerSidebarButtonElements formElement={element} />
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite(element.type)
          }}
          className="h-6 w-6 p-0"
        >
          {isFavorite ? (
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          ) : (
            <StarOff className="h-3 w-3 text-muted-foreground" />
          )}
        </Button>
      </div>
    )
  }

  return (
    <div className="relative group">
      <DesignerSidebarButtonElements formElement={element} />
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation()
          onToggleFavorite(element.type)
        }}
        className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm"
      >
        {isFavorite ? (
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
        ) : (
          <StarOff className="h-3 w-3 text-muted-foreground" />
        )}
      </Button>
    </div>
  )
}