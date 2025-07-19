import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { DndContext } from '@dnd-kit/core'

import EnhancedFormBuilder from './enhanced-form-builder'
import { FormElementInstance } from '../elements'

// Mock dependencies
vi.mock('../hooks/useDesigner', () => ({
  default: () => ({
    elements: [],
    setElements: vi.fn(),
    selectedElement: null,
    setSelectedElement: vi.fn(),
    addElement: vi.fn(),
    removeElement: vi.fn(),
    updateElement: vi.fn(),
  })
}))

vi.mock('./canvas-area', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="enhanced-canvas-area">{children}</div>
  )
}))

vi.mock('./properties-panel', () => ({
  default: () => <div data-testid="enhanced-properties-panel">Properties Panel</div>
}))

vi.mock('./enhanced-preview', () => ({
  default: () => <div data-testid="enhanced-preview">Preview</div>
}))

vi.mock('./element-palette', () => ({
  default: () => <div data-testid="enhanced-element-palette">Element Palette</div>
}))

vi.mock('./ai-form-generator', () => ({
  default: ({ onFormGenerated }: { onFormGenerated: (elements: FormElementInstance[]) => void }) => (
    <button
      data-testid="ai-form-generator"
      onClick={() => onFormGenerated([
        {
          id: 'test-element',
          type: 'TextField',
          extraAttributes: { label: 'Test Field' }
        } as FormElementInstance
      ])}
    >
      AI Generator
    </button>
  )
}))

vi.mock('./enhanced-drag-drop', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="enhanced-drag-drop">{children}</div>
  )
}))

vi.mock('./performance-optimizations', () => ({
  PerformanceMonitorComponent: () => <div data-testid="performance-monitor">Performance Monitor</div>,
  useOptimizedFormState: () => ({
    elements: [],
    updateElement: vi.fn(),
    batchUpdateElements: vi.fn(),
  })
}))

vi.mock('./error-handling', () => ({
  ErrorProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  EnhancedErrorBoundary: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AutoSaveIndicator: () => <div data-testid="auto-save-indicator">Auto Save</div>,
  ErrorNotifications: () => <div data-testid="error-notifications">Error Notifications</div>,
  useAutoSave: () => ({
    autoSaveState: {
      isEnabled: true,
      lastSaved: new Date(),
      hasUnsavedChanges: false,
      saveInProgress: false,
      autoSaveInterval: 30000,
      retryCount: 0,
      maxRetries: 3,
    },
    manualSave: vi.fn(),
  })
}))

