"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { Form } from "@prisma/client"
import { ArrowBigLeft, ArrowBigRight, Loader2 } from "lucide-react"
import Confetti from "react-confetti"

import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { toast } from "../ui/use-toast"
import Designer from "./designer"
import DragOverlayWrapper from "./designer/drag-overlay-wrapper"
import useDesigner from "./hooks/useDesigner"
import PreviewFormButton from "./preview-dialog-button"
import PublishFormButton from "./publish-botton"
import SaveFormButton from "./save-botton"

export default function FormBuilder({ form }: { form: Form }) {
  const { setElements, setSelectedElement } = useDesigner()
  const [isReady, setIsReady] = useState(false)
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  })

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 300,
      tolerance: 5,
    },
  })

  const sensors = useSensors(mouseSensor, touchSensor)

  useEffect(() => {
    if (isReady) return
    const elements = JSON.parse(form.content)
    setElements(elements)
    setSelectedElement(null)
    const readyTimeout = setTimeout(() => setIsReady(true), 500)
    return () => clearTimeout(readyTimeout)
  }, [form, setElements, isReady, setSelectedElement])

  if (!isReady) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full">
        <Loader2 className="animate-spin h-12 w-12" />
      </div>
    )
  }

  const shareUrl = `${window.location.origin}/submit/${form.shareURL}`

  if (form.published) {
    return (
      <>
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={1000}
        />
        <div className="flex flex-col items-center justify-center h-full w-full">
          <div className="max-w-md">
            <h1 className="text-center text-4xl font-bold text-primary border-b pb-2 mb-10">
              🎊🎊 Form Published 🎊🎊
            </h1>
            <h2 className="text-2xl">Share this form</h2>
            <h3 className="text-xl text-muted-foreground border-b pb-10">
              Anyone with the link can view and submit the form
            </h3>
            <div className="my-4 flex flex-col gap-2 items-center w-full border-b pb-4">
              <Input className="w-full" readOnly value={shareUrl} />
              <Button
                className="mt-2 w-full"
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl)
                  toast({
                    title: "Copied!",
                    description: "Link copied to clipboard",
                  })
                }}
              >
                Copy link
              </Button>
            </div>
            <div className="flex justify-between">
              <Button variant={"link"} asChild>
                <Link href={"/"} className="gap-2">
                  <ArrowBigLeft />
                  Go back home
                </Link>
              </Button>
              <Button variant={"link"} asChild>
                <Link href={`/forms/${form.id}`} className="gap-2">
                  Form details
                  <ArrowBigRight />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <DndContext sensors={sensors}>
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
                <SaveFormButton id={form.id} />{" "}
                <PublishFormButton id={form.id} />
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
