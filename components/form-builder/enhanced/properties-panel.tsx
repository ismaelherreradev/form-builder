"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Settings,
  Palette,
  Eye,
  Code,
  Copy,
  Trash2,
  ChevronDown,
  ChevronRight,
  Info,
  Zap,
  Layout,
  Type,
  Smartphone,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

import { FormElementInstance, FormElements } from "../elements";
import { PropertiesPanelProps, type PropertyGroup } from "../types/designer";
import useDesigner from "../hooks/useDesigner";

interface EnhancedPropertiesPanelProps
  extends Omit<
    PropertiesPanelProps,
    "element" | "onUpdate" | "onDuplicate" | "onDelete"
  > {
  onElementFocus?: (elementId: string) => void;
}

export default function EnhancedPropertiesPanel({
  onClose,
  onElementFocus,
}: EnhancedPropertiesPanelProps) {
  const { selectedElement, updateElement, removeElement } = useDesigner();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(["basic", "styling"]),
  );
  const [activeTab, setActiveTab] = useState<
    "properties" | "styling" | "behavior" | "advanced"
  >("properties");

  // Toggle group expansion
  const toggleGroup = useCallback((groupId: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  }, []);

  // Handle element duplication
  const handleDuplicate = useCallback(() => {
    if (!selectedElement) return;

    const duplicatedElement: FormElementInstance = {
      ...selectedElement,
      id: `${selectedElement.type}-${Date.now()}`,
      metadata: {
        ...selectedElement.metadata,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    // This would need to be implemented in the designer context
    // For now, we'll just call the existing update to show the concept
    console.log("Duplicate element:", duplicatedElement);
  }, [selectedElement]);

  // Handle element deletion
  const handleDelete = useCallback(() => {
    if (!selectedElement) return;
    removeElement(selectedElement.id);
  }, [selectedElement, removeElement]);

  // Handle property updates
  const handlePropertyUpdate = useCallback(
    (key: string, value: any) => {
      if (!selectedElement) return;

      const updatedElement = {
        ...selectedElement,
        extraAttributes: {
          ...selectedElement.extraAttributes,
          [key]: value,
        },
        metadata: {
          ...selectedElement.metadata,
          updatedAt: new Date(),
        },
      };

      updateElement(selectedElement.id, updatedElement);
    },
    [selectedElement, updateElement],
  );

  // Handle styling updates
  const handleStylingUpdate = useCallback(
    (styleKey: string, value: any) => {
      if (!selectedElement) return;

      const updatedElement = {
        ...selectedElement,
        styling: {
          ...selectedElement.styling,
          [styleKey]: value,
        },
        metadata: {
          ...selectedElement.metadata,
          updatedAt: new Date(),
        },
      };

      updateElement(selectedElement.id, updatedElement);
    },
    [selectedElement, updateElement],
  );

  // Handle responsive updates
  const handleResponsiveUpdate = useCallback(
    (breakpoint: "desktop" | "tablet" | "mobile", settings: any) => {
      if (!selectedElement) return;

      const defaultResponsiveSettings = {
        visible: true,
        width: "auto" as const,
        order: 0,
        styling: {},
      };

      const updatedElement: FormElementInstance = {
        ...selectedElement,
        responsive: {
          desktop: {
            ...defaultResponsiveSettings,
            ...selectedElement.responsive?.desktop,
          },
          tablet: {
            ...defaultResponsiveSettings,
            ...selectedElement.responsive?.tablet,
          },
          mobile: {
            ...defaultResponsiveSettings,
            ...selectedElement.responsive?.mobile,
          },
          [breakpoint]: {
            ...defaultResponsiveSettings,
            ...selectedElement.responsive?.[breakpoint],
            ...settings,
          },
        },
        metadata: {
          ...selectedElement.metadata,
          updatedAt: new Date(),
        },
      };

      updateElement(selectedElement.id, updatedElement);
    },
    [selectedElement, updateElement],
  );

  // Get element info
  const elementInfo = useMemo(() => {
    if (!selectedElement) return null;

    const formElement = FormElements[selectedElement.type];
    return {
      label: formElement.designerButtonElement.label,
      type: selectedElement.type,
      id: selectedElement.id,
      icon: formElement.designerButtonElement.icon,
    };
  }, [selectedElement]);

  if (!selectedElement) {
    return (
      <Card className="w-80 h-full border-l">
        <CardContent className="flex flex-col items-center justify-center h-full text-center p-6">
          <Settings className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            No Element Selected
          </h3>
          <p className="text-sm text-muted-foreground/70">
            Select an element from the canvas to edit its properties
          </p>
        </CardContent>
      </Card>
    );
  }

  const ElementIcon = elementInfo?.icon || Settings;
  const PropertiesComponent =
    FormElements[selectedElement.type].propertiesComponent;

  return (
    <Card className="w-80 h-full border-l flex flex-col">
      {/* Header */}
      <CardHeader className="pb-2 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ElementIcon className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <CardTitle className="text-base">{elementInfo?.label}</CardTitle>
              <p className="text-xs text-muted-foreground">
                {elementInfo?.type}
              </p>
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          )}
        </div>

        {/* Element Actions */}
        <div className="flex items-center gap-1 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDuplicate}
            className="flex-1"
          >
            <Copy className="h-3 w-3 mr-1" />
            Duplicate
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="flex-1 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Delete
          </Button>
        </div>

        {/* Element Metadata */}
        <div className="flex items-center gap-2 pt-2">
          <Badge variant="secondary" className="text-xs">
            ID: {selectedElement.id.slice(-6)}
          </Badge>
          {selectedElement.metadata?.updatedAt && (
            <Badge variant="outline" className="text-xs">
              Modified{" "}
              {new Date(
                selectedElement.metadata.updatedAt,
              ).toLocaleTimeString()}
            </Badge>
          )}
        </div>
      </CardHeader>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs
          value={activeTab}
          onValueChange={(value: any) => setActiveTab(value)}
          className="h-full flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-4 mx-4 mt-4">
            <TabsTrigger value="properties" className="text-xs">
              Props
            </TabsTrigger>
            <TabsTrigger value="styling" className="text-xs">
              Style
            </TabsTrigger>
            <TabsTrigger value="behavior" className="text-xs">
              Behavior
            </TabsTrigger>
            <TabsTrigger value="advanced" className="text-xs">
              Advanced
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1">
            {/* Properties Tab */}
            <TabsContent value="properties" className="p-4 space-y-4 mt-0">
              <PropertyGroup
                title="Basic Properties"
                icon={Settings}
                isExpanded={expandedGroups.has("basic")}
                onToggle={() => toggleGroup("basic")}
              >
                <PropertiesComponent elementInstance={selectedElement} />
              </PropertyGroup>

              <PropertyGroup
                title="Element Info"
                icon={Info}
                isExpanded={expandedGroups.has("info")}
                onToggle={() => toggleGroup("info")}
              >
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      Element ID
                    </label>
                    <div className="text-sm font-mono bg-muted p-2 rounded mt-1">
                      {selectedElement.id}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      Element Type
                    </label>
                    <div className="text-sm bg-muted p-2 rounded mt-1">
                      {selectedElement.type}
                    </div>
                  </div>
                  {selectedElement.metadata?.description && (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">
                        Description
                      </label>
                      <div className="text-sm bg-muted p-2 rounded mt-1">
                        {selectedElement.metadata.description}
                      </div>
                    </div>
                  )}
                </div>
              </PropertyGroup>
            </TabsContent>

            {/* Styling Tab */}
            <TabsContent value="styling" className="p-4 space-y-4 mt-0">
              <PropertyGroup
                title="Appearance"
                icon={Palette}
                isExpanded={expandedGroups.has("appearance")}
                onToggle={() => toggleGroup("appearance")}
              >
                <StylingControls
                  element={selectedElement}
                  onUpdate={handleStylingUpdate}
                />
              </PropertyGroup>

              <PropertyGroup
                title="Typography"
                icon={Type}
                isExpanded={expandedGroups.has("typography")}
                onToggle={() => toggleGroup("typography")}
              >
                <TypographyControls
                  element={selectedElement}
                  onUpdate={handleStylingUpdate}
                />
              </PropertyGroup>

              <PropertyGroup
                title="Layout"
                icon={Layout}
                isExpanded={expandedGroups.has("layout")}
                onToggle={() => toggleGroup("layout")}
              >
                <LayoutControls
                  element={selectedElement}
                  onUpdate={handleStylingUpdate}
                />
              </PropertyGroup>
            </TabsContent>

            {/* Behavior Tab */}
            <TabsContent value="behavior" className="p-4 space-y-4 mt-0">
              <PropertyGroup
                title="Visibility"
                icon={Eye}
                isExpanded={expandedGroups.has("visibility")}
                onToggle={() => toggleGroup("visibility")}
              >
                <VisibilityControls
                  element={selectedElement}
                  onUpdate={handlePropertyUpdate}
                />
              </PropertyGroup>

              <PropertyGroup
                title="Interactions"
                icon={Zap}
                isExpanded={expandedGroups.has("interactions")}
                onToggle={() => toggleGroup("interactions")}
              >
                <InteractionControls
                  element={selectedElement}
                  onUpdate={handlePropertyUpdate}
                />
              </PropertyGroup>
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced" className="p-4 space-y-4 mt-0">
              <PropertyGroup
                title="Responsive Settings"
                icon={Smartphone}
                isExpanded={expandedGroups.has("responsive")}
                onToggle={() => toggleGroup("responsive")}
              >
                <ResponsiveControls
                  element={selectedElement}
                  onUpdate={handlePropertyUpdate}
                  onResponsiveUpdate={handleResponsiveUpdate}
                />
              </PropertyGroup>

              <PropertyGroup
                title="Custom Code"
                icon={Code}
                isExpanded={expandedGroups.has("code")}
                onToggle={() => toggleGroup("code")}
              >
                <CustomCodeControls
                  element={selectedElement}
                  onUpdate={handlePropertyUpdate}
                />
              </PropertyGroup>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Advanced settings may affect form functionality. Use with
                  caution.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    </Card>
  );
}

