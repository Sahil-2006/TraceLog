import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

dotenv.config({ path: ".env.local" });
dotenv.config();
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");

const email = (process.env.TRACELOG_ADMIN_EMAIL || "admin@tracelog.com").trim().toLowerCase();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
try {
  const user = await prisma.user.findUnique({ where: { email }, select: { email: true, role: true, password: true } });
  if (!user) {
    console.log("Administrator account was not found. Provision it with npm run setup:admin.");
  } else {
    console.log(`Account ${user.email}: role=${user.role}, passwordConfigured=${Boolean(user.password)}.`);
  }
} catch {
  console.error("Account check failed. Verify DATABASE_URL and the Prisma schema.");
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
  await pool.end();
}