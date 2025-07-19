"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { DndContext, DragOverlay, useDndMonitor } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  Settings,
  Wand2,
  Eye,
  Save,
  Undo,
  Redo,
  Grid,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import { FormElementInstance } from "../elements";
import { createElementCategories } from "../utils/element-categories";
import useDesigner from "../hooks/useDesigner";

// Enhanced components
import EnhancedCanvasArea from "./canvas-area";
import EnhancedPropertiesPanel from "./properties-panel";
import EnhancedPreview from "./enhanced-preview";
import EnhancedElementPalette from "./element-palette";
import AIFormWizard from "./ai-form-wizard";
import EnhancedDragDrop from "./enhanced-drag-drop";
import {
  PerformanceMonitorComponent,
  useOptimizedFormState,
} from "./performance-optimizations";
import {
  ErrorProvider,
  EnhancedErrorBoundary,
  AutoSaveIndicator,
  useAutoSave,
  ErrorNotifications,
} from "./error-handling";
import {
  AccessibilityProvider,
  SkipLink,
  HighContrastToggle,
  FontSizeControls,
  useAccessibility,
} from "./accessibility";

interface EnhancedFormBuilderProps {
  formId?: string;
  initialElements?: FormElementInstance[];
  onSave?: (elements: FormElementInstance[]) => Promise<void>;
  onPreview?: (elements: FormElementInstance[]) => void;
  onPublish?: (elements: FormElementInstance[]) => void;
  enableAI?: boolean;
  enablePerformanceMonitoring?: boolean;
  className?: string;
}

export default function EnhancedFormBuilder({
  formId,
  initialElements = [],
  onSave,
  onPreview,
  onPublish,
  enableAI = true,
  enablePerformanceMonitoring = false,
  className,
}: EnhancedFormBuilderProps) {
  return (
    <AccessibilityProvider>
      <ErrorProvider>
        <EnhancedErrorBoundary enableRecovery>
          <EnhancedFormBuilderContent
            formId={formId}
            initialElements={initialElements}
            onSave={onSave}
            onPreview={onPreview}
            onPublish={onPublish}
            enableAI={enableAI}
            enablePerformanceMonitoring={enablePerformanceMonitoring}
            className={className}
          />
        </EnhancedErrorBoundary>
      </ErrorProvider>
    </AccessibilityProvider>
  );
}

