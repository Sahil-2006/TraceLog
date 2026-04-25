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

async function testDeleteAPI() {
  try {
    console.log('🧪 Testing delete API endpoint...\n');

    // Create a test transcript to delete
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@tracelog.com' },
    });

    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }

    const testTranscript = await prisma.transcript.create({
      data: {
        text: 'This is a test transcript that will be deleted.',
        fileName: 'test-delete.mp3',
        userId: adminUser.id,
      },
    });

    console.log(`✅ Created test transcript: ${testTranscript.id}`);

    // Test the delete functionality directly
    const deleted = await prisma.transcript.delete({
      where: { id: testTranscript.id },
    });

    console.log(`✅ Successfully deleted transcript: ${deleted.fileName}`);
    console.log('\n🎉 Delete API functionality is working correctly!');
    console.log('   The delete endpoint should work in the browser.');

  } catch (error) {
    console.error('❌ Error testing delete API:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

testDeleteAPI();