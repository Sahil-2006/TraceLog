import fetch from 'node-fetch';

async function testAPIRoute() {
  try {
    console.log('🧪 Testing API route accessibility...\n');

    // Test if the server is running
    const healthCheck = await fetch('http://localhost:3000/api/transcripts', {
      method: 'GET',
    });

    console.log(`Health check status: ${healthCheck.status}`);
    
    if (healthCheck.status === 401) {
      console.log('✅ API is accessible (401 expected without auth)');
    } else {
      console.log(`Response: ${await healthCheck.text()}`);
    }

    // Test the delete endpoint structure (should return 401 without auth)
    const deleteTest = await fetch('http://localhost:3000/api/transcripts/test-id', {
      method: 'DELETE',
    });

    console.log(`Delete endpoint status: ${deleteTest.status}`);
    
    if (deleteTest.status === 401) {
      console.log('✅ Delete endpoint is accessible (401 expected without auth)');
    } else {
      console.log(`Delete response: ${await deleteTest.text()}`);
    }

  } catch (error) {
    console.error('❌ Error testing API route:', error.message);
    console.log('Make sure the development server is running on port 3000');
  }
}

testAPIRoute();