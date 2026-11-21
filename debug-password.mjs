import bcrypt from "bcryptjs";
import { Client } from "pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const email = (process.env.TRACELOG_ADMIN_EMAIL || "admin@tracelog.com").trim().toLowerCase();
const password = process.env.TRACELOG_ADMIN_PASSWORD;
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
if (!password) throw new Error("Set TRACELOG_ADMIN_PASSWORD in the current process to check a login.");

const client = new Client({ connectionString: process.env.DATABASE_URL });
try {
  await client.connect();
  const result = await client.query('SELECT password, role FROM "User" WHERE email = $1', [email]);
  const user = result.rows[0];
  const valid = Boolean(user?.password && user.role === "ADMIN" && await bcrypt.compare(password, user.password));
  console.log(valid ? "Administrator credentials are valid." : "Administrator credentials are not valid.");
  if (!valid) process.exitCode = 1;
} catch {
  console.error("Credential check failed. Verify DATABASE_URL and the Prisma schema.");
  process.exitCode = 1;
} finally {
  await client.end();
}
