"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  DragStartEvent,
  DragEndEvent,
  DragMoveEvent,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from "@dnd-kit/modifiers";
import {
  Copy,
  Trash2,
  Move,
  GripVertical,
  Eye,
  EyeOff,
  Lock,
  Unlock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { FormElementInstance, FormElements } from "../elements";
import useDesigner from "../hooks/useDesigner";

interface DragDropContextProps {
  children: React.ReactNode;
  onElementsReorder?: (elements: FormElementInstance[]) => void;
  multiSelectEnabled?: boolean;
  animationsEnabled?: boolean;
}

interface ElementState {
  id: string;
  isSelected: boolean;
  isVisible: boolean;
  isLocked: boolean;
  isHighlighted: boolean;
}

interface DragPreviewProps {
  element: FormElementInstance;
  isDragging: boolean;
  style?: React.CSSProperties;
}

interface SelectionBoxProps {
  selectedElements: Set<string>;
  onBulkAction: (
    action: "copy" | "delete" | "hide" | "show" | "lock" | "unlock",
    elementIds: string[],
  ) => void;
}

export default function EnhancedDragDrop({
  children,
  onElementsReorder,
  multiSelectEnabled = true,
  animationsEnabled = true,
}: DragDropContextProps) {
  const { elements, removeElement, updateElement } = useDesigner();
  const [selectedElements, setSelectedElements] = useState<Set<string>>(
    new Set(),
  );
  const [draggedElement, setDraggedElement] =
    useState<FormElementInstance | null>(null);
  const [elementStates, setElementStates] = useState<Map<string, ElementState>>(
    new Map(),
  );
  const [isMultiSelecting, setIsMultiSelecting] = useState(false);
  const [dragPreview, setDragPreview] = useState<{
    element: FormElementInstance;
    offset: { x: number; y: number };
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const undoStackRef = useRef<FormElementInstance[][]>([]);
  const redoStackRef = useRef<FormElementInstance[][]>([]);

  // Initialize element states
  useEffect(() => {
    const newStates = new Map<string, ElementState>();
    elements.forEach((element) => {
      if (!elementStates.has(element.id)) {
        newStates.set(element.id, {
          id: element.id,
          isSelected: false,
          isVisible: true,
          isLocked: false,
          isHighlighted: false,
        });
      } else {
        newStates.set(element.id, elementStates.get(element.id)!);
      }
    });
    setElementStates(newStates);
  }, [elements]);

  // Handle element selection
  const handleElementClick = useCallback(
    (elementId: string, event: React.MouseEvent) => {
      event.stopPropagation();

      if (!multiSelectEnabled) {
        setSelectedElements(new Set([elementId]));
        return;
      }

      if (event.ctrlKey || event.metaKey) {
        // Multi-select mode
        setSelectedElements((prev) => {
          const newSet = new Set(prev);
          if (newSet.has(elementId)) {
            newSet.delete(elementId);
          } else {
            newSet.add(elementId);
          }
          return newSet;
        });
      } else if (event.shiftKey && selectedElements.size > 0) {
        // Range select mode
        const elementIds = elements.map((el) => el.id);
        const lastSelected =
          Array.from(selectedElements)[selectedElements.size - 1];
        const lastIndex = elementIds.indexOf(lastSelected);
        const currentIndex = elementIds.indexOf(elementId);

        const start = Math.min(lastIndex, currentIndex);
        const end = Math.max(lastIndex, currentIndex);

        const rangeSelection = new Set(elementIds.slice(start, end + 1));
        setSelectedElements(
          (prev) =>
            new Set([...Array.from(prev), ...Array.from(rangeSelection)]),
        );
      } else {
        // Single select
        setSelectedElements(new Set([elementId]));
      }
    },
    [multiSelectEnabled, selectedElements, elements],
  );

  // Handle canvas click (deselect all)
  const handleCanvasClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      setSelectedElements(new Set());
    }
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (selectedElements.size === 0) return;

      // Ctrl/Cmd + C: Copy
      if ((event.ctrlKey || event.metaKey) && event.key === "c") {
        event.preventDefault();
        handleBulkAction("copy", Array.from(selectedElements));
      }

      // Delete key: Delete selected elements
      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        handleBulkAction("delete", Array.from(selectedElements));
      }

      // Escape: Deselect all
      if (event.key === "Escape") {
        setSelectedElements(new Set());
      }

      // Ctrl/Cmd + A: Select all
      if ((event.ctrlKey || event.metaKey) && event.key === "a") {
        event.preventDefault();
        setSelectedElements(new Set(elements.map((el) => el.id)));
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedElements, elements]);

  // Handle bulk actions
  const handleBulkAction = useCallback(
    (
      action: "copy" | "delete" | "hide" | "show" | "lock" | "unlock",
      elementIds: string[],
    ) => {
      switch (action) {
        case "copy":
          // Implement copy functionality
          console.log("Copying elements:", elementIds);
          break;

        case "delete":
          // Save to undo stack
          undoStackRef.current.push([...elements]);
          redoStackRef.current = [];

          elementIds.forEach((id) => removeElement(id));
          setSelectedElements(new Set());
          break;

        case "hide":
        case "show":
          setElementStates((prev) => {
            const newStates = new Map(prev);
            elementIds.forEach((id) => {
              const state = newStates.get(id);
              if (state) {
                newStates.set(id, { ...state, isVisible: action === "show" });
              }
            });
            return newStates;
          });
          break;

        case "lock":
        case "unlock":
          setElementStates((prev) => {
            const newStates = new Map(prev);
            elementIds.forEach((id) => {
              const state = newStates.get(id);
              if (state) {
                newStates.set(id, { ...state, isLocked: action === "lock" });
              }
            });
            return newStates;
          });
          break;
      }
    },
    [elements, removeElement],
  );

  // Drag handlers
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const elementId = active.id as string;
      const element = elements.find((el) => el.id === elementId);

      if (element) {
        setDraggedElement(element);

        // If dragging a selected element, drag all selected elements
        if (selectedElements.has(elementId) && selectedElements.size > 1) {
          setIsMultiSelecting(true);
        }
      }
    },
    [elements, selectedElements],
  );

  const handleDragMove = useCallback(
    (event: DragMoveEvent) => {
      const { delta } = event;

      if (draggedElement) {
        setDragPreview({
          element: draggedElement,
          offset: { x: delta.x, y: delta.y },
        });
      }
    },
    [draggedElement],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (active && over && active.id !== over.id) {
        const activeIndex = elements.findIndex((el) => el.id === active.id);
        const overIndex = elements.findIndex((el) => el.id === over.id);

        if (activeIndex !== -1 && overIndex !== -1) {
          // Save to undo stack
          undoStackRef.current.push([...elements]);
          redoStackRef.current = [];

          // Reorder elements
          const newElements = [...elements];
          const [movedElement] = newElements.splice(activeIndex, 1);
          newElements.splice(overIndex, 0, movedElement);

          onElementsReorder?.(newElements);
        }
      }

      setDraggedElement(null);
      setDragPreview(null);
      setIsMultiSelecting(false);
    },
    [elements, onElementsReorder],
  );

  // Undo/Redo functionality
  const handleUndo = useCallback(() => {
    const lastState = undoStackRef.current.pop();
    if (lastState) {
      redoStackRef.current.push([...elements]);
      onElementsReorder?.(lastState);
    }
  }, [elements, onElementsReorder]);

  const handleRedo = useCallback(() => {
    const nextState = redoStackRef.current.pop();
    if (nextState) {
      undoStackRef.current.push([...elements]);
      onElementsReorder?.(nextState);
    }
  }, [elements, onElementsReorder]);

  const canUndo = undoStackRef.current.length > 0;
  const canRedo = redoStackRef.current.length > 0;

  const sortableElementIds = useMemo(
    () => elements.map((el) => el.id),
    [elements],
  );

  return (
    <div className="relative w-full h-full" ref={containerRef}>
      <DndContext
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
      >
        {/* Bulk Actions Toolbar */}
        {selectedElements.size > 0 && (
          <SelectionToolbar
            selectedCount={selectedElements.size}
            onBulkAction={handleBulkAction}
            selectedElementIds={Array.from(selectedElements)}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={canUndo}
            canRedo={canRedo}
          />
        )}

        {/* Main Content */}
        <div className="w-full h-full" onClick={handleCanvasClick}>
          <SortableContext
            items={sortableElementIds}
            strategy={verticalListSortingStrategy}
          >
            {elements.map((element) => {
              const state = elementStates.get(element.id);
              const isSelected = selectedElements.has(element.id);

              return (
                <EnhancedSortableElement
                  key={element.id}
                  element={element}
                  isSelected={isSelected}
                  isVisible={state?.isVisible ?? true}
                  isLocked={state?.isLocked ?? false}
                  isHighlighted={state?.isHighlighted ?? false}
                  animationsEnabled={animationsEnabled}
                  onClick={(event) => handleElementClick(element.id, event)}
                  onToggleVisibility={() =>
                    handleBulkAction(state?.isVisible ? "hide" : "show", [
                      element.id,
                    ])
                  }
                  onToggleLock={() =>
                    handleBulkAction(state?.isLocked ? "unlock" : "lock", [
                      element.id,
                    ])
                  }
                />
              );
            })}
          </SortableContext>

          {children}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {draggedElement && (
            <DragPreview
              element={draggedElement}
              isDragging={true}
              isMultiple={isMultiSelecting}
              count={selectedElements.size}
            />
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

// Enhanced Sortable Element Component
interface EnhancedSortableElementProps {
  element: FormElementInstance;
  isSelected: boolean;
  isVisible: boolean;
  isLocked: boolean;
  isHighlighted: boolean;
  animationsEnabled: boolean;
  onClick: (event: React.MouseEvent) => void;
  onToggleVisibility: () => void;
  onToggleLock: () => void;
}

function EnhancedSortableElement({
  element,
  isSelected,
  isVisible,
  isLocked,
  isHighlighted,
  animationsEnabled,
  onClick,
  onToggleVisibility,
  onToggleLock,
}: EnhancedSortableElementProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: element.id,
    disabled: isLocked,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: animationsEnabled ? transition : undefined,
    opacity: isDragging ? 0.5 : isVisible ? 1 : 0.3,
  };

  const DesignerComponent = FormElements[element.type].designerComponent;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group rounded-md transition-all duration-200",
        isSelected && "ring-2 ring-primary ring-offset-2",
        isHighlighted && "bg-primary/5",
        !isVisible && "grayscale",
        isLocked && "opacity-60",
        "hover:shadow-md",
      )}
      onClick={onClick}
    >
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-primary rounded-full z-10" />
      )}

      {/* Lock Indicator */}
      {isLocked && (
        <div className="absolute top-2 right-2 z-10">
          <Lock className="h-4 w-4 text-muted-foreground" />
        </div>
      )}

      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className={cn(
          "absolute left-0 top-0 bottom-0 w-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10",
          isLocked && "cursor-not-allowed opacity-30",
        )}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Element Controls */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleVisibility();
                }}
              >
                {isVisible ? (
                  <Eye className="h-3 w-3" />
                ) : (
                  <EyeOff className="h-3 w-3" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isVisible ? "Hide Element" : "Show Element"}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleLock();
                }}
              >
                {isLocked ? (
                  <Unlock className="h-3 w-3" />
                ) : (
                  <Lock className="h-3 w-3" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isLocked ? "Unlock Element" : "Lock Element"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Element Content */}
      <div className={cn("w-full", isLocked && "pointer-events-none")}>
        <DesignerComponent elementInstance={element} />
      </div>

      {/* Drop Indicator */}
      {isDragging && (
        <div className="absolute inset-0 border-2 border-dashed border-primary bg-primary/10 rounded-md flex items-center justify-center">
          <Move className="h-6 w-6 text-primary" />
        </div>
      )}
    </div>
  );
}

