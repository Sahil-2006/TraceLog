import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { createDemoDb } from "./demo-store";
import { isLocalDemoMode } from "./runtime-mode";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | null };

let prismaClient: PrismaClient | any;

const shouldUseDemoDb = isLocalDemoMode();

if (shouldUseDemoDb) {
  prismaClient = createDemoDb();
} else if (!globalForPrisma.prisma) {
  // Create PostgreSQL connection pool
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  
  // Create Prisma adapter
  const adapter = new PrismaPg(pool);
  
  // Create Prisma client with adapter
  prismaClient = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
  });
  
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prismaClient;
  }
} else {
  prismaClient = globalForPrisma.prisma;
}

export const db = prismaClient;
