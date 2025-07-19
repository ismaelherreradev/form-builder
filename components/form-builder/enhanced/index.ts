// Enhanced form element types and interfaces
export type {
  ElementStyling,
  ElementAnimation,
  ResponsiveSettings,
  ElementPosition,
  ConditionalRule,
  FormElementInstance,
} from "../elements";

// Element palette types and interfaces
export type {
  ElementCategory,
  ElementPaletteProps,
  ElementSearchResult,
  FavoriteElementsStorage,
} from "../types/element-palette";

// Designer component interfaces
export type {
  CanvasAreaProps,
  DropZoneIndicator,
  PropertiesPanelProps,
  PropertyGroup,
  Property,
  ToolbarProps,
  DesignerContextState,
  DesignerContextActions,
  DesignerContextType,
  ValidationResult,
  ElementMetrics,
} from "../types/designer";

// Enhanced components
export { default as EnhancedElementPalette } from "./element-palette";
export {
  default as EnhancedDragPreview,
  EnhancedDragOverlayWrapper,
} from "./drag-preview";

// Validation schemas and types
export {
  ElementStylingSchema,
  ElementAnimationSchema,
  ResponsiveSettingsSchema,
  ElementPositionSchema,
  ConditionalRuleSchema,
  ElementMetadataSchema,
  FormElementInstanceSchema,
  FormElementsArraySchema,
  PropertySchema,
  PropertyGroupSchema,
  ElementCategorySchema,
  ValidationResultSchema,
  validateFormElement,
  validateFormElements,
  getDefaultStyling,
  getDefaultAnimation,
  getDefaultResponsiveSettings,
  getDefaultPosition,
} from "../schemas/element-validation";

export type {
  ElementStylingType,
  ElementAnimationType,
  ResponsiveSettingsType,
  ElementPositionType,
  ConditionalRuleType,
  ElementMetadataType,
  FormElementInstanceType,
  PropertyType,
  PropertyGroupType,
  ElementCategoryType,
  ValidationResultType,
} from "../schemas/element-validation";

// Element helper utilities
export {
  createEnhancedElement,
  updateElementStyling,
  updateElementAnimation,
  updateElementResponsive,
  addConditionalRule,
  removeConditionalRule,
  duplicateElement,
  isElementVisible,
  getElementWidth,
  generateElementStyles,
  generateAnimationStyles,
  evaluateConditionalLogic,
  getElementOrder,
  sortElementsByOrder,
} from "../utils/element-helpers";

// Element categories utilities
export {
  createElementCategories,
  getCategoryColorClasses,
  searchElements,
  getAllElements,
  CategoryIcons,
} from "../utils/element-categories";

// Hooks
export { useFavoriteElements } from "../hooks/use-favorites";

// Migration utilities
export {
  migrateLegacyElement,
  migrateFormElements,
  migrateFormContent,
  needsMigration,
  parseFormContent,
  serializeFormContent,
  CURRENT_MIGRATION_VERSION,
  createVersionInfo,
  addVersionInfo,
  removeVersionInfo,
} from "../utils/migration";

export type { MigrationResult } from "../utils/migration";

// Enhanced Canvas and Design Components
export { default as EnhancedCanvasArea } from "./canvas-area";
export { default as EnhancedPropertiesPanel } from "./properties-panel";
export { default as EnhancedDragDrop } from "./enhanced-drag-drop";
export { default as EnhancedPreview } from "./enhanced-preview";
export { default as EnhancedFormBuilder } from "./enhanced-form-builder";

// AI Components
export { default as AIFormWizard } from "./ai-form-wizard";

// Performance Components
export {
  VirtualizedElementList,
  MemoizedElementWrapper,
  PerformanceMonitorComponent,
  LazyImage,
  withPerformanceTracking,
  PerformanceMonitor,
  useMemoryMonitor,
  useDebouncedValue,
  useThrottledCallback,
  useIntersectionObserver,
  useOptimizedFormState,
  useRenderOptimization,
  getBundleSize,
} from "./performance-optimizations";

// Error Handling Components
export {
  ErrorProvider,
  EnhancedErrorBoundary,
  AutoSaveIndicator,
  ErrorNotifications,
  useErrorHandler,
  useAutoSave,
} from "./error-handling";

export type {
  FormBuilderError,
  RecoveryAction,
  AutoSaveState,
} from "./error-handling";

// Accessibility Components
export {
  AccessibilityProvider,
  SkipLink,
  AccessibleButton,
  AccessibleField,
  HighContrastToggle,
  FontSizeControls,
  LiveRegion,
  ReducedMotionWrapper,
  useAccessibility,
  useKeyboardNavigation,
  useDragDropAnnouncements,
  useFocusManagement,
  checkAccessibility,
} from "./accessibility";

// AI Service Types
export type {
  AIPrompt,
  AIGeneratedForm,
  FieldSuggestion,
  ValidationRule,
  OptimizationSuggestion,
  AIError,
  AIFormTemplate,
  AIFormService,
} from "../../../lib/ai/form-generator";

// Performance Types
export type { DeviceType, Orientation } from "./enhanced-preview";
