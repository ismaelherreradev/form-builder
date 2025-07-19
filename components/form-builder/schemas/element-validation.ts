import { z } from "zod";

// Styling validation schema
export const ElementStylingSchema = z
  .object({
    backgroundColor: z.string().optional(),
    textColor: z.string().optional(),
    borderColor: z.string().optional(),
    borderWidth: z.number().min(0).max(20).optional(),
    borderStyle: z.enum(["solid", "dashed", "dotted", "none"]).optional(),
    borderRadius: z.number().min(0).max(50).optional(),
    padding: z
      .object({
        top: z.number().min(0).max(100),
        right: z.number().min(0).max(100),
        bottom: z.number().min(0).max(100),
        left: z.number().min(0).max(100),
      })
      .optional(),
    margin: z
      .object({
        top: z.number().min(0).max(100),
        right: z.number().min(0).max(100),
        bottom: z.number().min(0).max(100),
        left: z.number().min(0).max(100),
      })
      .optional(),
    fontSize: z.number().min(8).max(72).optional(),
    fontWeight: z.enum(["normal", "medium", "semibold", "bold"]).optional(),
    fontFamily: z.string().optional(),
    textAlign: z.enum(["left", "center", "right", "justify"]).optional(),
    lineHeight: z.number().min(0.5).max(3).optional(),
    letterSpacing: z.number().min(-2).max(10).optional(),
    boxShadow: z.string().optional(),
    opacity: z.number().min(0).max(1).optional(),
  })
  .strict();

// Animation validation schema
export const ElementAnimationSchema = z
  .object({
    entrance: z
      .object({
        type: z.enum(["fade", "slide", "scale", "bounce", "none"]),
        direction: z.enum(["up", "down", "left", "right"]).optional(),
        duration: z.number().min(0).max(5000),
        delay: z.number().min(0).max(5000),
        easing: z.string(),
      })
      .optional(),
    hover: z
      .object({
        scale: z.number().min(0.5).max(2).optional(),
        opacity: z.number().min(0).max(1).optional(),
        backgroundColor: z.string().optional(),
        borderColor: z.string().optional(),
        duration: z.number().min(0).max(1000),
      })
      .optional(),
    focus: z
      .object({
        borderColor: z.string().optional(),
        boxShadow: z.string().optional(),
        scale: z.number().min(0.8).max(1.2).optional(),
      })
      .optional(),
  })
  .strict();

// Responsive settings validation schema
export const ResponsiveSettingsSchema = z
  .object({
    visible: z.boolean(),
    width: z
      .union([z.enum(["auto", "full", "fit"]), z.number().min(0).max(2000)])
      .optional(),
    order: z.number().min(0).max(100).optional(),
    styling: ElementStylingSchema.partial().optional(),
  })
  .strict();

// Position validation schema
export const ElementPositionSchema = z
  .object({
    x: z.number().min(0),
    y: z.number().min(0),
    width: z.union([z.enum(["auto", "full"]), z.number().min(0).max(2000)]),
    height: z.union([z.enum(["auto"]), z.number().min(0).max(2000)]),
    zIndex: z.number().min(-1000).max(1000).optional(),
  })
  .strict();

// Conditional rule validation schema
export const ConditionalRuleSchema = z
  .object({
    id: z.string().min(1),
    condition: z.object({
      field: z.string().min(1),
      operator: z.enum([
        "equals",
        "not_equals",
        "contains",
        "not_contains",
        "greater_than",
        "less_than",
        "is_empty",
        "is_not_empty",
      ]),
      value: z.union([z.string(), z.number(), z.boolean()]),
    }),
    action: z.enum(["show", "hide", "require", "disable"]),
    logicOperator: z.enum(["and", "or"]).optional(),
  })
  .strict();

// Element metadata validation schema
export const ElementMetadataSchema = z
  .object({
    label: z.string().optional(),
    description: z.string().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
  })
  .strict();

// Enhanced FormElementInstance validation schema
export const FormElementInstanceSchema = z
  .object({
    id: z.string().min(1),
    type: z.enum([
      "TextField",
      "TitleField",
      "CheckboxField",
      "DateField",
      "NumberField",
      "ParagraphField",
      "SelectField",
      "SeparatorField",
      "SpacerField",
      "SubTitleField",
      "TextAreaField",
    ]),
    extraAttributes: z.record(z.string(), z.any()).optional(),
    position: ElementPositionSchema.optional(),
    styling: ElementStylingSchema.optional(),
    animation: ElementAnimationSchema.optional(),
    responsive: z
      .object({
        desktop: ResponsiveSettingsSchema,
        tablet: ResponsiveSettingsSchema,
        mobile: ResponsiveSettingsSchema,
      })
      .optional(),
    conditionalLogic: z.array(ConditionalRuleSchema).optional(),
    metadata: ElementMetadataSchema.optional(),
  })
  .strict();

