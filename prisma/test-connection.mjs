/**
 * Test connection to Railway PostgreSQL
 */

import pkg from "pg";
const { Client } = pkg;

const connectionString = "postgresql://postgres:TpuJgrsnQPXwGoARVrNVCCqXFSkLyAIW@shuttle.proxy.rlwy.net:48103/railway";

const client = new Client({
  connectionString,
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 10000,
  statement_timeout: 30000,
});

(async () => {
  try {
    console.log("🔌 Attempting connection with 30 second timeout...");
    console.log("Server: shuttle.proxy.rlwy.net:48103");
    console.log("Database: railway");
    
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
