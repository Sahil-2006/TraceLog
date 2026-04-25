import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
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

async function createTestUserAndTranscripts() {
  try {
    console.log('👤 Creating test user and transcripts...\n');

    // Create a regular user
    const hashedPassword = await bcrypt.hash('user123', 10);
    
    let testUser;
    try {
      testUser = await prisma.user.create({
        data: {
          email: 'user@tracelog.com',
          name: 'Test User',
          password: hashedPassword,
          role: 'USER',
        },
      });
      console.log('✅ Created test user: user@tracelog.com');
    } catch (error) {
      if (error.code === 'P2002') {
        // User already exists, get the existing user
        testUser = await prisma.user.findUnique({
          where: { email: 'user@tracelog.com' },
        });
        console.log('ℹ️  Test user already exists: user@tracelog.com');
      } else {
        throw error;
      }
    }

    // Create transcripts for the test user
    const userTranscripts = [
      {
        text: "Personal voice memo: Remember to pick up groceries on the way home. Need milk, bread, and eggs for tomorrow's breakfast.",
        fileName: "voice-memo-groceries.mp3",
        userId: testUser.id,
      },
      {
        text: "Interview recording with candidate John Smith for the software engineer position. He has 5 years of experience in React and Node.js.",
        fileName: "interview-john-smith.wav",
        userId: testUser.id,
      },
    ];

    console.log('📝 Creating transcripts for test user...');
    
    for (const transcript of userTranscripts) {
      await prisma.transcript.create({
        data: transcript,
      });
      console.log(`   ✅ Created: ${transcript.fileName}`);
    }

    console.log('\n🎉 Test user and transcripts created successfully!');
    console.log('   Admin can now see transcripts from multiple users in the dashboard.');

  } catch (error) {
    console.error('❌ Error creating test user and transcripts:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

createTestUserAndTranscripts();