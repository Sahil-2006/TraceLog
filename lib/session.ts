import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function getSession() {
  const headersList = await headers();
  try {
    const session = await auth.api.getSession({
      headers: headersList,
    });
    return session;
  } catch (error) {
    return null;
  }
}

export async function requireAdmin() {
  const session = await getSession();

  if (!session) {
    throw new Error("Unauthorized: No session found");
  }

  // Check if user email is the admin email
  const isAdmin = session.user.email === "admin@tracelog.com";

  if (!isAdmin) {
    throw new Error("Unauthorized: Admin access required");
  }

  return session;
}