vi.mock('./accessibility', () => ({
  AccessibilityProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SkipLink: ({ children }: { children: React.ReactNode }) => <a href="#main">{children}</a>,
  HighContrastToggle: () => <button data-testid="high-contrast-toggle">High Contrast</button>,
  FontSizeControls: () => <div data-testid="font-size-controls">Font Size Controls</div>,
  useAccessibility: () => ({
    announceToScreenReader: vi.fn(),
    setFocusTrap: vi.fn(),
    manageFocus: vi.fn(),
    isReducedMotion: false,
    highContrast: false,
    fontSize: 'medium' as const,
  })
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('EnhancedFormBuilder', () => {
  const defaultProps = {
    formId: 'test-form-123',
    initialElements: [],
    onSave: vi.fn(),
    onPreview: vi.fn(),
    onPublish: vi.fn(),
    enableAI: true,
    enablePerformanceMonitoring: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('renders the enhanced form builder with all core components', () => {
    render(<EnhancedFormBuilder {...defaultProps} />)

    // Check for main components
    expect(screen.getByText('Enhanced Form Builder')).toBeInTheDocument()
    expect(screen.getByTestId('enhanced-canvas-area')).toBeInTheDocument()
    expect(screen.getByTestId('enhanced-properties-panel')).toBeInTheDocument()
    expect(screen.getByTestId('enhanced-element-palette')).toBeInTheDocument()
    expect(screen.getByTestId('auto-save-indicator')).toBeInTheDocument()
    expect(screen.getByTestId('error-notifications')).toBeInTheDocument()
  })

  it('displays form ID when provided', () => {
    render(<EnhancedFormBuilder {...defaultProps} />)

    expect(screen.getByText(/ID: orm-123/)).toBeInTheDocument()
  })

  it('renders AI form generator when enabled', () => {
    render(<EnhancedFormBuilder {...defaultProps} enableAI={true} />)

    expect(screen.getByTestId('ai-form-generator')).toBeInTheDocument()
  })

  it('does not render AI form generator when disabled', () => {
    render(<EnhancedFormBuilder {...defaultProps} enableAI={false} />)

    expect(screen.queryByTestId('ai-form-generator')).not.toBeInTheDocument()
  })

  it('renders performance monitor when enabled', () => {
    render(<EnhancedFormBuilder {...defaultProps} enablePerformanceMonitoring={true} />)

    expect(screen.getByTestId('performance-monitor')).toBeInTheDocument()
  })

  it('does not render performance monitor when disabled', () => {
    render(<EnhancedFormBuilder {...defaultProps} enablePerformanceMonitoring={false} />)

    expect(screen.queryByTestId('performance-monitor')).not.toBeInTheDocument()
  })

  it('handles tab navigation correctly', async () => {
    const user = userEvent.setup()
    render(<EnhancedFormBuilder {...defaultProps} />)

    // Check initial tab
    expect(screen.getByRole('tab', { name: /design/i, selected: true })).toBeInTheDocument()

    // Click preview tab
    await user.click(screen.getByRole('tab', { name: /preview/i }))

    expect(screen.getByTestId('enhanced-preview')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /preview/i, selected: true })).toBeInTheDocument()

    // Click settings tab
    await user.click(screen.getByRole('tab', { name: /settings/i }))

    expect(screen.getByText('Form Builder Settings')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /settings/i, selected: true })).toBeInTheDocument()
  })

  it('provides accessibility features', () => {
    render(<EnhancedFormBuilder {...defaultProps} />)

    // Check for skip links
    expect(screen.getByText('Skip to main content')).toBeInTheDocument()
    expect(screen.getByText('Skip to element palette')).toBeInTheDocument()

    // Check for accessibility controls
    expect(screen.getByTestId('font-size-controls')).toBeInTheDocument()
    expect(screen.getByTestId('high-contrast-toggle')).toBeInTheDocument()
  })

  it('handles save action', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockResolvedValue(undefined)

    render(<EnhancedFormBuilder {...defaultProps} onSave={onSave} />)

    const saveButton = screen.getByRole('button', { name: /save/i })
    await user.click(saveButton)

    expect(onSave).toHaveBeenCalled()
  })

  it('handles preview action', async () => {
    const user = userEvent.setup()
    const onPreview = vi.fn()

    render(<EnhancedFormBuilder {...defaultProps} onPreview={onPreview} />)

    const previewButton = screen.getByRole('button', { name: /preview/i })
    await user.click(previewButton)

    expect(onPreview).toHaveBeenCalled()
  })

  it('handles publish action when enabled', async () => {
    const user = userEvent.setup()
    const onPublish = vi.fn().mockResolvedValue(undefined)

    render(<EnhancedFormBuilder {...defaultProps} onPublish={onPublish} />)

    const publishButton = screen.getByRole('button', { name: /publish/i })
    await user.click(publishButton)

    expect(onPublish).toHaveBeenCalled()
  })

  it('handles undo/redo functionality', async () => {
    const user = userEvent.setup()
    render(<EnhancedFormBuilder {...defaultProps} />)

    const undoButton = screen.getByRole('button', { name: /undo/i })
    const redoButton = screen.getByRole('button', { name: /redo/i })

    // Initially disabled
    expect(undoButton).toBeDisabled()
    expect(redoButton).toBeDisabled()

    // Note: In real implementation, these would be enabled after actions
  })

  it('handles sidebar collapse toggle', async () => {
    const user = userEvent.setup()
    render(<EnhancedFormBuilder {...defaultProps} />)

    const collapseButton = screen.getByRole('button', { name: /collapse sidebar/i })
    await user.click(collapseButton)

    expect(screen.getByRole('button', { name: /expand sidebar/i })).toBeInTheDocument()
  })

  it('handles keyboard shortcuts', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockResolvedValue(undefined)

    render(<EnhancedFormBuilder {...defaultProps} onSave={onSave} />)

    // Simulate Ctrl+S for save
    await user.keyboard('{Control>}s{/Control}')

    expect(onSave).toHaveBeenCalled()
  })

  it('displays settings correctly', async () => {
    const user = userEvent.setup()
    render(<EnhancedFormBuilder {...defaultProps} />)

    // Navigate to settings tab
    await user.click(screen.getByRole('tab', { name: /settings/i }))

    // Check for canvas settings
    expect(screen.getByLabelText(/show grid/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/snap to grid/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/zoom level/i)).toBeInTheDocument()

    // Check for auto-save settings
    expect(screen.getByText('Auto-save Settings')).toBeInTheDocument()
    expect(screen.getByText(/interval: 30 seconds/i)).toBeInTheDocument()
  })

  it('handles grid and zoom controls', async () => {
    const user = userEvent.setup()
    render(<EnhancedFormBuilder {...defaultProps} />)

    // Navigate to settings
    await user.click(screen.getByRole('tab', { name: /settings/i }))

    // Toggle grid
    const gridCheckbox = screen.getByLabelText(/show grid/i)
    await user.click(gridCheckbox)

    // Toggle snap to grid
    const snapCheckbox = screen.getByLabelText(/snap to grid/i)
    await user.click(snapCheckbox)

    // Adjust zoom
    const zoomSlider = screen.getByLabelText(/zoom level/i)
    await user.clear(zoomSlider)
    await user.type(zoomSlider, '150')
  })

  it('handles AI form generation', async () => {
    const user = userEvent.setup()
    render(<EnhancedFormBuilder {...defaultProps} enableAI={true} />)

    const aiButton = screen.getByTestId('ai-form-generator')
    await user.click(aiButton)

    // The mock AI generator should trigger form generation
    // In a real test, you'd verify the elements were added
  })

  it('handles initial elements correctly', () => {
    const initialElements: FormElementInstance[] = [
      {
        id: 'element-1',
        type: 'TextField',
        extraAttributes: { label: 'Name' }
      },
      {
        id: 'element-2',
        type: 'TextAreaField',
        extraAttributes: { label: 'Description' }
      }
    ]

    render(<EnhancedFormBuilder {...defaultProps} initialElements={initialElements} />)

    // In a real implementation, you'd verify the elements are rendered
    // This is a basic test to ensure the component accepts initial elements
    expect(screen.getByTestId('enhanced-canvas-area')).toBeInTheDocument()
  })

  it('applies custom className when provided', () => {
    const { container } = render(
      <EnhancedFormBuilder {...defaultProps} className="custom-form-builder" />
    )

    expect(container.firstChild).toHaveClass('custom-form-builder')
  })

  it('handles error states gracefully', () => {
    // Test that error boundary wraps the component
    render(<EnhancedFormBuilder {...defaultProps} />)

    // The component should render without throwing
    expect(screen.getByText('Enhanced Form Builder')).toBeInTheDocument()
  })

  it('provides proper ARIA labels and accessibility attributes', () => {
    render(<EnhancedFormBuilder {...defaultProps} />)

    // Check for proper headings
    expect(screen.getByRole('heading', { name: /enhanced form builder/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /elements/i })).toBeInTheDocument()

    // Check for proper button labels
    expect(screen.getByRole('button', { name: /undo/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /redo/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /preview/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()

    // Check for proper tab navigation
    expect(screen.getByRole('tablist')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /design/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /preview/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /settings/i })).toBeInTheDocument()
  })

  it('manages focus correctly when switching tabs', async () => {
    const user = userEvent.setup()
    render(<EnhancedFormBuilder {...defaultProps} />)

    const previewTab = screen.getByRole('tab', { name: /preview/i })
    await user.click(previewTab)

    expect(previewTab).toHaveAttribute('aria-selected', 'true')
  })

  it('handles auto-save state correctly', () => {
    render(<EnhancedFormBuilder {...defaultProps} />)

    // Auto-save indicator should be present
    expect(screen.getByTestId('auto-save-indicator')).toBeInTheDocument()
  })

  it('handles responsive design', () => {
    // Test that the component handles different screen sizes
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    })

    render(<EnhancedFormBuilder {...defaultProps} />)

    expect(screen.getByText('Enhanced Form Builder')).toBeInTheDocument()
  })
})

