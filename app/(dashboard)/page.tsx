import { Suspense } from "react"

import { Separator } from "@/components/ui/separator"
import CardStartsWrapper from "@/components/card-starts-wrapper"
import CerateFormButton from "@/components/create-form-button"
import FormCardSkeleton from "@/components/form-card-skeleton"
import FormCards from "@/components/form-cards"
import { StatsCards } from "@/components/stasts-card"

export default function Home() {
  return (
    <div className="container pt-4">
      <Suspense fallback={<StatsCards loading={true} />}>
        <CardStartsWrapper />
      </Suspense>
      <Separator className="my-6" />
      <h2 className="text-4xl font-bold col-span-2">Your forms</h2>
      <Separator className="my-6" />
      <div className="grid gric-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CerateFormButton />
        <Suspense
          fallback={[1, 2, 3, 4].map((el) => (
            <FormCardSkeleton key={el} />
          ))}
        >
          <FormCards />
        </Suspense>
      </div>
    </div>
  )
}
