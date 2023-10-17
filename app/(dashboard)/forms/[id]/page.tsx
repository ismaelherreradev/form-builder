import { ReactNode, Suspense } from "react"
import { GetFormById, GetFormWithSubmissions } from "@/actions/form"
import { format, formatDistance } from "date-fns"
import {
  Badge,
  Eye,
  GanttChartSquare,
  MousePointerClick,
  TrendingDown,
} from "lucide-react"

import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import CardStartsWrapper from "@/components/card-starts-wrapper"
import FormBuilder from "@/components/form-builder/builder"
import {
  ElementsType,
  FormElementInstance,
} from "@/components/form-builder/elements"
import FormLinkShare from "@/components/form-builder/share-botton"
import VisitButton from "@/components/form-builder/visit-botton"
import { StatsCard, StatsCards } from "@/components/stats-card"

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
      <div className="py-4 border-b border-muted">
        <div className="container flex gap-2 items-center justify-between">
          <FormLinkShare shareUrl={form.shareURL} />
        </div>
      </div>

      <div className="container">
        <StatsCards
          loading={false}
          data={{
            visits,
            submissions,
            submissionRate,
            bounceRate,
          }}
        />
      </div>
      <div className="container pt-10">
        <SubmissionsTable id={form.id} />
      </div>
    </>
  )
}

type Row = { [key: string]: string } & {
  submittedAt: Date
}

async function SubmissionsTable({ id }: { id: number }) {
  const form = await GetFormWithSubmissions(id)

  if (!form) {
    throw new Error("form not found")
  }

  const formElements = JSON.parse(form.content) as FormElementInstance[]
  const columns: {
    id: string
    label: string
    required: boolean
    type: ElementsType
  }[] = []

  formElements.forEach((element) => {
    switch (element.type) {
      case "TextField":
        columns.push({
          id: element.id,
          label: element.extraAttributes?.label,
          required: element.extraAttributes?.required,
          type: element.type,
        })
        break
      default:
        break
    }
  })

  const rows: Row[] = []
  form.FormSubmissions.forEach((submission) => {
    const content = JSON.parse(submission.content)
    rows.push({
      ...content,
      submittedAt: submission.createdAt,
    })
  })

  return (
    <>
      <h1 className="text-2xl font-bold my-4">Submissions</h1>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.id} className="uppercase">
                  {column.label}
                </TableHead>
              ))}
              <TableHead className="text-muted-foreground text-right uppercase">
                Submitted at
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index}>
                {columns.map((column) => (
                  <RowCell
                    key={column.id}
                    type={column.type}
                    value={row[column.id]}
                  />
                ))}
                <TableCell className="text-muted-foreground text-right">
                  {formatDistance(row.submittedAt, new Date(), {
                    addSuffix: true,
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}

function RowCell({ type, value }: { type: ElementsType; value: string }) {
  let node: ReactNode = value

  // switch (type) {
  //   case "DateField":
  //     if (!value) break
  //     const date = new Date(value)
  //     node = <Badge variant={"outline"}>{format(date, "dd/MM/yyyy")}</Badge>
  //     break
  //   case "CheckboxField":
  //     const checked = value === "true"
  //     node = <Checkbox checked={checked} disabled />
  //     break
  // }

  return <TableCell>{node}</TableCell>
}
