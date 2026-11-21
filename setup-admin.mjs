import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { provisionAdmin } from "./scripts/provision-admin.mjs";

dotenv.config({ path: ".env.local" });
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required for administrator provisioning.");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

try {
  await prisma.$connect();
  await provisionAdmin(prisma);
} catch {
  console.error("Administrator provisioning failed. Check the database and required environment variables.");
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
  await pool.end();
}
