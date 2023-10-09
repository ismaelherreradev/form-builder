import { Suspense } from "react"

import CardStartsWrapper from "@/components/ui/CardStartsWrapper"
import { StatsCards } from "@/components/ui/StastsCard"

export default function Home() {
  return (
    <div className="container pt-4">
      <Suspense fallback={<StatsCards loading={true} />}>
        <CardStartsWrapper />
      </Suspense>
    </div>
  )
}
