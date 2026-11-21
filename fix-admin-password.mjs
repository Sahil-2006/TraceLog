import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

dotenv.config({ path: ".env.local" });
dotenv.config();
const email = process.env.TRACELOG_ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.TRACELOG_ADMIN_PASSWORD;
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
if (process.env.TRACELOG_CONFIRM_PASSWORD_RESET !== "true") throw new Error("Set TRACELOG_CONFIRM_PASSWORD_RESET=true after verifying the account owner.");
if (!email || !password || password.length < 12) throw new Error("Set the administrator email and a unique password of at least 12 characters.");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
try {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.role !== "ADMIN") throw new Error("The verified administrator account was not found.");
  await prisma.user.update({ where: { email }, data: { password: await bcrypt.hash(password, 12) } });
  console.log("Administrator password reset. The supplied password was not printed.");
} catch {
  console.error("Password reset failed. Check the database, account, and confirmation settings.");
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
  await pool.end();
}