import { GetFormById } from "@/actions/form";

import EnhancedFormBuilderWrapper from "@/components/form-builder/enhanced/enhanced-form-builder-wrapper";
import DesignerContextProvider from "@/components/form-builder/context/designer";
import { FormElementInstance } from "@/components/form-builder/elements";

export default async function BuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const form = await GetFormById(Number(id));

  if (!form) {
    throw new Error("form not found");
  }

  const initialElements: FormElementInstance[] = form.content
    ? JSON.parse(form.content)
    : [];

  return (
    <DesignerContextProvider>
      <EnhancedFormBuilderWrapper
        formId={form.id.toString()}
        initialElements={initialElements}
        enableAI={true}
        enablePerformanceMonitoring={true}
      />
    </DesignerContextProvider>
  );
}
