import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

const transcriptionPrompt = `
You are a highly accurate transcription engine. 
YOUR TASK: Convert the audio to text.
INSTRUCTIONS:
1. Provide a VERBATIM transcription.
2. Output ONLY the transcribed text.
3. DO NOT summarize.
4. DO NOT explain the audio.
5. DO NOT include "Here is the transcript" or any chatty preamble.
6. If there is background noise, ignore it.
7. If the audio is silent, output an empty string.
`;

const MAX_RETRIES = 3;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getRetryDelay = (error: any): number | null => {
  const msg = error?.message || "";
  if (!msg.includes("429") && !msg.includes("Too Many Requests")) return null;
  // Try to extract retryDelay from Google's error payload
  const match = msg.match(/retryDelay[":\s]+(\d+)s/);
  if (match) return parseInt(match[1], 10) * 1000 + 1000; // parsed delay + 1s buffer
  return 15000; // default 15s backoff
};

export const transcribeAudio = async (audioBase64: string, mimeType: string = "audio/mpeg"): Promise<string> => {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not configured. Check your .env.local file.");
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      temperature: 0, // CRITICAL: Deterministic, literal mode - no hallucinations
    },
  });

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[Gemini] 🌐 Starting verbatim transcription (attempt ${attempt}/${MAX_RETRIES})...`);

      const result = await model.generateContent([
        {
          inlineData: {
            data: audioBase64,
            mimeType: mimeType, // Use actual file MIME type
          },
        },
        { text: transcriptionPrompt },
      ]);

      const transcript = result.response.text();
      console.log("[Gemini] ✓ Transcription successful");

      return transcript;
    } catch (error: any) {
      const retryMs = getRetryDelay(error);

      if (retryMs && attempt < MAX_RETRIES) {
        console.warn(`[Gemini] ⚠️ Rate limited (429). Retrying in ${retryMs / 1000}s... (attempt ${attempt}/${MAX_RETRIES})`);
        await sleep(retryMs);
        continue;
      }

      console.error("[Gemini] ❌ Transcription failed:", error.message);
      throw new Error(`Transcription failed: ${error.message}`);
    }
  }

  throw new Error("Transcription failed: Max retries exceeded");
};
