/**
 * Debug password verification
 */

import pkg from "pg";
const { Client } = pkg;
import bcrypt from "bcryptjs";

const connectionString = "postgresql://postgres:TpuJgrsnQPXwGoARVrNVCCqXFSkLyAIW@shuttle.proxy.rlwy.net:48103/railway";

const client = new Client({ connectionString });

try {
  await client.connect();
  
  // Get admin user
  const result = await client.query(
    'SELECT id, email, password FROM "User" WHERE email = $1',
    ["admin@tracelog.com"]
  );
  
  if (result.rows.length === 0) {
    console.log("❌ Admin user not found!");
  } else {
    const user = result.rows[0];
    console.log("✅ Admin user found:");
    console.log("  ID:", user.id);
    console.log("  Email:", user.email);
    console.log("  Password hash:", user.password);
    console.log("");
    
    // Test password verification
    const plainPassword = "admin123";
    const isValid = await bcrypt.compare(plainPassword, user.password);
    
    console.log("🔐 Password verification:");
    console.log("  Plain password:", plainPassword);
    console.log("  Is valid:", isValid ? "✅ YES" : "❌ NO");
  }
  
  await client.end();
} catch (error) {
  console.error("Error:", error.message);
}
