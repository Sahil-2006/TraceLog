import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/rbac";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Require admin access
    await requireAdmin();

    const transcripts = await db.transcript.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        text: true,
        fileName: true,
        createdAt: true,
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ transcripts });
  } catch (error: any) {
    console.error("Fetch transcripts error:", error);
    
    if (error.message === "Authentication required") {
      return NextResponse.json(
        { error: "Unauthorized: Not authenticated" },
        { status: 401 }
      );
    }
    
    if (error.message === "Admin access required") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch transcripts" },
      { status: 500 }
    );
  }
}
