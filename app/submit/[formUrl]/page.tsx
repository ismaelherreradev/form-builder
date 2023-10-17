import { GetFormContentByUrl } from "@/actions/form"

import { FormElementInstance } from "@/components/form-builder/elements"
import FormSubmitComponent from "@/components/form-builder/submit-component"

export default async function SubmitPage({
  params,
}: {
  params: {
    formUrl: string
  }
}) {
  const form = await GetFormContentByUrl(params.formUrl)

  if (!form) {
    throw new Error("form not found")
  }

  const formContent = JSON.parse(form.content) as FormElementInstance[]
  return <FormSubmitComponent formUrl={params.formUrl} content={formContent} />
}
