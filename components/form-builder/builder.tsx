"use client"

import { DndContext } from "@dnd-kit/core"
import { Form } from "@prisma/client"

import Designer from "./designer"
import PreviewFormButton from "./preview-dialog-button"
import PublishFormButton from "./publish-botton"
import SaveFormButton from "./save-botton"
import DragOverlayWrapper from "./designer/drag-overlay-wrapper"

export default function FormBuilder({ form }: { form: Form }) {
  return (
    <DndContext>
      <main className="flex flex-col w-full">
        <nav className="flex justify-between border-b-2 p-4 gap-3 items-center">
          <h2 className="truncate font-medium">
            <span className="text-muted-foreground mr-2">Form:</span>
            {form.name}
          </h2>
          <div className="flex item-center gap-2">
            <PreviewFormButton />

            {!form.published ? (
              <>
                <SaveFormButton /> <PublishFormButton />
              </>
            ) : null}
          </div>
        </nav>
        <div
          className="flex w-full flex-grow items-center justify-center relative overflow-y-auto h-[200px]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255, 255, 255, 0.1) 1px, rgb(164 164 164) 1px)",
            backgroundPosition: "50% 50%",
            backgroundSize: "1.1rem 1.1rem",
          }}
        >
          <Designer />
        </div>
      </main>
      <DragOverlayWrapper />
    </DndContext>
  )
}
