import { PrismaClient } from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function fixAdminPassword() {
  try {
    console.log('🔄 Fixing admin password...');
    
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const updatedAdmin = await prisma.user.update({
      where: { email: 'admin@tracelog.com' },
      data: { password: hashedPassword }
    });
    
    console.log('✅ Admin password updated successfully');
    
    // Verify the password works
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@tracelog.com' }
    });
    
    if (admin?.password) {
      const isValid = await bcrypt.compare('admin123', admin.password);
      console.log('✅ Password verification:', isValid ? 'SUCCESS' : 'FAILED');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdminPassword();