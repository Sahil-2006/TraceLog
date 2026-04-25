/**
 * Add Better Auth tables to database
 */

import pkg from "pg";
const { Client } = pkg;

const connectionString = "postgresql://postgres:TpuJgrsnQPXwGoARVrNVCCqXFSkLyAIW@shuttle.proxy.rlwy.net:48103/railway";

const client = new Client({ connectionString });

const sql = `
-- Add missing fields to User table if they don't exist
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "image" VARCHAR(255);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "twoFactorEnabled" BOOLEAN DEFAULT false;

-- Create Session table for Better Auth
CREATE TABLE IF NOT EXISTS "Session" (
  "id" VARCHAR(255) PRIMARY KEY,
  "userId" VARCHAR(255) NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "expiresAt" TIMESTAMP NOT NULL,
  "token" VARCHAR(255) UNIQUE NOT NULL,
  "ipAddress" VARCHAR(255),
  "userAgent" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Account table for OAuth (optional)
CREATE TABLE IF NOT EXISTS "Account" (
  "id" VARCHAR(255) PRIMARY KEY,
  "userId" VARCHAR(255) NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "accountId" VARCHAR(255) NOT NULL,
  "provider" VARCHAR(255) NOT NULL,
  "providerAccountId" VARCHAR(255) NOT NULL,
  "refreshToken" TEXT,
  "accessToken" TEXT,
  "accessTokenExpiresAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("provider", "providerAccountId")
);

-- Create Verification table
CREATE TABLE IF NOT EXISTS "Verification" (
  "id" VARCHAR(255) PRIMARY KEY,
  "identifier" VARCHAR(255) NOT NULL,
  "value" VARCHAR(255) NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("identifier", "value")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "idx_session_user_id" ON "Session"("userId");
CREATE INDEX IF NOT EXISTS "idx_session_token" ON "Session"("token");
CREATE INDEX IF NOT EXISTS "idx_account_user_id" ON "Account"("userId");
CREATE INDEX IF NOT EXISTS "idx_verification_identifier" ON "Verification"("identifier");
`;

try {
  console.log("🔌 Connecting to database...");
  await client.connect();
  console.log("✅ Connected!");

  console.log("📋 Creating Better Auth tables...");
  await client.query(sql);
  console.log("✅ Better Auth tables created successfully!");

  await client.end();
} catch (error) {
  console.error("❌ Error:", error.message);
  process.exit(1);
}
