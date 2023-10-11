import { ScanEye } from "lucide-react"

import { Button } from "../ui/button"

export default function PreviewFormButton() {
  return (
    <Button variant={"outline"} className="gap-2">
      <ScanEye className="h-6 w-6" />
      Preview
    </Button>
  )
}
