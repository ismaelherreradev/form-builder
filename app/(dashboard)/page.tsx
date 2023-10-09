import { Suspense } from "react"

import CardStartsWrapper from "@/components/ui/card-starts-wrapper"
import { Separator } from "@/components/ui/separator"
import { StatsCards } from "@/components/ui/stasts-card"
import CerateFormButton from "@/components/create-form-button"

export default function Home() {
  return (
    <div className="container pt-4">
      <Suspense fallback={<StatsCards loading={true} />}>
        <CardStartsWrapper />
      </Suspense>
      <Separator className="my-6" />
      <h2 className="text-4xl font-bold col-span-2">Your forms</h2>
      <Separator className="my-6" />
      <CerateFormButton />
    </div>
  )
}
