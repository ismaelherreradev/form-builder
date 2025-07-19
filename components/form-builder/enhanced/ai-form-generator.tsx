"use client";

import { useState, useCallback, useRef } from "react";
import {
  Bot,
  Wand2,
  Sparkles,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  X,
  Upload,
  FileText,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import { FormElementInstance } from "../elements";
import {
  AIPrompt,
  AIGeneratedForm,
  AIError,
  AIFormTemplate,
} from "@/lib/ai/form-generator";
import useDesigner from "../hooks/useDesigner";

interface AIFormGeneratorProps {
  onFormGenerated?: (elements: FormElementInstance[]) => void;
  onError?: (error: string) => void;
  onClose?: () => void;
}

interface GenerationStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  loading: boolean;
  error?: string;
}

export default function AIFormGenerator({
  onFormGenerated,
  onError,
  onClose,
}: AIFormGeneratorProps) {
  const { setElements } = useDesigner();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<
    "prompt" | "generating" | "preview" | "templates"
  >("prompt");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedForm, setGeneratedForm] = useState<AIGeneratedForm | null>(
    null,
  );
  const [error, setError] = useState<AIError | null>(null);
  const [templates, setTemplates] = useState<AIFormTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // Form state
  const [prompt, setPrompt] = useState<AIPrompt>({
    description: "",
    industry: "",
    formType: "custom",
    targetAudience: "",
    additionalRequirements: [],
    maxFields: 10,
    includeValidation: true,
  });

  const [newRequirement, setNewRequirement] = useState("");
  const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>([
    {
      id: "analyzing",
      title: "Analyzing Requirements",
      description: "Understanding your form requirements and context",
      completed: false,
      loading: false,
    },
    {
      id: "generating",
      title: "Generating Structure",
      description: "Creating form fields and layout based on best practices",
      completed: false,
      loading: false,
    },
    {
      id: "optimizing",
      title: "Optimizing Experience",
      description: "Adding validation rules and improving user experience",
      completed: false,
      loading: false,
    },
    {
      id: "finalizing",
      title: "Finalizing Form",
      description: "Preparing your generated form for use",
      completed: false,
      loading: false,
    },
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle form generation
  const handleGenerate = useCallback(async () => {
    if (!prompt.description.trim()) {
      setError({
        type: "invalid_prompt",
        message: "Please provide a description for your form",
        retryable: false,
        fallbackOptions: [
          "Add a detailed description of what your form should do",
        ],
      });
      return;
    }

    setIsGenerating(true);
    setCurrentStep("generating");
    setError(null);
    setGenerationProgress(0);

    try {
      // Reset steps
      setGenerationSteps((prev) =>
        prev.map((step) => ({
          ...step,
          completed: false,
          loading: false,
          error: undefined,
        })),
      );

      // Simulate generation steps
      for (let i = 0; i < generationSteps.length; i++) {
        setGenerationSteps((prev) =>
          prev.map((step, index) => ({
            ...step,
            loading: index === i,
            completed: index < i,
          })),
        );

        setGenerationProgress(((i + 1) / generationSteps.length) * 100);

        // Simulate API delay
        await new Promise((resolve) =>
          setTimeout(resolve, 800 + Math.random() * 400),
        );
      }

      // Call AI API
      const response = await fetch("/api/ai/generate-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prompt),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || "Generation failed");
      }

      // Mark all steps as completed
      setGenerationSteps((prev) =>
        prev.map((step) => ({ ...step, completed: true, loading: false })),
      );
      setGenerationProgress(100);

      setGeneratedForm(result.data);
      setCurrentStep("preview");
    } catch (err) {
      console.error("Form generation error:", err);

      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError({
        type: "generation_failed",
        message: errorMessage,
        retryable: true,
        fallbackOptions: [
          "Try with a simpler description",
          "Use a form template instead",
        ],
      });

      // Mark current step as failed
      setGenerationSteps((prev) =>
        prev.map((step, index) => ({
          ...step,
          loading: false,
          error: step.loading ? errorMessage : undefined,
        })),
      );
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, generationSteps.length]);

  // Load templates
  const loadTemplates = useCallback(async () => {
    setLoadingTemplates(true);
    try {
      const response = await fetch("/api/ai/generate-form");
      const result = await response.json();

      if (response.ok) {
        setTemplates(result.data || []);
      }
    } catch (err) {
      console.error("Failed to load templates:", err);
    } finally {
      setLoadingTemplates(false);
    }
  }, []);

  // Handle template selection
  const handleTemplateSelect = useCallback(
    async (template: AIFormTemplate) => {
      try {
        // In a real implementation, this would load the template elements
        // For now, we'll simulate it
        const simulatedForm: AIGeneratedForm = {
          elements: [],
          metadata: {
            title: template.name,
            description: template.description,
            estimatedCompletionTime: 3,
            suggestedValidations: [],
            confidence: 0.95,
          },
          explanation: `Using the ${template.name} template which is optimized for ${template.industry} use cases.`,
          suggestions: [
            "Customize field labels to match your brand",
            "Add your company logo and styling",
            "Test the form with real users",
          ],
        };

        setGeneratedForm(simulatedForm);
        setCurrentStep("preview");
      } catch (err) {
        console.error("Template selection error:", err);
        onError?.("Failed to load template");
      }
    },
    [onError],
  );

  // Accept generated form
  const handleAcceptForm = useCallback(() => {
    if (!generatedForm) return;

    setElements(generatedForm.elements);
    onFormGenerated?.(generatedForm.elements);
    setIsOpen(false);
    setCurrentStep("prompt");
    setGeneratedForm(null);
  }, [generatedForm, setElements, onFormGenerated]);

  // Add requirement
  const handleAddRequirement = useCallback(() => {
    if (newRequirement.trim()) {
      setPrompt((prev) => ({
        ...prev,
        additionalRequirements: [
          ...(prev.additionalRequirements || []),
          newRequirement.trim(),
        ],
      }));
      setNewRequirement("");
    }
  }, [newRequirement]);

  // Remove requirement
  const handleRemoveRequirement = useCallback((index: number) => {
    setPrompt((prev) => ({
      ...prev,
      additionalRequirements:
        prev.additionalRequirements?.filter((_, i) => i !== index) || [],
    }));
  }, []);

  // Reset form
  const handleReset = useCallback(() => {
    setCurrentStep("prompt");
    setGeneratedForm(null);
    setError(null);
    setIsGenerating(false);
    setGenerationProgress(0);
  }, []);

  // File import (placeholder)
  const handleFileImport = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        // Placeholder for file processing
        console.log("File selected:", file.name);
        // In a real implementation, you would parse the file and extract form requirements
      }
    },
    [],
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Bot className="h-4 w-4" />
            AI Form Generator
            <Badge variant="secondary" className="ml-1">
              Beta
            </Badge>
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Form Generator
            </DialogTitle>
            <DialogDescription>
              Create professional forms using AI. Describe what you need and let
              AI build it for you.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            <Tabs value={currentStep} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="prompt" disabled={isGenerating}>
                  1. Describe Form
                </TabsTrigger>
                <TabsTrigger value="templates" onClick={loadTemplates}>
                  2. Templates
                </TabsTrigger>
                <TabsTrigger value="generating" disabled>
                  3. Generate
                </TabsTrigger>
                <TabsTrigger value="preview" disabled={!generatedForm}>
                  4. Preview
                </TabsTrigger>
              </TabsList>

              {/* Prompt Tab */}
              <TabsContent
                value="prompt"
                className="flex-1 overflow-auto space-y-6"
              >
                <div className="grid gap-6">
                  {/* Main Description */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="description"
                      className="text-base font-medium"
                    >
                      Describe your form *
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="I need a contact form for my restaurant website that collects customer reservations..."
                      value={prompt.description}
                      onChange={(e) =>
                        setPrompt((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="min-h-[100px] resize-none"
                      maxLength={500}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        Be specific about what information you need to collect
                      </span>
                      <span>{prompt.description.length}/500</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Form Type */}
                    <div className="space-y-2">
                      <Label htmlFor="formType">Form Type</Label>
                      <Select
                        value={prompt.formType}
                        onValueChange={(value: any) =>
                          setPrompt((prev) => ({ ...prev, formType: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select form type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="contact">Contact Form</SelectItem>
                          <SelectItem value="survey">Survey</SelectItem>
                          <SelectItem value="registration">
                            Registration
                          </SelectItem>
                          <SelectItem value="feedback">Feedback</SelectItem>
                          <SelectItem value="application">
                            Application
                          </SelectItem>
                          <SelectItem value="booking">Booking</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Industry */}
                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry (Optional)</Label>
                      <Input
                        id="industry"
                        placeholder="e.g., Restaurant, Healthcare, Education"
                        value={prompt.industry}
                        onChange={(e) =>
                          setPrompt((prev) => ({
                            ...prev,
                            industry: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Target Audience */}
                    <div className="space-y-2">
                      <Label htmlFor="audience">
                        Target Audience (Optional)
                      </Label>
                      <Input
                        id="audience"
                        placeholder="e.g., Customers, Students, Job applicants"
                        value={prompt.targetAudience}
                        onChange={(e) =>
                          setPrompt((prev) => ({
                            ...prev,
                            targetAudience: e.target.value,
                          }))
                        }
                      />
                    </div>

                    {/* Max Fields */}
                    <div className="space-y-2">
                      <Label htmlFor="maxFields">Maximum Fields</Label>
                      <Input
                        id="maxFields"
                        type="number"
                        min="1"
                        max="20"
                        value={prompt.maxFields}
                        onChange={(e) =>
                          setPrompt((prev) => ({
                            ...prev,
                            maxFields: parseInt(e.target.value) || 10,
                          }))
                        }
                      />
                    </div>
                  </div>

                  {/* Additional Requirements */}
                  <div className="space-y-3">
                    <Label>Additional Requirements</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add specific requirement..."
                        value={newRequirement}
                        onChange={(e) => setNewRequirement(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleAddRequirement()
                        }
                      />
                      <Button
                        type="button"
                        onClick={handleAddRequirement}
                        disabled={!newRequirement.trim()}
                      >
                        Add
                      </Button>
                    </div>
                    {prompt.additionalRequirements &&
                      prompt.additionalRequirements.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {prompt.additionalRequirements.map((req, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="gap-1"
                            >
                              {req}
                              <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => handleRemoveRequirement(index)}
                              />
                            </Badge>
                          ))}
                        </div>
                      )}
                  </div>

                  {/* Options */}
                  <div className="space-y-3">
                    <Label>Options</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="validation"
                        checked={prompt.includeValidation}
                        onCheckedChange={(checked) =>
                          setPrompt((prev) => ({
                            ...prev,
                            includeValidation: !!checked,
                          }))
                        }
                      />
                      <Label htmlFor="validation" className="text-sm">
                        Include smart validation rules
                      </Label>
                    </div>
                  </div>

                  {/* Import Options */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">
                        Import from Document
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-xs text-muted-foreground">
                        Have existing form requirements in a document? Upload it
                        and AI will extract the requirements.
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleFileImport}
                          className="gap-2"
                        >
                          <Upload className="h-4 w-4" />
                          Upload Document
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                          <FileText className="h-4 w-4" />
                          Paste Text
                        </Button>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".txt,.doc,.docx,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Error Display */}
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {error.message}
                      {error.fallbackOptions.length > 0 && (
                        <div className="mt-2">
                          <strong>Suggestions:</strong>
                          <ul className="list-disc list-inside mt-1">
                            {error.fallbackOptions.map((option, index) => (
                              <li key={index} className="text-xs">
                                {option}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Generate Button */}
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep("templates")}
                  >
                    Browse Templates
                  </Button>
                  <Button
                    onClick={handleGenerate}
                    disabled={!prompt.description.trim() || isGenerating}
                    className="gap-2"
                  >
                    <Wand2 className="h-4 w-4" />
                    {isGenerating ? "Generating..." : "Generate Form"}
                  </Button>
                </div>
              </TabsContent>

              {/* Templates Tab */}
              <TabsContent value="templates" className="flex-1 overflow-auto">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Form Templates</h3>
                      <p className="text-sm text-muted-foreground">
                        Start with a pre-built template and customize as needed
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={loadTemplates}
                      disabled={loadingTemplates}
                    >
                      <RefreshCw
                        className={cn(
                          "h-4 w-4 mr-2",
                          loadingTemplates && "animate-spin",
                        )}
                      />
                      Refresh
                    </Button>
                  </div>

                  {loadingTemplates ? (
                    <div className="grid grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="animate-pulse">
                          <CardHeader>
                            <div className="h-4 bg-muted rounded w-3/4"></div>
                            <div className="h-3 bg-muted rounded w-1/2"></div>
                          </CardHeader>
                          <CardContent>
                            <div className="h-16 bg-muted rounded"></div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {templates.map((template) => (
                        <Card
                          key={template.id}
                          className="cursor-pointer hover:bg-accent transition-colors"
                          onClick={() => handleTemplateSelect(template)}
                        >
                          <CardHeader>
                            <CardTitle className="text-base">
                              {template.name}
                            </CardTitle>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Badge variant="outline">
                                {template.industry}
                              </Badge>
                              <Badge variant="outline">
                                {template.formType}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground mb-3">
                              {template.description}
                            </p>
                            <div className="flex items-center justify-between text-xs">
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                {template.popularity}% rating
                              </span>
                              <span>{template.useCount} uses</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {!loadingTemplates && templates.length === 0 && (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                      <h4 className="text-lg font-semibold text-muted-foreground mb-2">
                        No Templates Available
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Templates are not currently available. Try creating a
                        custom form instead.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Generating Tab */}
              <TabsContent
                value="generating"
                className="flex-1 flex flex-col items-center justify-center space-y-6"
              >
                <div className="text-center space-y-4">
                  <div className="relative">
                    <Bot className="h-16 w-16 text-primary mx-auto animate-pulse" />
                    <Sparkles className="h-6 w-6 text-yellow-500 absolute -top-1 -right-1 animate-bounce" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      Generating Your Form
                    </h3>
                    <p className="text-muted-foreground">
                      AI is crafting the perfect form for your needs...
                    </p>
                  </div>
                </div>

                <div className="w-full max-w-md space-y-4">
                  <Progress value={generationProgress} className="w-full" />
                  <div className="text-center text-sm text-muted-foreground">
                    {Math.round(generationProgress)}% Complete
                  </div>
                </div>

                <div className="space-y-3 w-full max-w-md">
                  {generationSteps.map((step, index) => (
                    <div
                      key={step.id}
                      className="flex items-center gap-3 p-3 rounded-lg border"
                    >
                      <div className="flex-shrink-0">
                        {step.completed ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : step.loading ? (
                          <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                        ) : step.error ? (
                          <AlertCircle className="h-5 w-5 text-destructive" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-muted" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{step.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {step.description}
                        </div>
                        {step.error && (
                          <div className="text-xs text-destructive mt-1">
                            {step.error}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Preview Tab */}
              <TabsContent
                value="preview"
                className="flex-1 overflow-auto space-y-4"
              >
                {generatedForm && (
                  <div className="space-y-6">
                    {/* Form Info */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              {generatedForm.metadata.title}
                              <Badge variant="secondary" className="text-xs">
                                {Math.round(
                                  generatedForm.metadata.confidence * 100,
                                )}
                                % confidence
                              </Badge>
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                              {generatedForm.metadata.description}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Elements:</span>{" "}
                            {generatedForm.elements.length}
                          </div>
                          <div>
                            <span className="font-medium">Est. Time:</span>{" "}
                            {generatedForm.metadata.estimatedCompletionTime} min
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <h4 className="font-medium mb-2">AI Explanation</h4>
                          <p className="text-sm text-muted-foreground">
                            {generatedForm.explanation}
                          </p>
                        </div>

                        {generatedForm.suggestions.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Suggestions</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {generatedForm.suggestions.map(
                                (suggestion, index) => (
                                  <li
                                    key={index}
                                    className="flex items-start gap-2"
                                  >
                                    <span className="text-primary">•</span>
                                    {suggestion}
                                  </li>
                                ),
                              )}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Form Elements Preview */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">
                          Generated Elements
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-40">
                          <div className="space-y-2">
                            {generatedForm.elements.map((element, index) => (
                              <div
                                key={element.id}
                                className="flex items-center gap-3 p-2 border rounded"
                              >
                                <Badge variant="outline" className="text-xs">
                                  {index + 1}
                                </Badge>
                                <div className="flex-1">
                                  <div className="font-medium text-sm">
                                    {element.type}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {element.extraAttributes?.label ||
                                      element.extraAttributes?.title ||
                                      "No label"}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-between">
                      <Button variant="outline" onClick={handleReset}>
                        Start Over
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setCurrentStep("prompt")}
                        >
                          Modify Prompt
                        </Button>
                        <Button onClick={handleAcceptForm} className="gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Use This Form
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
