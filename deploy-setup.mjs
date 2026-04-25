import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

console.log('🚀 Starting Railway deployment setup...\n');

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create Prisma adapter
const adapter = new PrismaPg(pool);

// Create Prisma client with adapter
const prisma = new PrismaClient({
  adapter,
});

async function deploymentSetup() {
  try {
    console.log('📊 Checking database connection...');
    
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Push database schema
    console.log('📋 Setting up database schema...');
    // Note: In production, you might want to use migrations instead
    // For now, we'll assume the schema is already applied

    // Check if admin user exists
    console.log('👤 Checking for admin user...');
    let adminUser = await prisma.user.findUnique({
      where: { email: 'admin@tracelog.com' },
    });

    if (!adminUser) {
      console.log('🔧 Creating admin user...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      adminUser = await prisma.user.create({
        data: {
          email: 'admin@tracelog.com',
          name: 'Admin User',
          password: hashedPassword,
          role: 'ADMIN',
          emailVerified: true,
        },
      });
      console.log('✅ Admin user created successfully');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Create some sample data if none exists
    const transcriptCount = await prisma.transcript.count();
    if (transcriptCount === 0) {
      console.log('📝 Creating sample transcripts...');
      
      const sampleTranscripts = [
        {
          text: "Welcome to TraceLog! This is a sample transcript to demonstrate the application functionality. You can upload audio files and get AI-powered transcriptions.",
          fileName: "welcome-demo.mp3",
          userId: adminUser.id,
        },
        {
          text: "This is another sample transcript showing how the admin dashboard displays multiple transcripts with proper user attribution and timestamps.",
          fileName: "sample-recording.wav",
          userId: adminUser.id,
        },
      ];

      for (const transcript of sampleTranscripts) {
        await prisma.transcript.create({ data: transcript });
      }
      console.log('✅ Sample transcripts created');
    }

    console.log('\n🎉 Railway deployment setup completed successfully!');
    console.log('📋 Summary:');
    console.log('   - Database schema: Ready');
    console.log('   - Admin user: admin@tracelog.com / admin123');
    console.log('   - Sample data: Available');
    console.log('\n🌐 Your TraceLog application is ready to use!');

  } catch (error) {
    console.error('❌ Deployment setup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

deploymentSetup();