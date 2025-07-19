import type { FormElementInstance, ElementsType } from "../elements"

// Element category for organizing the palette
export interface ElementCategory {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  elements: ElementsType[]
  color: string
  description?: string
}

// Enhanced element palette props
export interface ElementPaletteProps {
  categories: ElementCategory[]
  searchQuery: string
  onSearch: (query: string) => void
  favoriteElements: string[]
  onToggleFavorite: (elementType: string) => void
  onElementDrag: (elementType: ElementsType) => void
  collapsed?: boolean
  onToggleCollapse?: () => void
}

// Canvas area props with enhanced functionality
export interface CanvasAreaProps {
  elements: FormElementInstance[]
  selectedElement: FormElementInstance | null
  onElementSelect: (element: FormElementInstance) => void
  onElementUpdate: (id: string, element: FormElementInstance) => void
  onElementDelete: (id: string) => void
  onElementDuplicate: (element: FormElementInstance) => void
  showGrid: boolean
  snapToGrid: boolean
  gridSize: number
  zoomLevel: number
  onZoomChange: (zoom: number) => void
  canvasSize: {
    width: number
    height: number
  }
}

// Drop zone indicator for visual feedback
export interface DropZoneIndicator {
  position: 'top' | 'bottom' | 'inside' | 'left' | 'right'
  elementId: string
  isValid: boolean
  insertIndex?: number
}

// Properties panel with enhanced organization
export interface PropertiesPanelProps {
  element: FormElementInstance | null
  onUpdate: (element: FormElementInstance) => void
  onDuplicate: (element: FormElementInstance) => void
  onDelete: (elementId: string) => void
  onClose?: () => void
}

// Property group for organizing properties
export interface PropertyGroup {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  properties: Property[]
  collapsible: boolean
  defaultExpanded?: boolean
}

// Individual property definition
export interface Property {
  id: string
  label: string
  type: 'text' | 'number' | 'boolean' | 'select' | 'color' | 'slider' | 'textarea' | 'file'
  value: any
  options?: Array<{ label: string; value: any }>
  min?: number
  max?: number
  step?: number
  placeholder?: string
  description?: string
  required?: boolean
  validation?: (value: any) => string | null
}

// Toolbar props for quick actions
export interface ToolbarProps {
  selectedElement: FormElementInstance | null
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
  onCopy: () => void
  onPaste: () => void
  onDelete: () => void
  onDuplicate: () => void
  showGrid: boolean
  onToggleGrid: () => void
  snapToGrid: boolean
  onToggleSnap: () => void
  zoomLevel: number
  onZoomChange: (zoom: number) => void
}

// Designer context state
export interface DesignerContextState {
  elements: FormElementInstance[]
  selectedElement: FormElementInstance | null
  // History for undo/redo
  history: FormElementInstance[][]
  historyIndex: number
  // UI state
  showGrid: boolean
  snapToGrid: boolean
  gridSize: number
  zoomLevel: number
  canvasSize: {
    width: number
    height: number
  }
  // Element management
  draggedElement: ElementsType | null
  isDragging: boolean
  dropZoneIndicator: DropZoneIndicator | null
}

// Designer context actions
export interface DesignerContextActions {
  // Element management
  addElement: (index: number, element: FormElementInstance) => void
  removeElement: (id: string) => void
  updateElement: (id: string, element: FormElementInstance) => void
  duplicateElement: (element: FormElementInstance) => void
  selectElement: (element: FormElementInstance | null) => void
  moveElement: (fromIndex: number, toIndex: number) => void
  
  // History management
  undo: () => void
  redo: () => void
  saveToHistory: () => void
  
  // UI state management
  setShowGrid: (show: boolean) => void
  setSnapToGrid: (snap: boolean) => void
  setGridSize: (size: number) => void
  setZoomLevel: (zoom: number) => void
  setCanvasSize: (size: { width: number; height: number }) => void
  
  // Drag and drop
  setDraggedElement: (element: ElementsType | null) => void
  setIsDragging: (dragging: boolean) => void
  setDropZoneIndicator: (indicator: DropZoneIndicator | null) => void
}

// Combined designer context type
export interface DesignerContextType extends DesignerContextState, DesignerContextActions {}

// Element validation result
export interface ValidationResult {
  isValid: boolean
  errors: Array<{
    field: string
    message: string
    severity: 'error' | 'warning'
  }>
}

// Element metrics for performance monitoring
export interface ElementMetrics {
  renderTime: number
  updateCount: number
  lastUpdated: Date
  memoryUsage?: number
}