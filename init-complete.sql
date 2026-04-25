-- Create Role enum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- Create User table with all Better Auth fields
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "email" TEXT UNIQUE NOT NULL,
  "name" TEXT,
  "emailVerified" BOOLEAN NOT NULL DEFAULT false,
  "password" TEXT,
  "image" TEXT,
  "role" "Role" NOT NULL DEFAULT 'USER',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Session table for Better Auth
CREATE TABLE IF NOT EXISTS "Session" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "token" TEXT UNIQUE NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Create Account table for Better Auth (OAuth)
CREATE TABLE IF NOT EXISTS "Account" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "accountId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "accessToken" TEXT,
  "refreshToken" TEXT,
  "accessTokenExpiresAt" TIMESTAMP(3),
  "refreshTokenExpiresAt" TIMESTAMP(3),
  "scope" TEXT,
  "idToken" TEXT,
  "password" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  UNIQUE ("providerId", "accountId")
);

-- Create Verification table for Better Auth
CREATE TABLE IF NOT EXISTS "Verification" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "identifier" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Transcript table
CREATE TABLE IF NOT EXISTS "Transcript" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "text" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "fileName" TEXT,
  "duration" DOUBLE PRECISION,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_session_user_id" ON "Session"("userId");
CREATE INDEX IF NOT EXISTS "idx_session_token" ON "Session"("token");
CREATE INDEX IF NOT EXISTS "idx_account_user_id" ON "Account"("userId");
CREATE INDEX IF NOT EXISTS "idx_transcript_user_id" ON "Transcript"("userId");
CREATE INDEX IF NOT EXISTS "idx_user_email" ON "User"("email");

-- Insert admin user
INSERT INTO "User" ("id", "email", "name", "password", "role", "emailVerified")
VALUES (
  gen_random_uuid()::text,
  'admin@tracelog.com',
  'Admin User',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/hMxDv7u7G', -- bcrypt hash of 'admin123'
  'ADMIN',
  true
)
ON CONFLICT ("email") DO UPDATE SET
  "role" = 'ADMIN',
  "emailVerified" = true;