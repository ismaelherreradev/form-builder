import type { FormElementInstance } from "../elements"
import {
  getDefaultStyling,
  getDefaultAnimation,
  getDefaultResponsiveSettings,
  getDefaultPosition,
  validateFormElement,
  validateFormElements,
} from "../schemas/element-validation"

// Legacy FormElementInstance type (before enhancement)
interface LegacyFormElementInstance {
  id: string
  type: string
  extraAttributes?: Record<string, any>
}

// Migration version tracking
export const CURRENT_MIGRATION_VERSION = 1
export const MIGRATION_VERSION_KEY = '__migrationVersion'

// Migration result interface
export interface MigrationResult {
  success: boolean
  migratedElements: FormElementInstance[]
  errors: Array<{
    elementId: string
    error: string
  }>
  warnings: Array<{
    elementId: string
    warning: string
  }>
  version: number
}

// Check if data needs migration
export const needsMigration = (data: any): boolean => {
  if (!data || !Array.isArray(data)) return false
  
  // Check if migration version exists
  const hasVersionInfo = data.some(item => 
    item && typeof item === 'object' && MIGRATION_VERSION_KEY in item
  )
  
  if (!hasVersionInfo) return true
  
  // Check if version is current
  const versionInfo = data.find(item => 
    item && typeof item === 'object' && MIGRATION_VERSION_KEY in item
  )
  
  return !versionInfo || versionInfo[MIGRATION_VERSION_KEY] < CURRENT_MIGRATION_VERSION
}

// Migrate a single legacy element to enhanced format
export const migrateLegacyElement = (
  legacyElement: LegacyFormElementInstance
): { element: FormElementInstance; warnings: string[] } => {
  const warnings: string[] = []
  
  // Validate legacy element structure
  if (!legacyElement.id || !legacyElement.type) {
    throw new Error('Invalid legacy element: missing id or type')
  }
  
  // Create enhanced element with defaults
  const enhancedElement: FormElementInstance = {
    id: legacyElement.id,
    type: legacyElement.type as any, // Type assertion needed for legacy compatibility
    extraAttributes: legacyElement.extraAttributes || {},
    
    // Add new enhanced properties with defaults
    position: getDefaultPosition(),
    styling: getDefaultStyling(),
    animation: getDefaultAnimation(),
    responsive: {
      desktop: getDefaultResponsiveSettings(),
      tablet: getDefaultResponsiveSettings(),
      mobile: getDefaultResponsiveSettings(),
    },
    conditionalLogic: [],
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  }
  
  // Migrate specific element type attributes if needed
  try {
    migrateElementTypeSpecificAttributes(enhancedElement, legacyElement, warnings)
  } catch (error) {
    warnings.push(`Failed to migrate type-specific attributes: ${error}`)
  }
  
  return { element: enhancedElement, warnings }
}

// Migrate element type specific attributes
const migrateElementTypeSpecificAttributes = (
  enhanced: FormElementInstance,
  legacy: LegacyFormElementInstance,
  warnings: string[]
): void => {
  const { extraAttributes = {} } = legacy
  
  // Migrate common styling attributes that might exist in extraAttributes
  if (extraAttributes.backgroundColor) {
    enhanced.styling!.backgroundColor = extraAttributes.backgroundColor
    warnings.push('Migrated backgroundColor from extraAttributes to styling')
  }
  
  if (extraAttributes.textColor) {
    enhanced.styling!.textColor = extraAttributes.textColor
    warnings.push('Migrated textColor from extraAttributes to styling')
  }
  
  if (extraAttributes.fontSize && typeof extraAttributes.fontSize === 'number') {
    enhanced.styling!.fontSize = extraAttributes.fontSize
    warnings.push('Migrated fontSize from extraAttributes to styling')
  }
  
  if (extraAttributes.fontWeight) {
    const validWeights = ['normal', 'medium', 'semibold', 'bold']
    if (validWeights.includes(extraAttributes.fontWeight)) {
      enhanced.styling!.fontWeight = extraAttributes.fontWeight
      warnings.push('Migrated fontWeight from extraAttributes to styling')
    }
  }
  
  // Migrate responsive settings if they exist
  if (extraAttributes.responsive) {
    try {
      const responsiveData = extraAttributes.responsive
      if (responsiveData.desktop) {
        enhanced.responsive!.desktop = { ...enhanced.responsive!.desktop, ...responsiveData.desktop }
      }
      if (responsiveData.tablet) {
        enhanced.responsive!.tablet = { ...enhanced.responsive!.tablet, ...responsiveData.tablet }
      }
      if (responsiveData.mobile) {
        enhanced.responsive!.mobile = { ...enhanced.responsive!.mobile, ...responsiveData.mobile }
      }
      warnings.push('Migrated responsive settings from extraAttributes')
    } catch (error) {
      warnings.push('Failed to migrate responsive settings, using defaults')
    }
  }
  
  // Clean up migrated attributes from extraAttributes
  const cleanedAttributes = { ...extraAttributes }
  delete cleanedAttributes.backgroundColor
  delete cleanedAttributes.textColor
  delete cleanedAttributes.fontSize
  delete cleanedAttributes.fontWeight
  delete cleanedAttributes.responsive
  
  enhanced.extraAttributes = cleanedAttributes
}

