import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { ModeToggle } from "@/components/mode-toggle";
import { UserMenu } from "@/components/user-menu";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    return redirect("/sign-in");
  }

  return (
    <main className="flex flex-col min-h-screen min-w-full max-h-screen">
      <nav className="container py-8 flex items-center justify-between">
        <ModeToggle />
        <UserMenu user={session.user} />
      </nav>
      <section className="flex w-full flex-grow">{children}</section>
    </main>
  );
}
