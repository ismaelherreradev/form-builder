import { GetFormStasts } from "@/actions/form"
import {
  Eye,
  GanttChartSquare,
  MousePointerClick,
  TrendingDown,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

type StatsCardsProps = {
  data?: Awaited<ReturnType<typeof GetFormStasts>>
  loading: boolean
}

type CardProps = {
  title: string
  value: string
  icon: React.ReactNode
  helperText: string
  loading: boolean
}

export function StatsCards(props: StatsCardsProps) {
  const { data, loading } = props

  return (
    <div className="w-full pt-8 gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total visits"
        value={data?.visits?.toLocaleString() || ""}
        icon={<Eye />}
        helperText="All time form visits"
        loading={loading}
      />

      <StatsCard
        title="Total submissions"
        value={data?.summisions?.toLocaleString() || ""}
        icon={<GanttChartSquare />}
        helperText="All time form submissions"
        loading={loading}
      />

      <StatsCard
        title="Submissions rate"
        value={data?.submissionsRate?.toLocaleString() + "%" || ""}
        icon={<MousePointerClick />}
        helperText="Visits that result in form submissions"
        loading={loading}
      />

      <StatsCard
        title="Bounce rate"
        value={data?.submissionsRate?.toLocaleString() + "%" || ""}
        icon={<TrendingDown />}
        helperText="Visits that leave without interacting"
        loading={loading}
      />
    </div>
  )
}

export function StatsCard(props: CardProps) {
  const { title, value, icon, helperText, loading } = props

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {loading ? (
            <Skeleton className="rounded-xl">
              <span className="opacity-0">0</span>
            </Skeleton>
          ) : (
            <>{value}</>
          )}
        </div>
        <p className="text-xs text-muted-foreground pt-1">{helperText}</p>
      </CardContent>
    </Card>
  )
}
