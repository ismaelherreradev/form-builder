import { ReactNode } from "react"
import { GetFormById } from "@/actions/form"
import { format } from "date-fns"
import { Badge } from "lucide-react"

import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import FormBuilder from "@/components/form-builder/builder"
import { ElementsType } from "@/components/form-builder/elements"
import VisitButton from "@/components/form-builder/visit-botton"

// function RowCell({ type, value }: { type: ElementsType; value: string }) {
//   let node: ReactNode = value

//   switch (type) {
//     case "DateField":
//       if (!value) break
//       const date = new Date(value)
//       node = <Badge variant={"outline"}>{format(date, "dd/MM/yyyy")}</Badge>
//       break
//     case "CheckboxField":
//       const checked = value === "true"
//       node = <Checkbox checked={checked} disabled />
//       break
//   }

//   return <TableCell>{node}</TableCell>
// }

export default async function FormPage({ params }: { params: { id: string } }) {
  const { id } = params
  const form = await GetFormById(Number(id))

  if (!form) {
    throw new Error("form not found")
  }

  const { visits, submissions } = form

  let submissionRate = 0

  if (visits > 0) {
    submissionRate = (submissions / visits) * 100
  }

  const bounceRate = 100 - submissionRate

  return (
    <>
      <div className="py-10 border-b border-muted">
        <div className="flex justify-between container">
          <h1 className="text-4xl font-bold truncate">{form.name}</h1>
          <VisitButton shareUrl={form.shareURL} />
        </div>
      </div>
    </>
  )
}
