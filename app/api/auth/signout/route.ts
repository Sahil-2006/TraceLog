import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.BETTER_AUTH_SECRET || "fallback-secret-key"
);

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value;

    if (token) {
      try {
        // Verify and get token payload
        const { payload } = await jwtVerify(token, secret);
        
        // Delete session from database
        await db.session.deleteMany({
          where: {
            userId: payload.userId as string,
            token,
          },
        });
      } catch (error) {
        // Token might be invalid, but we still want to clear the cookie
        console.log("Token verification failed during logout:", error);
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