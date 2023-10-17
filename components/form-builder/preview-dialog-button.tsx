import { ScanEye } from "lucide-react"

import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog"
import { FormElements } from "./elements"
import useDesigner from "./hooks/useDesigner"

export default function PreviewFormButton() {
  const { elements } = useDesigner()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"outline"} className="gap-2">
          <ScanEye className="h-6 w-6" />
          Preview
        </Button>
      </DialogTrigger>
      <DialogContent className="w-screen h-screen max-h-screen max-w-full flex flex-col flex-grow p-0 gap-0">
        <div className="px-4 py-2 border-b">
          <p className="text-lg font-bold text-muted-foreground">
            Form preview
          </p>
          <p className="text-sm text-muted-foreground">
            This is how your form will look like to your users.
          </p>
        </div>
        <div
          className="bg-accent flex flex-col flex-grow items-center justify-center p-4  overflow-y-auto"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255, 255, 255, 0.1) 1px, rgb(164 164 164) 1px)",
            backgroundPosition: "50% 50%",
            backgroundSize: "1.1rem 1.1rem",
          }}
        >
          <div className="max-w-[620px] flex flex-col gap-4 flex-grow bg-background h-full w-full rounded-2xl p-8 overflow-y-auto">
            {elements.map((element) => {
              const FormComponent = FormElements[element.type].formComponent
              return (
                <FormComponent key={element.id} elementInstance={element} />
              )
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
