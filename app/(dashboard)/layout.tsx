import MainNavbar from "@/components/ui/MainNavbar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-col min-h-screen min-w-full max-h-screen">
      <MainNavbar />
      <section className="flex w-full flex-grow">{children}</section>
    </main>
  )
}
