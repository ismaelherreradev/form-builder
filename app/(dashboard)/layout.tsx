import { redirect } from "next/navigation"
import { UserButton } from "@clerk/nextjs"
import { auth } from "@clerk/nextjs/server"

import { ModeToggle } from "@/components/mode-toggle"

export default function Layout({ children }: { children: React.ReactNode }) {
  const { userId } = auth()

  if (!userId) {
    return redirect("/sign-in")
  }

  return (
    <main className="flex flex-col min-h-screen min-w-full max-h-screen">
      <nav className="container py-8 flex items-center justify-between">
        <ModeToggle />
        <UserButton />
      </nav>
      <section className="flex w-full flex-grow">{children}</section>
    </main>
  )
}
