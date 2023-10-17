import { useTransition } from "react"
import { UpdateFormContent } from "@/actions/form"
import { Loader2, Save } from "lucide-react"

import { Button } from "../ui/button"
import { toast } from "../ui/use-toast"
import useDesigner from "./hooks/useDesigner"

export default function SaveFormButton({ id }: { id: number }) {
  const { elements } = useDesigner()
  const [loading, startTransition] = useTransition()

  const updateFormContent = async () => {
    try {
      const jsonElements = JSON.stringify(elements)
      await UpdateFormContent(id, jsonElements)
      toast({
        title: "Success",
        description: "Your form has been saved",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    }
  }

  return (
    <Button
      variant={"outline"}
      disabled={loading}
      className="gap-2"
      onClick={() => {
        startTransition(updateFormContent)
      }}
    >
      <Save className="h-6 w-6" />
      Save
      {loading ? <Loader2 className="h-6 w-6" /> : ""}
    </Button>
  )
}
