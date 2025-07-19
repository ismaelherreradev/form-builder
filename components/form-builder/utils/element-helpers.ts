import type {
  FormElementInstance,
  ElementStyling,
  ElementAnimation,
  ResponsiveSettings,
  ConditionalRule,
} from "../elements";
import {
  getDefaultStyling,
  getDefaultAnimation,
  getDefaultResponsiveSettings,
  getDefaultPosition,
} from "../schemas/element-validation";

// Helper to create a new enhanced element instance
export const createEnhancedElement = (
  id: string,
  type: FormElementInstance["type"],
  extraAttributes?: Record<string, any>,
): FormElementInstance => {
  return {
    id,
    type,
    extraAttributes: extraAttributes || {},
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
  };
};

// Helper to update element styling
export const updateElementStyling = (
  element: FormElementInstance,
  styling: Partial<ElementStyling>,
): FormElementInstance => {
  return {
    ...element,
    styling: {
      ...element.styling,
      ...styling,
    },
    metadata: {
      ...element.metadata,
      updatedAt: new Date(),
    },
  };
};

// Helper to update element animation
export const updateElementAnimation = (
  element: FormElementInstance,
  animation: Partial<ElementAnimation>,
): FormElementInstance => {
  return {
    ...element,
    animation: {
      ...element.animation,
      ...animation,
    },
    metadata: {
      ...element.metadata,
      updatedAt: new Date(),
    },
  };
};

// Helper to update responsive settings for a specific breakpoint
export const updateElementResponsive = (
  element: FormElementInstance,
  breakpoint: "desktop" | "tablet" | "mobile",
  settings: Partial<ResponsiveSettings>,
): FormElementInstance => {
  const defaultResponsiveSettings: ResponsiveSettings = {
    visible: true,
    width: "auto",
    order: 0,
    styling: {},
  };

  return {
    ...element,
    responsive: {
      desktop: { ...defaultResponsiveSettings, ...element.responsive?.desktop },
      tablet: { ...defaultResponsiveSettings, ...element.responsive?.tablet },
      mobile: { ...defaultResponsiveSettings, ...element.responsive?.mobile },
      [breakpoint]: {
        ...defaultResponsiveSettings,
        ...element.responsive?.[breakpoint],
        ...settings,
      },
    },
    metadata: {
      ...element.metadata,
      updatedAt: new Date(),
    },
  };
};

// Helper to add conditional logic rule
export const addConditionalRule = (
  element: FormElementInstance,
  rule: ConditionalRule,
): FormElementInstance => {
  return {
    ...element,
    conditionalLogic: [...(element.conditionalLogic || []), rule],
    metadata: {
      ...element.metadata,
      updatedAt: new Date(),
    },
  };
};

// Helper to remove conditional logic rule
export const removeConditionalRule = (
  element: FormElementInstance,
  ruleId: string,
): FormElementInstance => {
  return {
    ...element,
    conditionalLogic: (element.conditionalLogic || []).filter(
      (rule) => rule.id !== ruleId,
    ),
    metadata: {
      ...element.metadata,
      updatedAt: new Date(),
    },
  };
};

