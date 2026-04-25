import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/rbac";
import { db } from "@/lib/db";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require admin access
    await requireAdmin();

    const { id: transcriptId } = await params;

    if (!transcriptId) {
      return NextResponse.json(
        { error: "Transcript ID is required" },
        { status: 400 }
      );
    }

    console.log("Deleting transcript with ID:", transcriptId);

    // Check if transcript exists
    const transcript = await db.transcript.findUnique({
      where: { id: transcriptId },
      select: { id: true, fileName: true },
    });

    if (!transcript) {
      return NextResponse.json(
        { error: "Transcript not found" },
        { status: 404 }
      );
    }

    // Delete the transcript
    await db.transcript.delete({
      where: { id: transcriptId },
    });

    return NextResponse.json({
      success: true,
      message: "Transcript deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete transcript error:", error);
    
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
      { error: "Failed to delete transcript" },
      { status: 500 }
    );
  }
}