// Validation for arrays of form elements
export const FormElementsArraySchema = z.array(FormElementInstanceSchema);

// Property validation schema for designer components
export const PropertySchema = z
  .object({
    id: z.string().min(1),
    label: z.string().min(1),
    type: z.enum([
      "text",
      "number",
      "boolean",
      "select",
      "color",
      "slider",
      "textarea",
      "file",
    ]),
    value: z.any(),
    options: z
      .array(
        z.object({
          label: z.string(),
          value: z.any(),
        }),
      )
      .optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    step: z.number().optional(),
    placeholder: z.string().optional(),
    description: z.string().optional(),
    required: z.boolean().optional(),
  })
  .strict();

// Property group validation schema
export const PropertyGroupSchema = z
  .object({
    id: z.string().min(1),
    label: z.string().min(1),
    properties: z.array(PropertySchema),
    collapsible: z.boolean(),
    defaultExpanded: z.boolean().optional(),
  })
  .strict();

// Element category validation schema
export const ElementCategorySchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    elements: z.array(z.string()),
    color: z.string(),
    description: z.string().optional(),
  })
  .strict();

// Validation result schema
export const ValidationResultSchema = z
  .object({
    isValid: z.boolean(),
    errors: z.array(
      z.object({
        field: z.string(),
        message: z.string(),
        severity: z.enum(["error", "warning"]),
      }),
    ),
  })
  .strict();

// Type exports for use in components
export type ElementStylingType = z.infer<typeof ElementStylingSchema>;
export type ElementAnimationType = z.infer<typeof ElementAnimationSchema>;
export type ResponsiveSettingsType = z.infer<typeof ResponsiveSettingsSchema>;
export type ElementPositionType = z.infer<typeof ElementPositionSchema>;
export type ConditionalRuleType = z.infer<typeof ConditionalRuleSchema>;
export type ElementMetadataType = z.infer<typeof ElementMetadataSchema>;
export type FormElementInstanceType = z.infer<typeof FormElementInstanceSchema>;
export type PropertyType = z.infer<typeof PropertySchema>;
export type PropertyGroupType = z.infer<typeof PropertyGroupSchema>;
export type ElementCategoryType = z.infer<typeof ElementCategorySchema>;
export type ValidationResultType = z.infer<typeof ValidationResultSchema>;

// Utility functions for validation
export const validateFormElement = (element: unknown): ValidationResultType => {
  try {
    FormElementInstanceSchema.parse(element);
    return { isValid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: error.issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
          severity: "error" as const,
        })),
      };
    }
    return {
      isValid: false,
      errors: [
        {
          field: "unknown",
          message: "Unknown validation error",
          severity: "error",
        },
      ],
    };
  }
};

export const validateFormElements = (
  elements: unknown[],
): ValidationResultType => {
  try {
    FormElementsArraySchema.parse(elements);
    return { isValid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: error.issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
          severity: "error" as const,
        })),
      };
    }
    return {
      isValid: false,
      errors: [
        {
          field: "unknown",
          message: "Unknown validation error",
          severity: "error",
        },
      ],
    };
  }
};

// Default values for new elements
export const getDefaultStyling = (): ElementStylingType => ({
  padding: { top: 8, right: 12, bottom: 8, left: 12 },
  margin: { top: 4, right: 0, bottom: 4, left: 0 },
  borderRadius: 4,
  fontSize: 14,
  fontWeight: "normal",
  textAlign: "left",
  lineHeight: 1.5,
  opacity: 1,
});

export const getDefaultAnimation = (): ElementAnimationType => ({
  entrance: {
    type: "fade",
    duration: 200,
    delay: 0,
    easing: "ease-in-out",
  },
  hover: {
    duration: 150,
  },
});

export const getDefaultResponsiveSettings = (): ResponsiveSettingsType => ({
  visible: true,
  width: "auto",
});

export const getDefaultPosition = (): ElementPositionType => ({
  x: 0,
  y: 0,
  width: "auto",
  height: "auto",
});