// Property Group Component
interface PropertyGroupProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function PropertyGroup({
  title,
  icon: Icon,
  isExpanded,
  onToggle,
  children,
}: PropertyGroupProps) {
  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="w-full justify-between p-2 h-auto">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{title}</span>
          </div>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-3 pt-2">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

// Styling Controls Component
interface ControlsProps {
  element: FormElementInstance;
  onUpdate: (key: string, value: any) => void;
}

interface ResponsiveControlsProps extends ControlsProps {
  onResponsiveUpdate: (
    breakpoint: "desktop" | "tablet" | "mobile",
    settings: any,
  ) => void;
}

function StylingControls({ element, onUpdate }: ControlsProps) {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-medium text-muted-foreground">
          Background Color
        </label>
        <input
          type="color"
          value={element.styling?.backgroundColor || "#ffffff"}
          onChange={(e) => onUpdate("backgroundColor", e.target.value)}
          className="w-full h-8 rounded border mt-1"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground">
          Text Color
        </label>
        <input
          type="color"
          value={element.styling?.textColor || "#000000"}
          onChange={(e) => onUpdate("textColor", e.target.value)}
          className="w-full h-8 rounded border mt-1"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground">
          Border Color
        </label>
        <input
          type="color"
          value={element.styling?.borderColor || "#e5e7eb"}
          onChange={(e) => onUpdate("borderColor", e.target.value)}
          className="w-full h-8 rounded border mt-1"
        />
      </div>
    </div>
  );
}

