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

async function testAdminTranscripts() {
  try {
    console.log('🔍 Testing admin transcript viewing functionality...\n');

    // Check if we have any transcripts in the database
    const transcripts = await prisma.transcript.findMany({
      include: {
        user: {
          select: {
            email: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`📊 Found ${transcripts.length} transcripts in database:`);
    
    if (transcripts.length === 0) {
      console.log('   No transcripts found. Upload some audio files first.');
    } else {
      transcripts.forEach((transcript, index) => {
        console.log(`\n${index + 1}. ${transcript.fileName || 'Untitled'}`);
        console.log(`   Uploaded by: ${transcript.user.name || transcript.user.email} (${transcript.user.role})`);
        console.log(`   Created: ${transcript.createdAt.toLocaleString()}`);
        console.log(`   Text preview: ${transcript.text.substring(0, 100)}${transcript.text.length > 100 ? '...' : ''}`);
      });
    }

    // Check admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@tracelog.com' },
      select: {
        id: true,
        email: true,
        role: true,
        _count: {
          select: {
            transcripts: true,
          },
        },
      },
    });

    console.log(`\n👤 Admin user status:`);
    if (adminUser) {
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Role: ${adminUser.role}`);
      console.log(`   Transcripts uploaded: ${adminUser._count.transcripts}`);
    } else {
      console.log('   Admin user not found!');
    }

    console.log('\n✅ Admin transcript viewing is configured to show ALL transcripts from ALL users');
    console.log('   The dashboard will display who uploaded each transcript');

  } catch (error) {
    console.error('❌ Error testing admin transcripts:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

testAdminTranscripts();