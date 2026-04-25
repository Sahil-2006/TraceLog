import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

console.log('🚀 Running startup script...');

// Step 1: Push database schema
try {
  console.log('📋 Pushing database schema...');
  execSync('npx prisma db push --skip-generate', { stdio: 'inherit' });
  console.log('✅ Schema pushed successfully');
} catch (err) {
  console.error('❌ Schema push failed:', err.message);
  // Don't exit — tables might already exist
}

// Step 2: Create admin user if not exists
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

try {
  console.log('👤 Checking admin user...');
  
  const existing = await prisma.user.findUnique({
    where: { email: 'admin@tracelog.com' }
  });

  if (!existing) {
    const hashed = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        email: 'admin@tracelog.com',
        name: 'Admin User',
        password: hashed,
        role: 'ADMIN',
        emailVerified: true,
      }
    });
    console.log('✅ Admin user created: admin@tracelog.com / admin123');
  } else {
    console.log('ℹ️  Admin user already exists');
  }
} catch (err) {
  console.error('❌ Admin setup failed:', err.message);
} finally {
  await prisma.$disconnect();
  await pool.end();
}

console.log('✅ Startup complete');
