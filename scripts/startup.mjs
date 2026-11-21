import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required; startup will not use an in-memory database in deployment.");
  process.exit(1);
}
if (!process.env.BETTER_AUTH_SECRET || Buffer.byteLength(process.env.BETTER_AUTH_SECRET, "utf8") < 32) {
  console.error("BETTER_AUTH_SECRET must be configured with at least 32 characters.");
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 10000 });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

try {
  await prisma.$connect();
  await prisma.$queryRaw`SELECT 1`;
  console.log("TraceLog database connection is ready.");
} catch {
  console.error("TraceLog could not connect to its database. Startup stopped.");
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
  await pool.end();
}
