import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jwtVerify } from "jose";
import { getAuthSecret } from "@/lib/runtime-mode";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value;

    if (token) {
      try {
        // Verify and get token payload
        const { payload } = await jwtVerify(token, new TextEncoder().encode(getAuthSecret()));
        
        // Delete session from database
        await db.session.deleteMany({
          where: {
            userId: payload.userId as string,
            token,
          },
        });
      } catch (error) {
        // Token might be invalid, but we still want to clear the cookie
        console.warn("Invalid session token during sign out.");
      }
    }

    // Clear cookie
    const response = NextResponse.json({
      success: true,
      message: "Signed out successfully",
    });

    response.cookies.set("auth-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0, // Expire immediately
    });

    return response;
  } catch (error) {
    console.error("Signout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
