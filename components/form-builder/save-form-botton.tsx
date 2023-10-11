import { Save } from "lucide-react"

import { Button } from "../ui/button"

export default function SaveFormButton() {
  return (
    <Button variant={"outline"} className="gap-2">
      <Save className="h-6 w-6" />
      Save
    </Button>
  )
}
