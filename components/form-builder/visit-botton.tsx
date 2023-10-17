"use client"

import { useEffect, useState } from "react"

import { Button } from "../ui/button"

export default function VisitButton({ shareUrl }: { shareUrl: string }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null // avoiding window not defined error
  }

  const shareLink = `${window.location.origin}/submit/${shareUrl}`
  return (
    <Button
      className="w-[200px]"
      onClick={() => {
        window.open(shareLink, "_blank")
      }}
    >
      Visit
    </Button>
  )
}
