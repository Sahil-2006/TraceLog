import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { provisionAdmin } from "./scripts/provision-admin.mjs";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required. Apply the Prisma schema before provisioning an administrator.");
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

try {
  await prisma.$connect();
  await provisionAdmin(prisma);
} catch {
  console.error("Deployment setup failed. Check the database and administrator environment variables.");
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
  await pool.end();
}
