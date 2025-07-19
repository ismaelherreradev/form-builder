import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  FormElementInstance,
  FormElements,
  ElementsType,
} from "@/components/form-builder/elements";
import { idGenerator } from "@/lib/utils";
import {
  AIPrompt,
  AIGeneratedForm,
  FieldSuggestion,
  ValidationRule,
  OptimizationSuggestion,
  AIError,
  AIFormTemplate,
  AIFormService,
} from "./form-generator";

interface GeminiConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export class GeminiAIService implements AIFormService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private config: GeminiConfig;

  constructor(config: GeminiConfig) {
    this.config = {
      model: "gemini-1.5-flash",
      temperature: 0.7,
      maxTokens: 2048,
      ...config,
    };

    if (!this.config.apiKey) {
      throw new Error("Gemini API key is required");
    }

    this.genAI = new GoogleGenerativeAI(this.config.apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: this.config.model!,
      generationConfig: {
        temperature: this.config.temperature,
        maxOutputTokens: this.config.maxTokens,
      },
    });
  }

  async generateForm(prompt: AIPrompt): Promise<AIGeneratedForm> {
    try {
      const systemPrompt = this.buildSystemPrompt();
      const userPrompt = this.buildUserPrompt(prompt);

      const result = await this.model.generateContent([
        { text: systemPrompt },
        { text: userPrompt },
      ]);

      const response = await result.response;
      const generatedText = response.text();

      return this.parseFormResponse(generatedText, prompt);
    } catch (error) {
      console.error("Gemini form generation error:", error);
      throw this.createAIError(
        "generation_failed",
        "Failed to generate form with Gemini AI",
        error,
      );
    }
  }

  async suggestFields(
    context: string,
    existingFields?: FormElementInstance[],
  ): Promise<FieldSuggestion[]> {
    try {
      const existingFieldNames =
        existingFields?.map(
          (field) => field.extraAttributes?.label || field.type,
        ) || [];

      const prompt = `
        Given a ${context} form with existing fields: ${existingFieldNames.join(", ")},
        suggest 3-5 additional useful fields that would improve this form.

        Respond with a JSON array of field suggestions in this exact format:
        [
          {
            "type": "TextField",
            "label": "Field Label",
            "placeholder": "Field placeholder",
            "required": true,
            "reasoning": "Why this field is useful"
          }
        ]

        Available field types: TextField, NumberField, TextAreaField, SelectField, CheckboxField, DateField
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const suggestions = JSON.parse(response.text());

      return suggestions.map((suggestion: any) => ({
        type: suggestion.type,
        label: suggestion.label,
        placeholder: suggestion.placeholder,
        required: suggestion.required || false,
        reasoning: suggestion.reasoning,
        confidence: 0.8,
      }));
    } catch (error) {
      console.error("Gemini field suggestion error:", error);
      return [];
    }
  }

  async generateValidation(
    fieldType: ElementsType,
    context: string,
  ): Promise<ValidationRule[]> {
    try {
      const prompt = `
        Generate validation rules for a ${fieldType} field with context: ${context}.

        Respond with a JSON array of validation rules:
        [
          {
            "type": "required" | "minLength" | "maxLength" | "pattern" | "custom",
            "value": "validation value or pattern",
            "message": "Error message for user"
          }
        ]
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text());
    } catch (error) {
      console.error("Gemini validation generation error:", error);
      return [];
    }
  }

  async optimizeForm(
    elements: FormElementInstance[],
  ): Promise<OptimizationSuggestion[]> {
    try {
      const formStructure = elements.map((el) => ({
        type: el.type,
        label: el.extraAttributes?.label || "",
        required: el.extraAttributes?.required || false,
      }));

      const prompt = `
        Analyze this form structure and provide optimization suggestions:
        ${JSON.stringify(formStructure, null, 2)}

        Consider:
        - Field order and grouping
        - Required vs optional fields
        - User experience improvements
        - Accessibility enhancements

        Respond with JSON array of suggestions:
        [
          {
            "type": "reorder" | "group" | "simplify" | "enhance",
            "description": "Detailed suggestion",
            "impact": "high" | "medium" | "low",
            "reasoning": "Why this helps"
          }
        ]
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text());
    } catch (error) {
      console.error("Gemini optimization error:", error);
      return [];
    }
  }

  async getTemplates(filters?: {
    industry?: string;
    formType?: string;
  }): Promise<AIFormTemplate[]> {
    try {
      const filterText = filters
        ? ` for ${filters.industry || filters.formType || "general use"}`
        : "";

      const prompt = `
        Generate 5 professional form templates${filterText}. JSON array:
        [
          {
            "id": "unique-id",
            "name": "Template Name",
            "description": "Template description",
            "category": "contact|survey|registration|feedback|application|booking|other",
            "fieldCount": 5,
            "estimatedTime": "2 minutes",
            "preview": ["Field 1", "Field 2", "Field 3"]
          }
        ]
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text());
    } catch (error) {
      console.error("Gemini templates error:", error);
      return [];
    }
  }

  async improveLabeling(
    elements: FormElementInstance[],
  ): Promise<
    { elementId: string; suggestedLabel: string; reasoning: string }[]
  > {
    try {
      const formData = elements.map((el) => ({
        id: el.id,
        type: el.type,
        currentLabel: el.extraAttributes?.label || "",
        placeholder: el.extraAttributes?.placeholder || "",
      }));

      const prompt = `
        Suggest better labels for these form fields:
        ${JSON.stringify(formData, null, 2)}

        Respond with JSON array:
        [
          {
            "elementId": "field-id",
            "suggestedLabel": "Better Label",
            "reasoning": "Why this label is better"
          }
        ]

        Make labels:
        - Clear and concise
        - User-friendly
        - Accessible
        - Action-oriented when appropriate
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text());
    } catch (error) {
      console.error("Gemini labeling error:", error);
      return [];
    }
  }

  private buildSystemPrompt(): string {
    return `
      You are an expert form designer AI assistant. Your task is to generate professional, user-friendly forms based on user requirements.

      IMPORTANT RULES:
      1. Always respond with valid JSON only
      2. Use only these field types: TextField, NumberField, TextAreaField, SelectField, CheckboxField, DateField
      3. Create logical field order and grouping
      4. Include appropriate validation and required fields
      5. Generate clear, user-friendly labels and placeholders
      6. Consider accessibility and user experience

      Available form elements and their properties:
      - TextField: label, placeholder, required, helperText
      - NumberField: label, placeholder, required, helperText, min, max
      - TextAreaField: label, placeholder, required, helperText, rows
      - SelectField: label, placeholder, required, helperText, options
      - CheckboxField: label, required, helperText
      - DateField: label, placeholder, required, helperText
    `;
  }

  private buildUserPrompt(prompt: AIPrompt): string {
    return `
      Generate a ${prompt.formType} form with the following requirements:

      Description: ${prompt.description}
      Industry: ${prompt.industry || "General"}
      Target Audience: ${prompt.targetAudience || "General users"}
      Maximum Fields: ${prompt.maxFields}
      Include Validation: ${prompt.includeValidation}
      Additional Requirements: ${prompt.additionalRequirements?.join(", ") || "None"}

      Respond with a JSON object in this exact format:
      {
        "title": "Form Title",
        "description": "Form description",
        "fields": [
          {
            "type": "TextField",
            "label": "Field Label",
            "placeholder": "Enter value...",
            "required": true,
            "helperText": "Additional help text",
            "options": ["Option 1", "Option 2"] // Only for SelectField
          }
        ],
        "explanation": "Brief explanation of the form design choices",
        "suggestions": ["Suggestion 1", "Suggestion 2"]
      }
    `;
  }

  private parseFormResponse(
    response: string,
    prompt: AIPrompt,
  ): AIGeneratedForm {
    try {
      // Clean up the response to extract JSON
      let jsonStr = response.trim();

      // Remove code block markers if present
      if (jsonStr.startsWith("```json")) {
        jsonStr = jsonStr.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }

      const parsed = JSON.parse(jsonStr);

      // Convert to FormElementInstance array
      const elements: FormElementInstance[] = parsed.fields.map(
        (field: any) => {
          const elementType = field.type as keyof typeof FormElements;

          console.log("Available FormElements:", Object.keys(FormElements));
          console.log("Requested elementType:", elementType);
          console.log("FormElements[elementType]:", FormElements[elementType]);

          if (!FormElements[elementType]) {
            throw new Error(`Unknown field type: ${field.type}`);
          }

          const formElement = FormElements[elementType];
          console.log("FormElement structure:", formElement);
          console.log("Has construct method:", typeof formElement.construct);

          const element = FormElements[elementType].construct(idGenerator());

          // Set basic properties
          element.extraAttributes = {
            ...element.extraAttributes,
            label: field.label,
            placeholder: field.placeholder || "",
            required: field.required || false,
            helperText: field.helperText || "",
          };

          // Set type-specific properties
          if (field.type === "SelectField" && field.options) {
            element.extraAttributes.options = field.options;
          }

          if (field.type === "NumberField") {
            if (field.min !== undefined)
              element.extraAttributes.min = field.min;
            if (field.max !== undefined)
              element.extraAttributes.max = field.max;
          }

          if (field.type === "TextAreaField" && field.rows) {
            element.extraAttributes.rows = field.rows;
          }

          return element;
        },
      );

      return {
        elements,
        metadata: {
          title: parsed.title,
          description: parsed.description,
          estimatedCompletionTime: Math.max(
            Math.ceil(elements.length * 0.5),
            1,
          ),
          suggestedValidations: [],
          confidence: 0.85,
        },
        explanation:
          parsed.explanation || "Form generated using AI recommendations",
        suggestions: parsed.suggestions || [],
      };
    } catch (error) {
      console.error("Failed to parse Gemini response:", error);
      console.error("Raw response:", response);
      throw this.createAIError(
        "generation_failed",
        "Failed to parse AI response",
        error,
      );
    }
  }

  private createAIError(
    type: AIError["type"],
    message: string,
    originalError?: any,
  ): AIError {
    return {
      type,
      message,
      retryable: type !== "generation_failed",
      fallbackOptions: [
        "Try simplifying your description",
        "Use fewer requirements",
        "Try again in a moment",
      ],
      retryAfter: type === "rate_limit" ? 60 : undefined,
    };
  }
}

// Create singleton instance
let geminiService: GeminiAIService | null = null;

export function createGeminiService(apiKey: string): GeminiAIService {
  if (!geminiService || geminiService["config"].apiKey !== apiKey) {
    geminiService = new GeminiAIService({ apiKey });
  }
  return geminiService;
}

export function getGeminiService(): GeminiAIService | null {
  return geminiService;
}
