-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "role" "Role" NOT NULL DEFAULT 'USER';

-- Make password nullable for OAuth users
ALTER TABLE "User" ALTER COLUMN "password" DROP NOT NULL;