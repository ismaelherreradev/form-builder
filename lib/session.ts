import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getServerSession() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session;
  } catch (error) {
    return null;
  }
}

export async function requireServerSession() {
  const session = await getServerSession();
  if (!session) {
    throw new Error("Authentication required");
  }
  return session;
}
