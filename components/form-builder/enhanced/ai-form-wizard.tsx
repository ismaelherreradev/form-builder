"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
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
  Zap,
  Brain,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Star,
  Clock,
  Users,
  Target,
  Building,
  ChevronDown,
  Plus,
  Minus,
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
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

import { FormElementInstance } from "../elements";
import {
  AIPrompt,
  AIGeneratedForm,
  AIError,
  AIFormTemplate,
} from "@/lib/ai/form-generator";
import useDesigner from "../hooks/useDesigner";

interface AIFormWizardProps {
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
  progress: number;
}

interface FormRequirement {
  id: string;
  text: string;
  priority: "high" | "medium" | "low";
}

export default function AIFormWizard({
  onFormGenerated,
  onError,
  onClose,
}: AIFormWizardProps) {
  const { setElements } = useDesigner();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<
    "input" | "generating" | "preview" | "refine"
  >("input");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedForm, setGeneratedForm] = useState<AIGeneratedForm | null>(
    null,
  );
  const [error, setError] = useState<AIError | null>(null);

  // Enhanced form state
  const [prompt, setPrompt] = useState<AIPrompt & { title?: string }>({
    title: "",
    description: "",
    industry: "",
    formType: "custom",
    targetAudience: "",
    additionalRequirements: [],
    maxFields: 10,
    includeValidation: true,
  });

  const [requirements, setRequirements] = useState<FormRequirement[]>([]);
  const [newRequirement, setNewRequirement] = useState("");
  const [advancedOptions, setAdvancedOptions] = useState({
    includeProgressBar: false,
    multiStep: false,
    includeFileUpload: false,
    includePayment: false,
    includeSignature: false,
    mobileOptimized: true,
    accessibilityCompliant: true,
  });

  const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>([
    {
      id: "analyzing",
      title: "Analyzing Requirements",
      description: "Understanding your form requirements and context",
      completed: false,
      loading: false,
      progress: 0,
    },
    {
      id: "structure",
      title: "Building Structure",
      description: "Creating form fields and logical flow",
      completed: false,
      loading: false,
      progress: 0,
    },
    {
      id: "optimization",
      title: "Optimizing UX",
      description: "Enhancing user experience and validation",
      completed: false,
      loading: false,
      progress: 0,
    },
    {
      id: "finalizing",
      title: "Finalizing Form",
      description: "Applying final touches and accessibility features",
      completed: false,
      loading: false,
      progress: 0,
    },
  ]);

  const [realTimeUpdates, setRealTimeUpdates] = useState<string[]>([]);

  // Handle form generation with enhanced UI feedback
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
    setRealTimeUpdates([]);

    try {
      // Reset steps
      setGenerationSteps((prev) =>
        prev.map((step) => ({
          ...step,
          completed: false,
          loading: false,
          error: undefined,
          progress: 0,
        })),
      );

      // Enhanced generation process with real-time updates
      for (let i = 0; i < generationSteps.length; i++) {
        const currentStepData = generationSteps[i];

        // Start current step
        setGenerationSteps((prev) =>
          prev.map((step, index) => ({
            ...step,
            loading: index === i,
            completed: index < i,
          })),
        );

        // Add real-time update
        setRealTimeUpdates((prev) => [
          ...prev,
          `Starting: ${currentStepData.title}`,
        ]);

        // Simulate step progress with micro-updates
        for (let progress = 0; progress <= 100; progress += 20) {
          await new Promise((resolve) => setTimeout(resolve, 200));

          setGenerationSteps((prev) =>
            prev.map((step, index) => ({
              ...step,
              progress: index === i ? progress : step.progress,
            })),
          );

          setGenerationProgress((i * 100 + progress) / generationSteps.length);

          // Add progress updates
          if (progress === 50) {
            setRealTimeUpdates((prev) => [
              ...prev,
              `Processing: ${currentStepData.description}`,
            ]);
          } else if (progress === 100) {
            setRealTimeUpdates((prev) => [
              ...prev,
              `Completed: ${currentStepData.title}`,
            ]);
          }
        }
      }

      // Prepare the enhanced prompt
      const enhancedPrompt = {
        ...prompt,
        additionalRequirements: [
          ...(prompt.additionalRequirements || []),
          ...requirements.map((req) => req.text),
          ...(advancedOptions.includeProgressBar
            ? ["Include progress indicator"]
            : []),
          ...(advancedOptions.multiStep ? ["Multi-step form"] : []),
          ...(advancedOptions.includeFileUpload
            ? ["File upload capability"]
            : []),
          ...(advancedOptions.includePayment ? ["Payment integration"] : []),
          ...(advancedOptions.includeSignature ? ["Digital signature"] : []),
          ...(advancedOptions.mobileOptimized
            ? ["Mobile-optimized design"]
            : []),
          ...(advancedOptions.accessibilityCompliant
            ? ["Accessibility compliant"]
            : []),
        ],
      };

      setRealTimeUpdates((prev) => [...prev, "Sending request to AI..."]);

      // Call AI API
      const response = await fetch("/api/ai/generate-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(enhancedPrompt),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || "Generation failed");
      }

      setRealTimeUpdates((prev) => [...prev, "Form generated successfully!"]);

      // Mark all steps as completed
      setGenerationSteps((prev) =>
        prev.map((step) => ({
          ...step,
          completed: true,
          loading: false,
          progress: 100,
        })),
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
          "Reduce the number of requirements",
          "Use basic options instead",
        ],
      });

      setRealTimeUpdates((prev) => [...prev, `Error: ${errorMessage}`]);

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
  }, [prompt, requirements, advancedOptions, generationSteps.length]);

  // Add requirement
  const addRequirement = useCallback(() => {
    if (newRequirement.trim()) {
      const requirement: FormRequirement = {
        id: Date.now().toString(),
        text: newRequirement.trim(),
        priority: "medium",
      };
      setRequirements((prev) => [...prev, requirement]);
      setNewRequirement("");
    }
  }, [newRequirement]);

  // Remove requirement
  const removeRequirement = useCallback((id: string) => {
    setRequirements((prev) => prev.filter((req) => req.id !== id));
  }, []);

  // Update requirement priority
  const updateRequirementPriority = useCallback(
    (id: string, priority: "high" | "medium" | "low") => {
      setRequirements((prev) =>
        prev.map((req) => (req.id === id ? { ...req, priority } : req)),
      );
    },
    [],
  );

  // Accept generated form
  const handleAcceptForm = useCallback(() => {
    if (!generatedForm) return;

    setElements(generatedForm.elements);
    onFormGenerated?.(generatedForm.elements);
    setIsOpen(false);
    setCurrentStep("input");
    setGeneratedForm(null);
  }, [generatedForm, setElements, onFormGenerated]);

  // Reset form
  const handleReset = useCallback(() => {
    setCurrentStep("input");
    setGeneratedForm(null);
    setError(null);
    setIsGenerating(false);
    setGenerationProgress(0);
    setRealTimeUpdates([]);
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-red-200 bg-red-50 text-red-700";
      case "medium":
        return "border-yellow-200 bg-yellow-50 text-yellow-700";
      case "low":
        return "border-blue-200 bg-blue-50 text-blue-700";
      default:
        return "border-gray-200 bg-gray-50 text-gray-700";
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
            <Brain className="h-4 w-4" />
            AI Form Generator
            <Badge variant="secondary" className="ml-1 bg-white/20 text-white">
              Beta
            </Badge>
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600">
                <Brain className="h-5 w-5 text-white" />
              </div>
              AI Form Generator
            </DialogTitle>
            <DialogDescription>
              Let AI create a professional form tailored to your specific needs.
              Describe your requirements and watch as AI builds your form in
              real-time.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            {/* Step Indicator */}
            <div className="flex items-center justify-center space-x-2 mb-6">
              {[
                { id: "input", label: "Input", icon: FileText },
                { id: "generating", label: "Generating", icon: Zap },
                { id: "preview", label: "Preview", icon: CheckCircle },
                { id: "refine", label: "Refine", icon: Star },
              ].map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted =
                  ["input", "generating", "preview"].indexOf(currentStep) >
                  ["input", "generating", "preview"].indexOf(step.id);

                return (
                  <React.Fragment key={step.id}>
                    <div
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg transition-all",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : isCompleted
                            ? "bg-green-100 text-green-700"
                            : "bg-muted text-muted-foreground",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{step.label}</span>
                    </div>
                    {index < 3 && (
                      <ArrowRight
                        className={cn(
                          "h-4 w-4",
                          isCompleted
                            ? "text-green-500"
                            : "text-muted-foreground",
                        )}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            <ScrollArea className="flex-1">
              {/* Input Step */}
              {currentStep === "input" && (
                <div className="space-y-6 p-1">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Basic Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="formTitle">Form Title *</Label>
                          <Input
                            id="formTitle"
                            placeholder="e.g., Customer Registration Form"
                            value={prompt.title || ""}
                            onChange={(e) =>
                              setPrompt((prev) => ({
                                ...prev,
                                title: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="formType">Form Type</Label>
                          <Select
                            value={prompt.formType}
                            onValueChange={(value: any) =>
                              setPrompt((prev) => ({
                                ...prev,
                                formType: value,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select form type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="contact">
                                Contact Form
                              </SelectItem>
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
                      </div>

                      <div>
                        <Label htmlFor="description">
                          Detailed Description *
                        </Label>
                        <Textarea
                          id="description"
                          placeholder="Describe what your form should do, what information you need to collect, and any specific requirements..."
                          value={prompt.description}
                          onChange={(e) =>
                            setPrompt((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          className="min-h-[100px] resize-none"
                          maxLength={1000}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>
                            Be specific about your requirements for better
                            results
                          </span>
                          <span>{prompt.description.length}/1000</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="industry">
                            <Building className="h-4 w-4 inline mr-1" />
                            Industry
                          </Label>
                          <Input
                            id="industry"
                            placeholder="e.g., Healthcare, E-commerce, Education"
                            value={prompt.industry}
                            onChange={(e) =>
                              setPrompt((prev) => ({
                                ...prev,
                                industry: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="audience">
                            <Users className="h-4 w-4 inline mr-1" />
                            Target Audience
                          </Label>
                          <Input
                            id="audience"
                            placeholder="e.g., Customers, Employees, Students"
                            value={prompt.targetAudience}
                            onChange={(e) =>
                              setPrompt((prev) => ({
                                ...prev,
                                targetAudience: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Requirements & Features
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Add Specific Requirements</Label>
                        <div className="flex gap-2 mt-2">
                          <Input
                            placeholder="e.g., Include file upload for documents"
                            value={newRequirement}
                            onChange={(e) => setNewRequirement(e.target.value)}
                            onKeyPress={(e) =>
                              e.key === "Enter" && addRequirement()
                            }
                          />
                          <Button
                            type="button"
                            onClick={addRequirement}
                            disabled={!newRequirement.trim()}
                          >
                            Add
                          </Button>
                        </div>
                      </div>

                      {requirements.length > 0 && (
                        <div className="space-y-2">
                          <Label>Requirements ({requirements.length})</Label>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {requirements.map((req) => (
                              <div
                                key={req.id}
                                className={cn(
                                  "flex items-center gap-2 p-2 rounded border",
                                  getPriorityColor(req.priority),
                                )}
                              >
                                <Select
                                  value={req.priority}
                                  onValueChange={(value: any) =>
                                    updateRequirementPriority(req.id, value)
                                  }
                                >
                                  <SelectTrigger className="w-20 h-6">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="medium">
                                      Medium
                                    </SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                  </SelectContent>
                                </Select>
                                <span className="flex-1 text-sm">
                                  {req.text}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeRequirement(req.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <Separator />

                      <Collapsible>
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            className="w-full justify-between"
                          >
                            Advanced Options
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-3 mt-3">
                          <div className="grid grid-cols-2 gap-3">
                            {Object.entries({
                              includeProgressBar: "Progress indicator",
                              multiStep: "Multi-step form",
                              includeFileUpload: "File upload",
                              includePayment: "Payment integration",
                              includeSignature: "Digital signature",
                              mobileOptimized: "Mobile optimized",
                              accessibilityCompliant: "Accessibility compliant",
                            }).map(([key, label]) => (
                              <div
                                key={key}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={key}
                                  checked={
                                    advancedOptions[
                                      key as keyof typeof advancedOptions
                                    ]
                                  }
                                  onCheckedChange={(checked) =>
                                    setAdvancedOptions((prev) => ({
                                      ...prev,
                                      [key]: !!checked,
                                    }))
                                  }
                                />
                                <Label htmlFor={key} className="text-sm">
                                  {label}
                                </Label>
                              </div>
                            ))}
                          </div>

                          <div>
                            <Label className="text-sm">
                              Maximum Fields: {prompt.maxFields}
                            </Label>
                            <Slider
                              value={[prompt.maxFields || 10]}
                              onValueChange={(value) =>
                                setPrompt((prev) => ({
                                  ...prev,
                                  maxFields: value[0],
                                }))
                              }
                              min={1}
                              max={25}
                              step={1}
                              className="mt-2"
                            />
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </CardContent>
                  </Card>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {error.message}
                        {error.fallbackOptions && (
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

                  <div className="flex justify-end">
                    <Button
                      onClick={handleGenerate}
                      disabled={!prompt.description.trim() || isGenerating}
                      className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      <Sparkles className="h-4 w-4" />
                      Generate Form with AI
                    </Button>
                  </div>
                </div>
              )}

              {/* Generating Step */}
              {currentStep === "generating" && (
                <div className="flex flex-col items-center justify-center space-y-6 p-8">
                  <div className="relative">
                    <div className="absolute inset-0 animate-ping rounded-full bg-gradient-to-r from-purple-600 to-blue-600 opacity-20"></div>
                    <div className="relative p-4 rounded-full bg-gradient-to-r from-purple-600 to-blue-600">
                      <Brain className="h-8 w-8 text-white animate-pulse" />
                    </div>
                  </div>

                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-semibold">
                      AI is Creating Your Form
                    </h3>
                    <p className="text-muted-foreground">
                      Please wait while our AI analyzes your requirements and
                      builds your form...
                    </p>
                  </div>

                  <div className="w-full max-w-md space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Overall Progress</span>
                      <span>{Math.round(generationProgress)}%</span>
                    </div>
                    <Progress value={generationProgress} className="h-2" />
                  </div>

                  <div className="space-y-4 w-full max-w-lg">
                    {generationSteps.map((step, index) => (
                      <div
                        key={step.id}
                        className={cn(
                          "flex items-center gap-3 p-4 rounded-lg border transition-all",
                          step.loading ? "border-primary bg-primary/5" : "",
                          step.completed ? "border-green-200 bg-green-50" : "",
                          step.error ? "border-red-200 bg-red-50" : "",
                        )}
                      >
                        <div className="flex-shrink-0">
                          {step.completed ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : step.loading ? (
                            <Loader2 className="h-5 w-5 text-primary animate-spin" />
                          ) : step.error ? (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          ) : (
                            <div className="h-5 w-5 rounded-full border-2 border-muted" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {step.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {step.description}
                          </div>
                          {step.loading && (
                            <div className="mt-2">
                              <Progress value={step.progress} className="h-1" />
                            </div>
                          )}
                          {step.error && (
                            <div className="text-xs text-red-600 mt-1">
                              {step.error}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {realTimeUpdates.length > 0 && (
                    <Card className="w-full max-w-lg">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Real-time Updates
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-24">
                          <div className="space-y-1">
                            {realTimeUpdates.slice(-5).map((update, index) => (
                              <div
                                key={index}
                                className="text-xs text-muted-foreground animate-in slide-in-from-bottom-2"
                              >
                                • {update}
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  )}

                  <Button
                    variant="outline"
                    onClick={handleReset}
                    disabled={isGenerating}
                  >
                    Cancel Generation
                  </Button>
                </div>
              )}

              {/* Preview Step */}
              {currentStep === "preview" && generatedForm && (
                <div className="space-y-6 p-1">
                  <div className="flex items-center justify-center">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-6 w-6" />
                      <span className="font-semibold">
                        Form Generated Successfully!
                      </span>
                    </div>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {generatedForm.metadata.title}
                        <Badge variant="secondary" className="ml-auto">
                          {Math.round(generatedForm.metadata.confidence * 100)}%
                          confidence
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {generatedForm.metadata.description}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-semibold text-lg">
                            {generatedForm.elements.length}
                          </div>
                          <div className="text-muted-foreground">Fields</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-lg">
                            {generatedForm.metadata.estimatedCompletionTime}
                          </div>
                          <div className="text-muted-foreground">
                            Min to complete
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-lg">
                            {generatedForm.metadata.suggestedValidations.length}
                          </div>
                          <div className="text-muted-foreground">
                            Validations
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Brain className="h-4 w-4" />
                          AI Explanation
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {generatedForm.explanation}
                        </p>
                      </div>

                      {generatedForm.suggestions.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Star className="h-4 w-4" />
                            Recommendations
                          </h4>
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

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Form Elements Preview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-48">
                        <div className="space-y-2">
                          {generatedForm.elements.map((element, index) => (
                            <div
                              key={element.id}
                              className="flex items-center gap-3 p-3 border rounded-lg"
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
                              {element.extraAttributes?.required && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  Required
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={handleReset}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Start Over
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentStep("refine")}
                      >
                        Refine Form
                      </Button>
                      <Button onClick={handleAcceptForm} className="gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Use This Form
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Refine Step */}
              {currentStep === "refine" && generatedForm && (
                <div className="space-y-6 p-1">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">
                      Refine Your Form
                    </h3>
                    <p className="text-muted-foreground">
                      Make adjustments to better match your requirements
                    </p>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Adjustments</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add more fields
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                        >
                          <Minus className="h-4 w-4 mr-2" />
                          Remove unnecessary fields
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Regenerate with different style
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep("preview")}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Preview
                    </Button>
                    <Button onClick={handleAcceptForm} className="gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Accept Form
                    </Button>
                  </div>
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