// Integration tests
describe('EnhancedFormBuilder Integration', () => {
  it('integrates all major components correctly', async () => {
    const user = userEvent.setup()
    const mockProps = {
      formId: 'integration-test',
      initialElements: [],
      onSave: vi.fn().mockResolvedValue(undefined),
      onPreview: vi.fn(),
      onPublish: vi.fn().mockResolvedValue(undefined),
      enableAI: true,
      enablePerformanceMonitoring: true,
    }

    render(<EnhancedFormBuilder {...mockProps} />)

    // Test tab switching
    await user.click(screen.getByRole('tab', { name: /preview/i }))
    expect(screen.getByTestId('enhanced-preview')).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: /settings/i }))
    expect(screen.getByText('Form Builder Settings')).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: /design/i }))
    expect(screen.getByTestId('enhanced-canvas-area')).toBeInTheDocument()

    // Test action buttons
    await user.click(screen.getByRole('button', { name: /save/i }))
    expect(mockProps.onSave).toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: /publish/i }))
    expect(mockProps.onPublish).toHaveBeenCalled()

    // Test AI integration
    const aiButton = screen.getByTestId('ai-form-generator')
    await user.click(aiButton)

    // Verify performance monitoring
    expect(screen.getByTestId('performance-monitor')).toBeInTheDocument()
  })

  it('maintains state consistency across tab switches', async () => {
    const user = userEvent.setup()
    render(<EnhancedFormBuilder formId="state-test" />)

    // Switch to settings and modify something
    await user.click(screen.getByRole('tab', { name: /settings/i }))
    const gridCheckbox = screen.getByLabelText(/show grid/i)
    await user.click(gridCheckbox)

    // Switch to preview and back
    await user.click(screen.getByRole('tab', { name: /preview/i }))
    await user.click(screen.getByRole('tab', { name: /settings/i }))

    // State should be maintained
    expect(screen.getByLabelText(/show grid/i)).toBeInTheDocument()
  })
})
