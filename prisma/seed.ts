/**
 * DATABASE SETUP SCRIPT
 * Run: npm run db:seed
 * 
 * Uses Better Auth's signup API so passwords are properly hashed.
 * Requires the dev server to be running on localhost:3000.
 */

const BASE_URL = process.env.SEED_URL || "http://localhost:3000";

async function main() {
  console.log("🌱 Starting database seed...");

  try {
    // Use Better Auth's signup endpoint to create the admin user
    // This ensures the password is properly hashed
    const res = await fetch(`${BASE_URL}/api/auth/sign-up/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@tracelog.com",
        password: "admin123",
        name: "Admin",
      }),
    });

    if (res.ok) {
      console.log("✅ Admin user created successfully!");
    } else {
      const data = await res.json();
      // If user already exists, that's fine
      if (data?.message?.includes("already") || data?.code === "USER_ALREADY_EXISTS") {
        console.log("✅ Admin user already exists");
      } else {
        console.error("❌ Seed failed:", JSON.stringify(data));
        process.exit(1);
      }
    }

    console.log("📧 Email: admin@tracelog.com");
    console.log("🔑 Password: admin123");
    console.log("\n⚠️  IMPORTANT: Change this password in production!");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    console.error("Make sure the dev server is running on localhost:3000");
    process.exit(1);
  }
}

main();