// Helper to duplicate an element with new ID
export const duplicateElement = (
  element: FormElementInstance,
  newId: string,
): FormElementInstance => {
  return {
    ...element,
    id: newId,
    metadata: {
      ...element.metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };
};

// Helper to check if element should be visible based on responsive settings
export const isElementVisible = (
  element: FormElementInstance,
  breakpoint: "desktop" | "tablet" | "mobile",
): boolean => {
  return element.responsive?.[breakpoint]?.visible ?? true;
};

// Helper to get element width for a specific breakpoint
export const getElementWidth = (
  element: FormElementInstance,
  breakpoint: "desktop" | "tablet" | "mobile",
): string | number => {
  const width = element.responsive?.[breakpoint]?.width;
  if (width === undefined) return "auto";

  if (typeof width === "string") {
    switch (width) {
      case "full":
        return "100%";
      case "fit":
        return "fit-content";
      case "auto":
        return "auto";
      default:
        return "auto";
    }
  }

  return `${width}px`;
};

// Helper to generate CSS styles from element styling
export const generateElementStyles = (
  element: FormElementInstance,
  breakpoint?: "desktop" | "tablet" | "mobile",
): React.CSSProperties => {
  const styling = element.styling || {};
  const responsiveStyling = breakpoint
    ? element.responsive?.[breakpoint]?.styling
    : undefined;

  // Merge base styling with responsive overrides
  const mergedStyling = { ...styling, ...responsiveStyling };

  const styles: React.CSSProperties = {};

  // Color properties
  if (mergedStyling.backgroundColor)
    styles.backgroundColor = mergedStyling.backgroundColor;
  if (mergedStyling.textColor) styles.color = mergedStyling.textColor;

  // Border properties
  if (mergedStyling.borderColor) styles.borderColor = mergedStyling.borderColor;
  if (mergedStyling.borderWidth !== undefined)
    styles.borderWidth = `${mergedStyling.borderWidth}px`;
  if (mergedStyling.borderStyle) styles.borderStyle = mergedStyling.borderStyle;
  if (mergedStyling.borderRadius !== undefined)
    styles.borderRadius = `${mergedStyling.borderRadius}px`;

  // Spacing properties
  if (mergedStyling.padding) {
    const { top, right, bottom, left } = mergedStyling.padding;
    styles.padding = `${top}px ${right}px ${bottom}px ${left}px`;
  }
  if (mergedStyling.margin) {
    const { top, right, bottom, left } = mergedStyling.margin;
    styles.margin = `${top}px ${right}px ${bottom}px ${left}px`;
  }

  // Typography properties
  if (mergedStyling.fontSize !== undefined)
    styles.fontSize = `${mergedStyling.fontSize}px`;
  if (mergedStyling.fontWeight) styles.fontWeight = mergedStyling.fontWeight;
  if (mergedStyling.fontFamily) styles.fontFamily = mergedStyling.fontFamily;
  if (mergedStyling.textAlign) styles.textAlign = mergedStyling.textAlign;
  if (mergedStyling.lineHeight !== undefined)
    styles.lineHeight = mergedStyling.lineHeight;
  if (mergedStyling.letterSpacing !== undefined)
    styles.letterSpacing = `${mergedStyling.letterSpacing}px`;

  // Visual effects
  if (mergedStyling.boxShadow) styles.boxShadow = mergedStyling.boxShadow;
  if (mergedStyling.opacity !== undefined)
    styles.opacity = mergedStyling.opacity;

  // Width from responsive settings
  if (breakpoint) {
    const width = getElementWidth(element, breakpoint);
    if (width !== "auto") styles.width = width;
  }

  return styles;
};

// Helper to generate animation CSS classes/styles
export const generateAnimationStyles = (
  element: FormElementInstance,
): {
  entrance?: React.CSSProperties;
  hover?: React.CSSProperties;
  focus?: React.CSSProperties;
} => {
  const animation = element.animation;
  if (!animation) return {};

  const styles: any = {};

  // Entrance animation
  if (animation.entrance && animation.entrance.type !== "none") {
    const { type, direction, duration, delay, easing } = animation.entrance;

    styles.entrance = {
      animationDuration: `${duration}ms`,
      animationDelay: `${delay}ms`,
      animationTimingFunction: easing,
      animationFillMode: "both",
    };

    // Add animation name based on type and direction
    styles.entrance.animationName = type;
  }

  // Hover animation
  if (animation.hover) {
    const { scale, opacity, backgroundColor, borderColor, duration } =
      animation.hover;

    styles.hover = {
      transition: `all ${duration}ms ease-in-out`,
    };

    if (scale !== undefined) styles.hover.transform = `scale(${scale})`;
    if (opacity !== undefined) styles.hover.opacity = opacity;
    if (backgroundColor) styles.hover.backgroundColor = backgroundColor;
    if (borderColor) styles.hover.borderColor = borderColor;
  }

  // Focus animation
  if (animation.focus) {
    const { borderColor, boxShadow, scale } = animation.focus;

    styles.focus = {};

    if (borderColor) styles.focus.borderColor = borderColor;
    if (boxShadow) styles.focus.boxShadow = boxShadow;
    if (scale !== undefined) styles.focus.transform = `scale(${scale})`;
  }

  return styles;
};

// Helper to evaluate conditional logic
export const evaluateConditionalLogic = (
  element: FormElementInstance,
  formData: Record<string, any>,
): {
  visible: boolean;
  required: boolean;
  disabled: boolean;
} => {
  const result = {
    visible: true,
    required: false,
    disabled: false,
  };

  const rules = element.conditionalLogic || [];
  if (rules.length === 0) return result;

  // Group rules by action
  const rulesByAction = rules.reduce(
    (acc, rule) => {
      if (!acc[rule.action]) acc[rule.action] = [];
      acc[rule.action].push(rule);
      return acc;
    },
    {} as Record<string, ConditionalRule[]>,
  );

  // Evaluate each action group
  Object.entries(rulesByAction).forEach(([action, actionRules]) => {
    const conditionsMet = actionRules.some((rule) => {
      const fieldValue = formData[rule.condition.field];
      return evaluateCondition(rule.condition, fieldValue);
    });

    switch (action) {
      case "show":
        if (conditionsMet) result.visible = true;
        break;
      case "hide":
        if (conditionsMet) result.visible = false;
        break;
      case "require":
        if (conditionsMet) result.required = true;
        break;
      case "disable":
        if (conditionsMet) result.disabled = true;
        break;
    }
  });

  return result;
};

// Helper to evaluate a single condition
const evaluateCondition = (
  condition: ConditionalRule["condition"],
  fieldValue: any,
): boolean => {
  const { operator, value } = condition;

  switch (operator) {
    case "equals":
      return fieldValue === value;
    case "not_equals":
      return fieldValue !== value;
    case "contains":
      return String(fieldValue).includes(String(value));
    case "not_contains":
      return !String(fieldValue).includes(String(value));
    case "greater_than":
      return Number(fieldValue) > Number(value);
    case "less_than":
      return Number(fieldValue) < Number(value);
    case "is_empty":
      return (
        !fieldValue ||
        fieldValue === "" ||
        fieldValue === null ||
        fieldValue === undefined
      );
    case "is_not_empty":
      return (
        fieldValue &&
        fieldValue !== "" &&
        fieldValue !== null &&
        fieldValue !== undefined
      );
    default:
      return false;
  }
};

// Helper to get element order for a specific breakpoint
export const getElementOrder = (
  element: FormElementInstance,
  breakpoint: "desktop" | "tablet" | "mobile",
): number => {
  return element.responsive?.[breakpoint]?.order ?? 0;
};

// Helper to sort elements by order for a specific breakpoint
export const sortElementsByOrder = (
  elements: FormElementInstance[],
  breakpoint: "desktop" | "tablet" | "mobile",
): FormElementInstance[] => {
  return [...elements].sort((a, b) => {
    const orderA = getElementOrder(a, breakpoint);
    const orderB = getElementOrder(b, breakpoint);
    return orderA - orderB;
  });
};
