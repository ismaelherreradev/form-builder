import { Suspense } from "react"

import CardStartsWrapper from "@/components/ui/card-starts-wrapper"
import { StatsCards } from "@/components/ui/stasts-card"

export default function Home() {
  return (
    <div className="container pt-4">
      <Suspense fallback={<StatsCards loading={true} />}>
        <CardStartsWrapper />
      </Suspense>
    </div>
  )
}
