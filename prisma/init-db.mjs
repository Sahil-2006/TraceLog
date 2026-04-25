import "dotenv/config";
import pkg from "pg";
const { Client } = pkg;
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

const client = new Client({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:TpuJgrsnQPXwGoARVrNVCCqXFSkLyAIW@postgres.railway.internal:5432/railway",
});

async function main() {
  try {
    console.log("🔌 Connecting to database...");
    await client.connect();
    console.log("✅ Connected!");

    // Read the SQL file
    const sqlFile = path.join(process.cwd(), "prisma", "init.sql");
    const sql = fs.readFileSync(sqlFile, "utf-8");

    console.log("📋 Creating tables...");
    await client.query(sql);
    console.log("✅ Tables created successfully!");

    // Create admin user
    console.log("👤 Creating admin user...");
    const adminCheck = await client.query(
      'SELECT * FROM "User" WHERE email = $1',
      ["admin@tracelog.com"]
    );

    const plainPassword = "admin123";
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    if (adminCheck.rows.length === 0) {
      await client.query(
        'INSERT INTO "User" (email, name, password) VALUES ($1, $2, $3)',
        ["admin@tracelog.com", "Admin", hashedPassword]
      );
      console.log("✅ Admin user created!");
    } else {
      // Update existing user with hashed password
      await client.query(
        'UPDATE "User" SET password = $1 WHERE email = $2',
        [hashedPassword, "admin@tracelog.com"]
      );
      console.log("✅ Admin user updated with hashed password!");
    }
    
    console.log("📧 Email: admin@tracelog.com");
    console.log("🔑 Password: admin123");
    console.log("\n⚠️  IMPORTANT: Change this password in production!");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
