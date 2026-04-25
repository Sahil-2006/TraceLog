import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

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

async function createSampleTranscripts() {
  try {
    console.log('🎯 Creating sample transcripts for testing...\n');

    // Get admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@tracelog.com' },
    });

    if (!adminUser) {
      console.log('❌ Admin user not found. Please run setup-admin.mjs first.');
      return;
    }

    // Create some sample transcripts
    const sampleTranscripts = [
      {
        text: "This is a sample transcript from a meeting recording. We discussed the quarterly budget and upcoming project deadlines.",
        fileName: "meeting-recording-q4.mp3",
        userId: adminUser.id,
      },
      {
        text: "Welcome to our podcast episode about artificial intelligence and machine learning. Today we'll explore the latest developments in the field.",
        fileName: "podcast-episode-12.wav",
        userId: adminUser.id,
      },
      {
        text: "Customer service call transcript: Hello, I'm calling about my recent order. The delivery was delayed and I need to update my shipping address.",
        fileName: "customer-call-001.m4a",
        userId: adminUser.id,
      },
    ];

    console.log('📝 Creating sample transcripts...');
    
    for (const transcript of sampleTranscripts) {
      await prisma.transcript.create({
        data: transcript,
      });
      console.log(`   ✅ Created: ${transcript.fileName}`);
    }

    console.log('\n🎉 Sample transcripts created successfully!');
    console.log('   You can now test the admin dashboard to see all transcripts.');

  } catch (error) {
    console.error('❌ Error creating sample transcripts:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

createSampleTranscripts();