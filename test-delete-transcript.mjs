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

async function testDeleteFunctionality() {
  try {
    console.log('🗑️  Testing transcript delete functionality...\n');

    // Get all transcripts
    const transcripts = await prisma.transcript.findMany({
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`📊 Current transcripts in database: ${transcripts.length}`);
    
    if (transcripts.length === 0) {
      console.log('   No transcripts to test deletion with.');
      return;
    }

    transcripts.forEach((transcript, index) => {
      console.log(`${index + 1}. ${transcript.fileName || 'Untitled'} (ID: ${transcript.id})`);
      console.log(`   By: ${transcript.user.name || transcript.user.email}`);
    });

    console.log('\n✅ Delete functionality is ready to test:');
    console.log('   1. Login as admin at http://localhost:3000/login');
    console.log('   2. Go to dashboard');
    console.log('   3. Click the delete (trash) icon next to any transcript');
    console.log('   4. Confirm deletion in the popup');
    console.log('   5. The transcript should be removed from the list');

  } catch (error) {
    console.error('❌ Error testing delete functionality:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

testDeleteFunctionality();