import { NextRequest, NextResponse } from "next/server";
import { transcribeAudio } from "@/lib/gemini";
import { requireAdmin } from "@/lib/rbac";
import { db } from "@/lib/db";
import { isLocalDemoMode } from "@/lib/runtime-mode";

export async function POST(request: NextRequest) {
  try {
    // Require admin access
    const user = await requireAdmin();

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const supportedTypes = new Set(["audio/mpeg", "audio/wav", "audio/x-wav", "audio/wave", "audio/ogg", "audio/mp4", "audio/x-m4a"]);
    if (!supportedTypes.has(file.type.toLowerCase())) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload an audio file." },
        { status: 400 }
      );
    }

    // Validate file size (10 MB max)
    if (file.size === 0) {
      return NextResponse.json({ error: "The selected audio file is empty." }, { status: 400 });
    }

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
    let saved = false;
    try {
      await db.transcript.create({
        data: {
          text: transcript,
          fileName: file.name,
          duration: 0,
          userId: user.id,
        },
      });
      saved = true;
    } catch {
      console.error("Transcript was generated but could not be saved.");
    }

    return NextResponse.json({
      success: true,
      transcript,
      fileName: file.name,
      source: isLocalDemoMode() && !process.env.GEMINI_API_KEY ? "DEMO_SAMPLE" : "GEMINI",
      saved,
      message: saved ? null : "Transcription finished, but it could not be saved to history. Copy the text before leaving this page.",
    });
  } catch (error: any) {
    console.error("Transcription request failed.");

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

    if (error instanceof Error && error.message.includes("GEMINI_API_KEY")) {
      return NextResponse.json({ error: "Audio transcription is not configured. Add a Gemini API key and try again." }, { status: 503 });
    }
    return NextResponse.json({ error: "Transcription failed. Check the service configuration and try again." }, { status: 502 });
  }
}
