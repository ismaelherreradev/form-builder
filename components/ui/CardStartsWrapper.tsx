import { GetFormStasts } from "@/actions/form"
import { StatsCards } from "./StastsCard"

export default async function CardStartsWrapper() {
  const stast = await GetFormStasts()
  return <StatsCards data={stast} loading={false} />
}
