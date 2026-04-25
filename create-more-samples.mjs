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

async function createMoreSamples() {
  try {
    console.log('🎯 Creating additional sample transcripts...\n');

    // Get users
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@tracelog.com' },
    });

    const testUser = await prisma.user.findUnique({
      where: { email: 'user@tracelog.com' },
    });

    if (!adminUser || !testUser) {
      console.log('❌ Users not found. Please run setup scripts first.');
      return;
    }

    // More diverse sample transcripts
    const moreTranscripts = [
      {
        text: "Team standup meeting: Sarah completed the user authentication module, Mike is working on the payment integration, and Lisa will start on the dashboard redesign tomorrow. No blockers reported.",
        fileName: "team-standup-monday.mp3",
        userId: adminUser.id,
      },
      {
        text: "Doctor's appointment recording: Patient reports mild headaches for the past week. Blood pressure is normal at 120/80. Recommended to increase water intake and reduce screen time. Follow-up in two weeks.",
        fileName: "medical-consultation.wav",
        userId: testUser.id,
      },
      {
        text: "Sales call with potential client: They're interested in our enterprise package for 500 users. Budget is around $50K annually. Decision timeline is end of Q1. Need to send proposal by Friday.",
        fileName: "sales-call-acme-corp.m4a",
        userId: adminUser.id,
      },
      {
        text: "Personal reminder: Pick up dry cleaning on Thursday, call mom about weekend plans, and don't forget to submit expense reports before month end. Also need to book dentist appointment.",
        fileName: "personal-reminders.mp3",
        userId: testUser.id,
      },
      {
        text: "Product demo feedback: The new search feature is intuitive, but users want keyboard shortcuts. The export functionality works well. Suggestion to add bulk actions for better productivity.",
        fileName: "product-demo-feedback.wav",
        userId: adminUser.id,
      },
      {
        text: "Language learning session: Today we practiced French pronunciation. 'Bonjour, comment allez-vous?' means 'Hello, how are you?' Next lesson will cover past tense verbs and common expressions.",
        fileName: "french-lesson-3.mp3",
        userId: testUser.id,
      },
    ];

    console.log('📝 Creating additional sample transcripts...');
    
    for (const transcript of moreTranscripts) {
      await prisma.transcript.create({
        data: transcript,
      });
      console.log(`   ✅ Created: ${transcript.fileName}`);
    }

    // Get total count
    const totalCount = await prisma.transcript.count();

    console.log(`\n🎉 Additional samples created successfully!`);
    console.log(`   Total transcripts in database: ${totalCount}`);
    console.log('   You now have a good variety of content to test with.');

  } catch (error) {
    console.error('❌ Error creating additional samples:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

createMoreSamples();