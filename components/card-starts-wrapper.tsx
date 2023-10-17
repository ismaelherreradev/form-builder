import { GetFormStats } from "@/actions/form"
import { StatsCards } from "./stasts-card"

export default async function CardStartsWrapper() {
  const stast = await GetFormStats()
  return <StatsCards data={stast} loading={false} />
}
