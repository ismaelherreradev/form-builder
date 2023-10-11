import { GetGorms } from "@/actions/form"

import FormCard from "./form-card"

export default async function FormCards() {
  const forms = await GetGorms()
  return (
    <>
      {forms.map((form) => (
        <FormCard key={form.id} form={form} />
      ))}
    </>
  )
}
