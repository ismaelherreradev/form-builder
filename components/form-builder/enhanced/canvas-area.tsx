"use client";

import { useCallback, useMemo, useState, useRef, useEffect } from "react";
import { DragEndEvent, useDndMonitor, useDroppable } from "@dnd-kit/core";
import {
  ZoomIn,
  ZoomOut,
  Grid3X3,
  RotateCcw,
  Move,
  MousePointer,
} from "lucide-react";

import { cn, idGenerator } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { ElementsType, FormElements, FormElementInstance } from "../elements";
import { CanvasAreaProps, DropZoneIndicator } from "../types/designer";
import useDesigner from "../hooks/useDesigner";
import DesignerElementWrapper from "../designer/element-wrapper";

interface EnhancedCanvasAreaProps
  extends Omit<
    CanvasAreaProps,
    | "elements"
    | "selectedElement"
    | "onElementSelect"
    | "onElementUpdate"
    | "onElementDelete"
    | "onElementDuplicate"
  > {
  onCanvasClick?: () => void;
}

export default function EnhancedCanvasArea({
  showGrid = true,
  snapToGrid = false,
  gridSize = 20,
  zoomLevel = 100,
  onZoomChange,
  canvasSize = { width: 920, height: 800 },
  onCanvasClick,
}: EnhancedCanvasAreaProps) {
  const {
    elements,
    addElement,
    selectedElement,
    setSelectedElement,
    removeElement,
  } = useDesigner();

  const [isDragging, setIsDragging] = useState(false);
  const [dropIndicator, setDropIndicator] = useState<DropZoneIndicator | null>(
    null,
  );
  const [canvasMode, setCanvasMode] = useState<"design" | "select">("design");
  const canvasRef = useRef<HTMLDivElement>(null);

  const droppable = useDroppable({
    id: "enhanced-designer-drop-area",
    data: {
      isDesignerDropArea: true,
    },
  });

  // Handle zoom controls
  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(zoomLevel + 25, 200);
    onZoomChange?.(newZoom);
  }, [zoomLevel, onZoomChange]);

  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(zoomLevel - 25, 25);
    onZoomChange?.(newZoom);
  }, [zoomLevel, onZoomChange]);

  const handleZoomReset = useCallback(() => {
    onZoomChange?.(100);
  }, [onZoomChange]);

  const handleZoomSlider = useCallback(
    (value: number[]) => {
      onZoomChange?.(value[0]);
    },
    [onZoomChange],
  );

  // Calculate drop position with visual feedback
  const calculateDropIndicator = useCallback(
    (event: DragEndEvent): DropZoneIndicator | null => {
      const { over, active } = event;
      if (!over || !active) return null;

      const overId = over.data?.current?.elementId;
      const isTopHalf = over.data?.current?.isTopHalfDesignerElement;
      const isBottomHalf = over.data?.current?.isBottomHalfDesignerElement;

      if (overId && (isTopHalf || isBottomHalf)) {
        return {
          position: isTopHalf ? "top" : "bottom",
          elementId: overId,
          isValid: true,
          insertIndex: isTopHalf
            ? elements.findIndex((el) => el.id === overId)
            : elements.findIndex((el) => el.id === overId) + 1,
        };
      }

      return null;
    },
    [elements],
  );

  // Enhanced drag end handler
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setIsDragging(false);
      setDropIndicator(null);

      const { active, over } = event;
      if (!active || !over) return;

      const isDesignerButtonElement =
        active.data?.current?.isDesignerButtonElement;
      const isDroppingOverDesignerDropArea =
        over.data?.current?.isDesignerDropArea;

      // Handle dropping from sidebar to empty canvas
      if (isDesignerButtonElement && isDroppingOverDesignerDropArea) {
        const type = active.data?.current?.type;
        const newElement =
          FormElements[type as ElementsType].construct(idGenerator());

        // Apply grid snapping if enabled
        if (snapToGrid && canvasRef.current) {
          const rect = canvasRef.current.getBoundingClientRect();
          const x = Math.round(event.delta.x / gridSize) * gridSize;
          const y = Math.round(event.delta.y / gridSize) * gridSize;

          // Add position data if element supports it
          if (newElement.extraAttributes) {
            newElement.extraAttributes.position = { x, y };
          }
        }

        addElement(elements.length, newElement);
        setSelectedElement(newElement);
        return;
      }

      const isDroppingOverDesignerElementTopHalf =
        over.data?.current?.isTopHalfDesignerElement;
      const isDroppingOverDesignerElementBottomHalf =
        over.data?.current?.isBottomHalfDesignerElement;
      const isDroppingOverDesignerElement =
        isDroppingOverDesignerElementTopHalf ||
        isDroppingOverDesignerElementBottomHalf;

      // Handle dropping from sidebar to existing elements
      if (isDesignerButtonElement && isDroppingOverDesignerElement) {
        const type = active.data?.current?.type;
        const newElement =
          FormElements[type as ElementsType].construct(idGenerator());
        const overId = over.data?.current?.elementId;
        const overElementIndex = elements.findIndex((el) => el.id === overId);

        if (overElementIndex === -1) return;

        let indexForNewElement = overElementIndex;
        if (isDroppingOverDesignerElementBottomHalf) {
          indexForNewElement = overElementIndex + 1;
        }

        addElement(indexForNewElement, newElement);
        setSelectedElement(newElement);
        return;
      }

      // Handle reordering existing elements
      const isDraggingDesignerElement = active.data?.current?.isDesignerElement;
      if (isDraggingDesignerElement && isDroppingOverDesignerElement) {
        const activeId = active.data?.current?.elementId;
        const overId = over.data?.current?.elementId;

        const activeElementIndex = elements.findIndex(
          (el) => el.id === activeId,
        );
        const overElementIndex = elements.findIndex((el) => el.id === overId);

        if (activeElementIndex === -1 || overElementIndex === -1) return;

        const activeElement = { ...elements[activeElementIndex] };
        removeElement(activeId);

        let indexForNewElement = overElementIndex;
        if (isDroppingOverDesignerElementBottomHalf) {
          indexForNewElement = overElementIndex + 1;
        }

        addElement(indexForNewElement, activeElement);
        setSelectedElement(activeElement);
      }
    },
    [
      elements,
      addElement,
      removeElement,
      setSelectedElement,
      snapToGrid,
      gridSize,
    ],
  );

  // Monitor drag start and end
  useDndMonitor({
    onDragStart: () => {
      setIsDragging(true);
    },
    onDragEnd: handleDragEnd,
    onDragMove: (event) => {
      const indicator = calculateDropIndicator(event);
      setDropIndicator(indicator);
    },
  });

  // Handle canvas click (deselect elements)
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        setSelectedElement(null);
        onCanvasClick?.();
      }
    },
    [setSelectedElement, onCanvasClick],
  );

  // Generate grid background
  const gridStyle = useMemo(() => {
    if (!showGrid) return {};

    const scaledGridSize = (gridSize * zoomLevel) / 100;
    return {
      backgroundImage: `
        linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
      `,
      backgroundSize: `${scaledGridSize}px ${scaledGridSize}px`,
      backgroundPosition: "0 0, 0 0",
    };
  }, [showGrid, gridSize, zoomLevel]);

  const renderedElements = useMemo(
    () =>
      elements.map((element, index) => (
        <div key={element.id} className="relative">
          {/* Drop indicator */}
          {dropIndicator?.elementId === element.id &&
            dropIndicator.position === "top" && (
              <div className="absolute -top-1 left-0 right-0 h-0.5 bg-primary rounded-full z-10" />
            )}

          <DesignerElementWrapper element={element} />

          {dropIndicator?.elementId === element.id &&
            dropIndicator.position === "bottom" && (
              <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full z-10" />
            )}
        </div>
      )),
    [elements, dropIndicator],
  );

  return (
    <div className="relative flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={canvasMode === "design" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCanvasMode("design")}
                >
                  <Move className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Design Mode</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={canvasMode === "select" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCanvasMode("select")}
                >
                  <MousePointer className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Select Mode</TooltipContent>
            </Tooltip>

            <div className="h-4 w-px bg-border mx-2" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedElement(null)}
                  disabled={!selectedElement}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Show Grid</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Badge variant="secondary" className="text-xs">
            {elements.length} elements
          </Badge>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 25}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom Out</TooltipContent>
            </Tooltip>

            <div className="flex items-center gap-2 min-w-[120px]">
              <Slider
                value={[zoomLevel]}
                onValueChange={handleZoomSlider}
                min={25}
                max={200}
                step={25}
                className="flex-1"
              />
              <span className="text-xs font-mono min-w-[40px] text-center">
                {zoomLevel}%
              </span>
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 200}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom In</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={handleZoomReset}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reset Zoom</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 p-4 overflow-auto">
        <div
          ref={(node) => {
            canvasRef.current = node;
            droppable.setNodeRef(node);
          }}
          className={cn(
            "relative mx-auto transition-all duration-200 ease-out",
            "border-2 border-dashed border-muted-foreground/20 rounded-xl",
            "bg-background",
            droppable.isOver &&
              "ring-2 ring-primary/50 border-primary/50 bg-primary/5",
            isDragging && "border-primary/30",
          )}
          style={{
            width: (canvasSize.width * zoomLevel) / 100,
            minHeight: Math.max((canvasSize.height * zoomLevel) / 100, 400),
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: "top center",
            ...gridStyle,
          }}
          onClick={handleCanvasClick}
          role="region"
          aria-label="Form designer canvas"
        >
          {/* Empty State */}
          {!droppable.isOver && elements.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8">
              <div className="text-6xl text-muted-foreground/30">📝</div>
              <div>
                <p className="text-2xl font-semibold text-muted-foreground mb-2">
                  Start Building Your Form
                </p>
                <p className="text-sm text-muted-foreground/70 max-w-md">
                  Drag and drop elements from the sidebar to create your form
                </p>
              </div>
            </div>
          )}

          {/* Drop Zone Indicator */}
          {droppable.isOver && elements.length === 0 && (
            <div className="p-4 w-full">
              <div className="h-[120px] rounded-md bg-primary/10 border-2 border-dashed border-primary/30 flex items-center justify-center">
                <p className="text-primary font-medium">Drop element here</p>
              </div>
            </div>
          )}

          {/* Form Elements */}
          {elements.length > 0 && (
            <div className="flex flex-col w-full gap-2 p-4">
              {renderedElements}

              {/* Bottom drop zone */}
              {droppable.isOver && (
                <div className="h-8 rounded-md bg-primary/10 border-2 border-dashed border-primary/30 flex items-center justify-center">
                  <p className="text-primary text-sm font-medium">
                    Drop here to add at end
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Canvas Info Overlay */}
          <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm rounded-md px-2 py-1 border text-xs text-muted-foreground">
            {canvasSize.width} × {canvasSize.height}px
          </div>
        </div>
      </div>
    </div>
  );
}