// Migrate array of legacy elements
export const migrateFormElements = (
  legacyData: any[]
): MigrationResult => {
  const result: MigrationResult = {
    success: true,
    migratedElements: [],
    errors: [],
    warnings: [],
    version: CURRENT_MIGRATION_VERSION,
  }
  
  // Filter out version info if present
  const elementsToMigrate = legacyData.filter(item => 
    !(item && typeof item === 'object' && MIGRATION_VERSION_KEY in item)
  )
  
  for (const legacyElement of elementsToMigrate) {
    try {
      const { element, warnings } = migrateLegacyElement(legacyElement)
      
      // Validate migrated element
      const validation = validateFormElement(element)
      if (!validation.isValid) {
        result.errors.push({
          elementId: element.id,
          error: `Validation failed: ${validation.errors.map(e => e.message).join(', ')}`,
        })
        result.success = false
        continue
      }
      
      result.migratedElements.push(element)
      
      // Add warnings for this element
      warnings.forEach(warning => {
        result.warnings.push({
          elementId: element.id,
          warning,
        })
      })
      
    } catch (error) {
      result.errors.push({
        elementId: legacyElement?.id || 'unknown',
        error: `Migration failed: ${error}`,
      })
      result.success = false
    }
  }
  
  return result
}

// Create version info object
export const createVersionInfo = () => ({
  [MIGRATION_VERSION_KEY]: CURRENT_MIGRATION_VERSION,
  migratedAt: new Date().toISOString(),
})

// Add version info to migrated data
export const addVersionInfo = (elements: FormElementInstance[]): any[] => {
  return [...elements, createVersionInfo()]
}

// Remove version info from data for processing
export const removeVersionInfo = (data: any[]): FormElementInstance[] => {
  return data.filter(item => 
    !(item && typeof item === 'object' && MIGRATION_VERSION_KEY in item)
  ) as FormElementInstance[]
}

// Migrate form content from database
export const migrateFormContent = (contentString: string): {
  success: boolean
  content: string
  errors: string[]
  warnings: string[]
} => {
  try {
    const parsedContent = JSON.parse(contentString)
    
    if (!Array.isArray(parsedContent)) {
      return {
        success: false,
        content: contentString,
        errors: ['Content is not an array'],
        warnings: [],
      }
    }
    
    if (!needsMigration(parsedContent)) {
      return {
        success: true,
        content: contentString,
        errors: [],
        warnings: ['No migration needed'],
      }
    }
    
    const migrationResult = migrateFormElements(parsedContent)
    
    if (!migrationResult.success) {
      return {
        success: false,
        content: contentString,
        errors: migrationResult.errors.map(e => `${e.elementId}: ${e.error}`),
        warnings: migrationResult.warnings.map(w => `${w.elementId}: ${w.warning}`),
      }
    }
    
    // Add version info and serialize
    const migratedWithVersion = addVersionInfo(migrationResult.migratedElements)
    const newContentString = JSON.stringify(migratedWithVersion)
    
    return {
      success: true,
      content: newContentString,
      errors: [],
      warnings: migrationResult.warnings.map(w => `${w.elementId}: ${w.warning}`),
    }
    
  } catch (error) {
    return {
      success: false,
      content: contentString,
      errors: [`JSON parsing failed: ${error}`],
      warnings: [],
    }
  }
}

// Utility to safely parse form content with migration
export const parseFormContent = (contentString: string): FormElementInstance[] => {
  try {
    const parsedContent = JSON.parse(contentString)
    
    if (!Array.isArray(parsedContent)) {
      console.warn('Form content is not an array, returning empty array')
      return []
    }
    
    // Remove version info for processing
    const elements = removeVersionInfo(parsedContent)
    
    // Check if migration is needed
    if (needsMigration(parsedContent)) {
      console.warn('Form content needs migration, applying automatic migration')
      const migrationResult = migrateFormElements(parsedContent)
      
      if (migrationResult.success) {
        return migrationResult.migratedElements
      } else {
        console.error('Migration failed:', migrationResult.errors)
        return []
      }
    }
    
    // Validate current format
    const validation = validateFormElements(elements)
    if (!validation.isValid) {
      console.error('Form content validation failed:', validation.errors)
      return []
    }
    
    return elements
    
  } catch (error) {
    console.error('Failed to parse form content:', error)
    return []
  }
}

// Utility to serialize form content with version info
export const serializeFormContent = (elements: FormElementInstance[]): string => {
  try {
    // Validate elements before serialization
    const validation = validateFormElements(elements)
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`)
    }
    
    // Add version info and serialize
    const elementsWithVersion = addVersionInfo(elements)
    return JSON.stringify(elementsWithVersion)
    
  } catch (error) {
    console.error('Failed to serialize form content:', error)
    throw error
  }
}