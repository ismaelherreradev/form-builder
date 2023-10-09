import * as z from "zod"

export const formSchema = z.object({
  name: z.string().min(4, "Name must be at least 4 characters long"),
  description: z.string().optional(),
})

export type FormSchemaType = z.infer<typeof formSchema>