function TypographyControls({ element, onUpdate }: ControlsProps) {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-medium text-muted-foreground">
          Font Size
        </label>
        <input
          type="range"
          min="12"
          max="24"
          value={element.styling?.fontSize || 14}
          onChange={(e) => onUpdate("fontSize", parseInt(e.target.value))}
          className="w-full mt-1"
        />
        <div className="text-xs text-muted-foreground text-center">
          {element.styling?.fontSize || 14}px
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground">
          Font Weight
        </label>
        <select
          value={element.styling?.fontWeight || "normal"}
          onChange={(e) => onUpdate("fontWeight", e.target.value)}
          className="w-full mt-1 p-1 border rounded text-sm"
        >
          <option value="normal">Normal</option>
          <option value="medium">Medium</option>
          <option value="semibold">Semibold</option>
          <option value="bold">Bold</option>
        </select>
      </div>
    </div>
  );
}

function LayoutControls({ element, onUpdate }: ControlsProps) {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-medium text-muted-foreground">
          Border Radius
        </label>
        <input
          type="range"
          min="0"
          max="20"
          value={element.styling?.borderRadius || 6}
          onChange={(e) => onUpdate("borderRadius", parseInt(e.target.value))}
          className="w-full mt-1"
        />
        <div className="text-xs text-muted-foreground text-center">
          {element.styling?.borderRadius || 6}px
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground">
          Padding
        </label>
        <input
          type="range"
          min="0"
          max="32"
          value={element.styling?.padding?.top || 8}
          onChange={(e) =>
            onUpdate("padding", {
              top: parseInt(e.target.value),
              right: parseInt(e.target.value),
              bottom: parseInt(e.target.value),
              left: parseInt(e.target.value),
            })
          }
          className="w-full mt-1"
        />
        <div className="text-xs text-muted-foreground text-center">
          {element.styling?.padding?.top || 8}px
        </div>
      </div>
    </div>
  );
}

