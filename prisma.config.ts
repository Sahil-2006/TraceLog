import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

// Next.js local setup uses .env.local; Prisma CLI does not load that file by default.
dotenv.config({ path: ".env.local" });
dotenv.config();

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // `prisma generate` also runs for the offline demo, where no DB is configured.
    url: process.env.DATABASE_URL ?? "",
  },
});
