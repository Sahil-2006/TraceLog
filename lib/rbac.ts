import { auth } from "./auth";
import { db } from "./db";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

export enum Role {
  ADMIN = "ADMIN",
  USER = "USER",
}

const secret = new TextEncoder().encode(
  process.env.BETTER_AUTH_SECRET || "fallback-secret-key"
);

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return null;
    }

    // Verify JWT token
    const { payload } = await jwtVerify(token, secret);

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
    console.error("Error getting current user:", error);
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