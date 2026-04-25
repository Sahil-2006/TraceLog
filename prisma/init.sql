-- Create User table
CREATE TABLE IF NOT EXISTS "User" (
  "id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "email" VARCHAR(255) UNIQUE NOT NULL,
  "name" VARCHAR(255),
  "password" VARCHAR(255) NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Transcript table
CREATE TABLE IF NOT EXISTS "Transcript" (
  "id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "text" TEXT NOT NULL,
  "userId" VARCHAR(255) NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "fileName" VARCHAR(255),
  "duration" FLOAT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS "idx_transcript_user_id" ON "Transcript"("userId");
CREATE INDEX IF NOT EXISTS "idx_user_email" ON "User"("email");
