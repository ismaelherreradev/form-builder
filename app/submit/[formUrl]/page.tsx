import { GetFormContentByUrl } from "@/actions/form";

import { FormElementInstance } from "@/components/form-builder/elements";
import FormSubmitComponent from "@/components/form-builder/submit-component";

export default async function SubmitPage({
  params,
}: {
  params: Promise<{
    formUrl: string;
  }>;
}) {
  const { formUrl } = await params;
  const form = await GetFormContentByUrl(formUrl);

  if (!form) {
    throw new Error("form not found");
  }

  const formContent = JSON.parse(form.content) as FormElementInstance[];
  return <FormSubmitComponent formUrl={formUrl} content={formContent} />;
}
