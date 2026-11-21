/**
 * Test connection to Railway PostgreSQL
 */

import pkg from "pg";
import dotenv from "dotenv";
const { Client } = pkg;

dotenv.config({ path: ".env.local" });
dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required.");

const client = new Client({
  connectionString,
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 10000,
  statement_timeout: 30000,
});

(async () => {
  try {
    console.log("🔌 Attempting connection with 30 second timeout...");
    console.log("Checking the configured database connection...");
    
    await client.connect();
  console.log("✅ Connected!");
  
  const result = await client.query("SELECT NOW() as current_time");
  console.log("✅ Query successful:", result.rows[0]);
  
  await client.end();
  process.exit(0);
} catch (error) {
  console.error("❌ Failed:", error.message);
  process.exit(1);
}
})();
