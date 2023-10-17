import { GetFormStats } from "@/actions/form"

import { StatsCards } from "./stats-card"

export default async function CardStartsWrapper() {
  const stast = await GetFormStats()
  return <StatsCards data={stast} loading={false} />
}
