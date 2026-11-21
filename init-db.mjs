import { Pool } from 'pg';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to initialize the schema.");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initDatabase() {
  try {
    console.log('🔄 Initializing database...');
    
    // Read and execute the SQL file
    const sql = readFileSync('init-complete.sql', 'utf8');
    await pool.query(sql);
    
    console.log('Database schema initialized. Provision an administrator separately with npm run setup:admin.');
  } catch {
    console.error('Database initialization failed. Check DATABASE_URL and the schema file.');
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

initDatabase();