// Selection Toolbar Component
function SelectionToolbar({
  selectedCount,
  onBulkAction,
  selectedElementIds,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: {
  selectedCount: number;
  onBulkAction: (
    action: "copy" | "delete" | "hide" | "show" | "lock" | "unlock",
    elementIds: string[],
  ) => void;
  selectedElementIds: string[];
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}) {
  return (
    <Card className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 shadow-lg">
      <CardContent className="flex items-center gap-2 p-3">
        <Badge variant="secondary">{selectedCount} selected</Badge>

        <div className="h-4 w-px bg-border" />

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onBulkAction("copy", selectedElementIds)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy Selection</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onBulkAction("hide", selectedElementIds)}
              >
                <EyeOff className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Hide Selection</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onBulkAction("lock", selectedElementIds)}
              >
                <Lock className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Lock Selection</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onBulkAction("delete", selectedElementIds)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete Selection</TooltipContent>
          </Tooltip>

          <div className="h-4 w-px bg-border" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={onUndo}
                disabled={!canUndo}
              >
                Undo
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo Last Action</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={onRedo}
                disabled={!canRedo}
              >
                Redo
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo Last Action</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}

// Drag Preview Component
function DragPreview({
  element,
  isDragging,
  isMultiple = false,
  count = 1,
}: {
  element: FormElementInstance;
  isDragging: boolean;
  isMultiple?: boolean;
  count?: number;
}) {
  const formElement = FormElements[element.type];
  const Icon = formElement.designerButtonElement.icon;

  return (
    <Card
      className={cn(
        "p-3 shadow-lg border-2 border-primary bg-background/95 backdrop-blur-sm",
        isDragging && "rotate-3 scale-105",
      )}
    >
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-primary" />
        <div>
          <div className="font-medium text-sm">
            {formElement.designerButtonElement.label}
          </div>
          {isMultiple && count > 1 && (
            <div className="text-xs text-muted-foreground">
              +{count - 1} more elements
            </div>
          )}
        </div>
        {isMultiple && count > 1 && (
          <Badge variant="secondary" className="ml-auto">
            {count}
          </Badge>
        )}
      </div>
    </Card>
  );
}
