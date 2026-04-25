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

async function checkAdmin() {
  try {
    console.log('🔄 Checking admin user...');
    
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@tracelog.com' }
    });
    
    if (admin) {
      console.log('✅ Admin user found:');
      console.log('- ID:', admin.id);
      console.log('- Email:', admin.email);
      console.log('- Name:', admin.name);
      console.log('- Role:', admin.role);
      console.log('- Has password:', !!admin.password);
      console.log('- Email verified:', admin.emailVerified);
      
      // Test password
      if (admin.password) {
        const isValid = await bcrypt.compare('admin123', admin.password);
        console.log('- Password "admin123" valid:', isValid);
      }
    } else {
      console.log('❌ Admin user not found');
      
      // Create admin user
      console.log('🔄 Creating admin user...');
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      const newAdmin = await prisma.user.create({
        data: {
          email: 'admin@tracelog.com',
          name: 'Admin User',
          password: hashedPassword,
          role: 'ADMIN',
          emailVerified: true
        }
      });
      
      console.log('✅ Admin user created:', newAdmin.email);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();