function VisibilityControls({ element, onUpdate }: ControlsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground">
          Visible
        </label>
        <input
          type="checkbox"
          checked={element.extraAttributes?.visible !== false}
          onChange={(e) => onUpdate("visible", e.target.checked)}
          className="rounded"
        />
      </div>
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground">
          Required
        </label>
        <input
          type="checkbox"
          checked={element.extraAttributes?.required || false}
          onChange={(e) => onUpdate("required", e.target.checked)}
          className="rounded"
        />
      </div>
    </div>
  );
}

function InteractionControls({ element, onUpdate }: ControlsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground">
          Disabled
        </label>
        <input
          type="checkbox"
          checked={element.extraAttributes?.disabled || false}
          onChange={(e) => onUpdate("disabled", e.target.checked)}
          className="rounded"
        />
      </div>
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground">
          Read Only
        </label>
        <input
          type="checkbox"
          checked={element.extraAttributes?.readOnly || false}
          onChange={(e) => onUpdate("readOnly", e.target.checked)}
          className="rounded"
        />
      </div>
    </div>
  );
}

function ResponsiveControls({
  element,
  onUpdate,
  onResponsiveUpdate,
}: ResponsiveControlsProps) {
  const [activeBreakpoint, setActiveBreakpoint] = useState<
    "desktop" | "tablet" | "mobile"
  >("desktop");

  return (
    <div className="space-y-3">
      <div className="flex gap-1">
        {(["desktop", "tablet", "mobile"] as const).map((breakpoint) => (
          <Button
            key={breakpoint}
            variant={activeBreakpoint === breakpoint ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveBreakpoint(breakpoint)}
            className="flex-1 text-xs"
          >
            {breakpoint}
          </Button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground">
          Visible on {activeBreakpoint}
        </label>
        <input
          type="checkbox"
          checked={element.responsive?.[activeBreakpoint]?.visible !== false}
          onChange={(e) =>
            onResponsiveUpdate(activeBreakpoint, { visible: e.target.checked })
          }
          className="rounded"
        />
      </div>
    </div>
  );
}

function CustomCodeControls({ element, onUpdate }: ControlsProps) {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-medium text-muted-foreground">
          Custom CSS Classes
        </label>
        <input
          type="text"
          value={element.extraAttributes?.customClasses || ""}
          onChange={(e) => onUpdate("customClasses", e.target.value)}
          className="w-full mt-1 p-2 border rounded text-sm"
          placeholder="custom-class-1 custom-class-2"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground">
          Custom Attributes
        </label>
        <textarea
          value={element.extraAttributes?.customAttributes || ""}
          onChange={(e) => onUpdate("customAttributes", e.target.value)}
          className="w-full mt-1 p-2 border rounded text-sm h-20 resize-none"
          placeholder='data-custom="value"&#10;aria-label="Custom label"'
        />
      </div>
    </div>
  );
}
