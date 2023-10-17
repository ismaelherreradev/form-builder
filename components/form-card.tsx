import Link from "next/link"
import { Form } from "@prisma/client"
import { formatDistance } from "date-fns"
import { ArrowRightIcon, EyeIcon, GanttChartSquare, Pencil } from "lucide-react"

import { Badge } from "@/components/ui/badge"

import { Button } from "./ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card"

export default function FormCard({ form }: { form: Form }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 justify-between">
          <span className="truncate font-bold">{form.name}</span>
          {form.published ? (
            <Badge>Published</Badge>
          ) : (
            <Badge variant={"destructive"}>Draft</Badge>
          )}
        </CardTitle>
        <CardDescription className="flex items-center justify-between text-muted-foreground text-sm">
          {formatDistance(form.createdAt, new Date(), {
            addSuffix: true,
          })}
          {form.published ? (
            <span className="flex items-center gap-2">
              <EyeIcon className="text-muted-foreground" />
              <span>{form.visits.toLocaleString()}</span>
              <GanttChartSquare className="text-muted-foreground" />
              <span>{form.submissions.toLocaleString()}</span>
            </span>
          ) : (
            ""
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[20px] truncate text-sm text-muted-foreground">
        {form.description || "No description"}
      </CardContent>
      <CardFooter>
        {form.published ? (
          <Button asChild className="w-full mt-2 text-md gap-4">
            <Link href={`/forms/${form.id}`}>
              View submissions <ArrowRightIcon />
            </Link>
          </Button>
        ) : (
          <Button
            asChild
            variant={"secondary"}
            className="w-full mt-2 text-md gap-4"
          >
            <Link href={`/builder/${form.id}`}>
              Edit form <Pencil />
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
