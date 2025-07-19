import { Loader2 } from "lucide-react"

export function DesignerLoading() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading form designer...</p>
      </div>
    </div>
  )
}

export function DesignerElementLoading() {
  return (
    <div className="h-[120px] rounded-md bg-muted/50 animate-pulse flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  )
}