function EnhancedFormBuilderContent({
  formId,
  initialElements,
  onSave,
  onPreview,
  onPublish,
  enableAI,
  enablePerformanceMonitoring,
  className,
}: EnhancedFormBuilderProps) {
  const { elements, setElements, selectedElement, setSelectedElement } =
    useDesigner();
  const { announceToScreenReader } = useAccessibility();

  // Enhanced state management
  const {
    elements: optimizedElements,
    updateElement,
    batchUpdateElements,
  } = useOptimizedFormState(initialElements || []);

  // UI State
  const [activeTab, setActiveTab] = useState<"design" | "preview" | "settings">(
    "design",
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [propertiesPanelOpen, setPropertiesPanelOpen] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [undoStack, setUndoStack] = useState<FormElementInstance[][]>([]);
  const [redoStack, setRedoStack] = useState<FormElementInstance[][]>([]);
  const [aiDesigning, setAiDesigning] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);
  const [aiStatus, setAiStatus] = useState<string>("");

  // Auto-save functionality
  const { autoSaveState, manualSave } = useAutoSave(
    elements,
    async (data) => {
      if (onSave) {
        await onSave(data);
      }
    },
    {
      interval: 30000, // 30 seconds
      enabled: true,
    },
  );

  // Element categories for palette
  const elementCategories = useMemo(() => createElementCategories(), []);

  // Initialize elements
  useEffect(() => {
    if (initialElements && initialElements.length > 0) {
      setElements(initialElements);
    }
  }, [initialElements, setElements]);

  // Undo/Redo functionality
  const saveToHistory = useCallback(() => {
    setUndoStack((prev) => [...prev, elements]);
    setRedoStack([]); // Clear redo stack when new action is performed
  }, [elements]);

  const handleUndo = useCallback(() => {
    if (undoStack.length > 0) {
      const previousState = undoStack[undoStack.length - 1];
      setRedoStack((prev) => [...prev, elements]);
      setUndoStack((prev) => prev.slice(0, -1));
      setElements(previousState);
      announceToScreenReader("Undid last action");
    }
  }, [undoStack, elements, setElements, announceToScreenReader]);

  const handleRedo = useCallback(() => {
    if (redoStack.length > 0) {
      const nextState = redoStack[redoStack.length - 1];
      setUndoStack((prev) => [...prev, elements]);
      setRedoStack((prev) => prev.slice(0, -1));
      setElements(nextState);
      announceToScreenReader("Redid action");
    }
  }, [redoStack, elements, setElements, announceToScreenReader]);

  // Handle element reordering
  const handleElementsReorder = useCallback(
    (newElements: FormElementInstance[]) => {
      saveToHistory();
      setElements(newElements);
      announceToScreenReader(
        `Elements reordered. ${newElements.length} elements in form.`,
      );
    },
    [setElements, saveToHistory, announceToScreenReader],
  );

  // Handle AI form generation with real-time updates
  const handleAIFormGenerated = useCallback(
    (elements: FormElementInstance[]) => {
      saveToHistory();
      setElements(elements);
      setAiDesigning(false);
      setAiProgress(0);
      setAiStatus("");
      announceToScreenReader(
        `AI generated form with ${elements.length} elements`,
      );
    },
    [setElements, saveToHistory, announceToScreenReader],
  );

  // Handle AI generation start
  const handleAIGenerationStart = useCallback(() => {
    setAiDesigning(true);
    setAiProgress(0);
    setAiStatus("Starting AI form generation...");
  }, []);

  // Handle AI generation progress
  const handleAIGenerationProgress = useCallback(
    (progress: number, status: string) => {
      setAiProgress(progress);
      setAiStatus(status);
    },
    [],
  );

  // Handle preview
  const handlePreview = useCallback(() => {
    setActiveTab("preview");
    onPreview?.(elements);
    announceToScreenReader("Switched to preview mode");
  }, [elements, onPreview, announceToScreenReader]);

  // Handle save
  const handleSave = useCallback(async () => {
    try {
      await manualSave();
      announceToScreenReader("Form saved successfully");
    } catch (error) {
      announceToScreenReader("Failed to save form");
    }
  }, [manualSave, announceToScreenReader]);

  // Handle publish
  const handlePublish = useCallback(async () => {
    try {
      await onPublish?.(elements);
      announceToScreenReader("Form published successfully");
    } catch (error) {
      announceToScreenReader("Failed to publish form");
    }
  }, [elements, onPublish, announceToScreenReader]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "s":
            e.preventDefault();
            handleSave();
            break;
          case "z":
            e.preventDefault();
            if (e.shiftKey) {
              handleRedo();
            } else {
              handleUndo();
            }
            break;
          case "p":
            e.preventDefault();
            handlePreview();
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleSave, handleUndo, handleRedo, handlePreview]);

  return (
    <div className={cn("h-screen flex flex-col bg-background", className)}>
      {/* Skip Links for Accessibility */}
      <SkipLink targetId="main-content">Skip to main content</SkipLink>
      <SkipLink targetId="element-palette">Skip to element palette</SkipLink>

      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Enhanced Form Builder</h1>
            {formId && (
              <Badge variant="outline" className="text-xs">
                ID: {formId.slice(-6)}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Auto-save indicator */}
            <AutoSaveIndicator
              autoSaveState={autoSaveState}
              onManualSave={handleSave}
            />

            <Separator orientation="vertical" className="h-6" />

            {/* Accessibility controls */}
            <FontSizeControls />
            <HighContrastToggle />

            <Separator orientation="vertical" className="h-6" />

            {/* Action buttons */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleUndo}
                    disabled={undoStack.length === 0}
                  >
                    <Undo className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRedo}
                    disabled={redoStack.length === 0}
                  >
                    <Redo className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Redo (Ctrl+Shift+Z)</TooltipContent>
              </Tooltip>

              <Separator orientation="vertical" className="h-6" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={handlePreview}>
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Preview form (Ctrl+P)</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSave}
                    disabled={autoSaveState.saveInProgress}
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Save form (Ctrl+S)</TooltipContent>
              </Tooltip>

              {onPublish && (
                <Button size="sm" onClick={handlePublish} className="gap-1">
                  <Zap className="h-4 w-4" />
                  Publish
                </Button>
              )}
            </TooltipProvider>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <Tabs
          value={activeTab}
          onValueChange={(value: any) => setActiveTab(value)}
          className="flex-1 flex flex-col"
        >
          <TabsList className="w-full justify-start border-b rounded-none h-12 px-4">
            <TabsTrigger value="design" className="gap-2">
              <Settings className="h-4 w-4" />
              Design
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Grid className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Design Tab */}
          <TabsContent
            value="design"
            className="flex-1 flex m-0 data-[state=inactive]:hidden"
          >
            <div className="flex-1 flex">
              {/* Element Palette Sidebar */}
              <aside
                id="element-palette"
                className={cn(
                  "border-r bg-background transition-all duration-200",
                  sidebarCollapsed ? "w-12" : "w-80",
                )}
              >
                <div className="p-4 border-b flex items-center justify-between">
                  <h2
                    className={cn(
                      "font-semibold",
                      sidebarCollapsed && "sr-only",
                    )}
                  >
                    Elements
                  </h2>
                  <div className="flex gap-1">
                    {enableAI && !sidebarCollapsed && (
                      <AIFormWizard onFormGenerated={handleAIFormGenerated} />
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                      aria-label={
                        sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
                      }
                    >
                      {sidebarCollapsed ? "→" : "←"}
                    </Button>
                  </div>
                </div>

                {!sidebarCollapsed && (
                  <ScrollArea className="flex-1">
                    <div className="p-4">
                      <EnhancedElementPalette categories={elementCategories} />
                    </div>
                  </ScrollArea>
                )}
              </aside>

              {/* Canvas Area */}
              <main id="main-content" className="flex-1 flex flex-col">
                <EnhancedDragDrop
                  onElementsReorder={handleElementsReorder}
                  multiSelectEnabled={true}
                  animationsEnabled={true}
                >
                  <div className="relative flex-1">
                    {aiDesigning && (
                      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
                        <Card className="p-6 max-w-md">
                          <div className="text-center space-y-4">
                            <div className="relative">
                              <div className="absolute inset-0 animate-ping rounded-full bg-gradient-to-r from-purple-600 to-blue-600 opacity-20" />
                              <div className="relative p-3 rounded-full bg-gradient-to-r from-purple-600 to-blue-600">
                                <Wand2 className="h-6 w-6 text-white animate-bounce" />
                              </div>
                            </div>
                            <div>
                              <h3 className="font-semibold mb-1">
                                AI is Designing Your Form
                              </h3>
                              <p className="text-sm text-muted-foreground mb-3">
                                {aiStatus}
                              </p>
                              <div className="space-y-2">
                                <div className="w-full bg-secondary rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${aiProgress}%` }}
                                  />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {Math.round(aiProgress)}% complete
                                </p>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </div>
                    )}
                    <EnhancedCanvasArea
                      showGrid={showGrid}
                      snapToGrid={snapToGrid}
                      zoomLevel={zoomLevel}
                      onZoomChange={setZoomLevel}
                      onCanvasClick={() => setSelectedElement(null)}
                      gridSize={20}
                      canvasSize={{ width: 920, height: 800 }}
                    />
                  </div>
                </EnhancedDragDrop>
              </main>

              {/* Properties Panel */}
              {propertiesPanelOpen && (
                <aside className="w-80 border-l">
                  <EnhancedPropertiesPanel
                    onClose={() => setPropertiesPanelOpen(false)}
                  />
                </aside>
              )}
            </div>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent
            value="preview"
            className="flex-1 m-0 data-[state=inactive]:hidden"
          >
            <EnhancedPreview
              formTitle="Form Preview"
              formDescription="This is how your form will appear to users"
              showValidation={true}
              interactiveMode={true}
            />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent
            value="settings"
            className="flex-1 m-0 p-6 data-[state=inactive]:hidden"
          >
            <div className="max-w-2xl space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">
                  Form Builder Settings
                </h2>
                <p className="text-muted-foreground mb-6">
                  Configure your form builder experience and preferences.
                </p>
              </div>

              <div className="grid gap-6">
                {/* Canvas Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Canvas Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="show-grid"
                        className="text-sm font-medium"
                      >
                        Show Grid
                      </label>
                      <input
                        id="show-grid"
                        type="checkbox"
                        checked={showGrid}
                        onChange={(e) => setShowGrid(e.target.checked)}
                        className="rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="snap-to-grid"
                        className="text-sm font-medium"
                      >
                        Snap to Grid
                      </label>
                      <input
                        id="snap-to-grid"
                        type="checkbox"
                        checked={snapToGrid}
                        onChange={(e) => setSnapToGrid(e.target.checked)}
                        className="rounded"
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="zoom-level"
                        className="text-sm font-medium"
                      >
                        Zoom Level: {zoomLevel}%
                      </label>
                      <input
                        id="zoom-level"
                        type="range"
                        min="25"
                        max="200"
                        step="25"
                        value={zoomLevel}
                        onChange={(e) => setZoomLevel(parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Auto-save Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Auto-save Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">
                        Auto-save Enabled
                      </label>
                      <Badge
                        variant={
                          autoSaveState.isEnabled ? "default" : "secondary"
                        }
                      >
                        {autoSaveState.isEnabled ? "On" : "Off"}
                      </Badge>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      Interval: {autoSaveState.autoSaveInterval / 1000} seconds
                    </div>

                    {autoSaveState.lastSaved && (
                      <div className="text-sm text-muted-foreground">
                        Last saved: {autoSaveState.lastSaved.toLocaleString()}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Performance Settings */}
                {enablePerformanceMonitoring && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Monitoring</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Performance monitoring is enabled. Check the
                        bottom-right corner for metrics.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Performance Monitor */}
      {enablePerformanceMonitoring && (
        <PerformanceMonitorComponent enabled={true} />
      )}

      {/* Error Notifications */}
      <ErrorNotifications />
    </div>
  );
}
