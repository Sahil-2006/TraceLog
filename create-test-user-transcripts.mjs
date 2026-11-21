import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

dotenv.config({ path: ".env.local" });
dotenv.config();
if (process.env.NODE_ENV === "production" || process.env.TRACELOG_ALLOW_SAMPLE_DATA !== "true") {
  throw new Error("Sample user and transcript creation is limited to explicitly enabled non-production environments.");
}
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
const testPassword = process.env.TRACELOG_TEST_PASSWORD;
if (!testPassword || testPassword.length < 12) throw new Error("Set TRACELOG_TEST_PASSWORD to a unique password of at least 12 characters.");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
try {
  let user = await prisma.user.findUnique({ where: { email: "user@tracelog.com" } });
  if (!user) {
    user = await prisma.user.create({ data: {
      email: "user@tracelog.com", name: "Test User", password: await bcrypt.hash(testPassword, 12), role: "USER", emailVerified: true,
    } });
  }
  const count = await prisma.transcript.count({ where: { userId: user.id } });
  if (count === 0) {
    await prisma.transcript.createMany({ data: [
      { text: "Sample transcript for the TraceLog local evaluation workspace.", fileName: "sample-1.mp3", userId: user.id },
      { text: "Second sample transcript for the TraceLog local evaluation workspace.", fileName: "sample-2.wav", userId: user.id },
    ] });
  }
  console.log("Local sample account and transcripts are ready; no password was printed.");
} catch {
  console.error("Sample data setup failed. Check the database and local-only guard settings.");
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
  await pool.end();
}