import { Upload } from "lucide-react"

import { Button } from "../ui/button"

export default function PublishFormButton() {
  return (
    <Button className="gap-2 text-white bg-gradient-to-r from-violet-300 to-violet-400">
      <Upload className="h-6 w-6" />
      Publish
    </Button>
  )
}
