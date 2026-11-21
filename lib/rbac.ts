import { db } from "./db";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getAuthSecret } from "./runtime-mode";

export enum Role {
  ADMIN = "ADMIN",
  USER = "USER",
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return null;
    }

    // Verify JWT token
    const { payload } = await jwtVerify(token, new TextEncoder().encode(getAuthSecret()));
    if (typeof payload.userId !== "string") return null;

    const session = await db.session.findUnique({
      where: { token },
      select: { userId: true, expiresAt: true },
    });
    if (!session || session.userId !== payload.userId || new Date(session.expiresAt) <= new Date()) return null;

    // Get user from database
    const user = await db.user.findUnique({
      where: { id: payload.userId as string },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
      },
    });

    return user;
  } catch (error) {
    console.error("Error validating TraceLog session.");
    return null;
  }
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== Role.ADMIN) {
    throw new Error("Admin access required");
  }
  return user;
}

export function hasRole(userRole: string, requiredRole: Role): boolean {
  if (requiredRole === Role.ADMIN) {
    return userRole === Role.ADMIN;
  }
  return true; // USER role can access user-level resources
}
