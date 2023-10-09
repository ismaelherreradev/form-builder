import { ModeToggle } from "@/components/mode-toggle"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-col min-h-screen min-w-full max-h-screen">
      <nav className="container py-8">
        <ModeToggle />
      </nav>
      <section className="flex w-full flex-grow">{children}</section>
    </main>
  )
}
