"use client";

import { useState, useCallback } from "react";
import { FormElementInstance } from "../elements";
import EnhancedFormBuilder from "./enhanced-form-builder";
import { UpdateFormContent, PublishForm } from "@/actions/form";
import { toast } from "@/components/ui/use-toast";

interface EnhancedFormBuilderWrapperProps {
  formId: string;
  initialElements: FormElementInstance[];
  enableAI?: boolean;
  enablePerformanceMonitoring?: boolean;
  className?: string;
}

export default function EnhancedFormBuilderWrapper({
  formId,
  initialElements,
  enableAI = true,
  enablePerformanceMonitoring = false,
  className,
}: EnhancedFormBuilderWrapperProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const handleSave = useCallback(async (elements: FormElementInstance[]) => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      const jsonElements = JSON.stringify(elements);
      await UpdateFormContent(parseInt(formId), jsonElements);

      toast({
        title: "Success",
        description: "Your form has been saved!",
      });
    } catch (error) {
      console.error("Error saving form:", error);
      toast({
        title: "Error",
        description: "Something went wrong while saving your form",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [formId, isSaving]);

  const handlePreview = useCallback((elements: FormElementInstance[]) => {
    // Open preview in a new window/tab
    const previewUrl = `/forms/${formId}?preview=true`;
    window.open(previewUrl, "_blank", "width=1200,height=800");

    toast({
      title: "Preview opened",
      description: "Your form preview has been opened in a new tab",
    });
  }, [formId]);

  const handlePublish = useCallback(async (elements: FormElementInstance[]) => {
    if (isPublishing) return;

    setIsPublishing(true);
    try {
      // First save the current content
      const jsonElements = JSON.stringify(elements);
      await UpdateFormContent(parseInt(formId), jsonElements);

      // Then publish the form
      await PublishForm(parseInt(formId));

      toast({
        title: "Success",
        description: "Your form has been published!",
      });

      // Optionally redirect or refresh to show published state
      window.location.reload();
    } catch (error) {
      console.error("Error publishing form:", error);
      toast({
        title: "Error",
        description: "Something went wrong while publishing your form",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  }, [formId, isPublishing]);

  return (
    <EnhancedFormBuilder
      formId={formId}
      initialElements={initialElements}
      onSave={handleSave}
      onPreview={handlePreview}
      onPublish={handlePublish}
      enableAI={enableAI}
      enablePerformanceMonitoring={enablePerformanceMonitoring}
      className={className}
    />
  );
}
