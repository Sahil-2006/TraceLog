/**
 * Check database tables
 */

import pkg from "pg";
const { Client } = pkg;

const connectionString = "postgresql://postgres:TpuJgrsnQPXwGoARVrNVCCqXFSkLyAIW@shuttle.proxy.rlwy.net:48103/railway";

const client = new Client({ connectionString });

try {
  await client.connect();
  
  // Get all tables
  const result = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `);
  
  console.log("📊 Database tables:");
  result.rows.forEach(row => {
    console.log(`  - ${row.table_name}`);
  });
  
  await client.end();
} catch (error) {
  console.error("Error:", error.message);
}
