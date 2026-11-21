/**
 * Check database tables
 */

import pkg from "pg";
import dotenv from "dotenv";
const { Client } = pkg;

dotenv.config({ path: ".env.local" });
dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required.");

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
