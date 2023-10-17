import { ModeToggle } from "@/components/mode-toggle"
import { UserButton } from "@clerk/nextjs"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-col min-h-screen min-w-full max-h-screen">
      <nav className="container py-8 flex items-center justify-between">
        <ModeToggle />
        <UserButton afterSignOutUrl="/sign-in" />
      </nav>
      <section className="flex w-full flex-grow">{children}</section>
    </main>
  )
}
