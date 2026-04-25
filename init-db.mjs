import { Pool } from 'pg';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initDatabase() {
  try {
    console.log('🔄 Initializing database...');
    
    // Read and execute the SQL file
    const sql = readFileSync('init-complete.sql', 'utf8');
    await pool.query(sql);
    
    console.log('✅ Database initialized successfully!');
    console.log('📧 Admin email: admin@tracelog.com');
    console.log('🔑 Admin password: admin123');
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
  } finally {
    await pool.end();
  }
}

initDatabase();