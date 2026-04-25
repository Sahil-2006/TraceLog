import { NextRequest, NextResponse } from "next/server";
import { transcribeAudio } from "@/lib/gemini";
import { requireAdmin } from "@/lib/rbac";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    // Require admin access
    const user = await requireAdmin();

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("audio/")) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload an audio file." },
        { status: 400 }
      );
    }

    // Validate file size (10 MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size exceeds 10 MB limit" },
        { status: 400 }
      );
    }

    // Convert file to base64
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    // Transcribe audio using Gemini with correct MIME type
    const transcript = await transcribeAudio(base64, file.type);

    // Save transcript to database
    try {
      await db.transcript.create({
        data: {
          text: transcript,
          fileName: file.name,
          duration: 0,
          userId: user.id,
        },
      });
    } catch (dbError: any) {
      console.error("Database error:", dbError);
    }

    return NextResponse.json({
      success: true,
      transcript,
      fileName: file.name,
    });
  } catch (error: any) {
    console.error("Transcription error:", error);

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
      {
        error:
          error.message ||
          "An error occurred during transcription. Please try again.",
      },
      { status: 500 }
    );
  }
}
