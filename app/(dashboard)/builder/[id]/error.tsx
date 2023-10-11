"use client"

import { useEffect } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function ErrorPage({ error }: { error: Error }) {
  useEffect(() => console.error(error), [error])

  return (
    <div className="flex w-full h-full flex-col items-center justify-center gap-4">
      <h2 className="text-4xl">Somthing went wrong!</h2>
      <Button asChild>
        <Link href={"/"}>Go back to home</Link>
      </Button>
    </div>
  )
}
