/**
 * Check User table schema
 */

import pkg from "pg";
const { Client } = pkg;

const connectionString = "postgresql://postgres:TpuJgrsnQPXwGoARVrNVCCqXFSkLyAIW@shuttle.proxy.rlwy.net:48103/railway";

const client = new Client({ connectionString });

try {
  await client.connect();
  
  // Get table structure
  const result = await client.query(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'User'
    ORDER BY ordinal_position;
  `);
  
  console.log("📊 User table schema:");
  result.rows.forEach(row => {
    console.log(`  ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? '(required)' : '(nullable)'}`);
  });
  
  console.log("\n📋 Full admin user row:");
  const userResult = await client.query('SELECT * FROM "User" WHERE email = $1', ["admin@tracelog.com"]);
  console.log(userResult.rows[0]);
  
  await client.end();
} catch (error) {
  console.error("Error:", error.message);
}
