import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

async function testSignupAPI() {
  try {
    console.log('🔄 Testing signup API...');
    
    const response = await fetch('http://localhost:3000/api/auth/sign-up/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      })
    });
    
    const result = await response.text();
    console.log('Response status:', response.status);
    console.log('Response body:', result);
    
    if (response.ok) {
      console.log('✅ Signup API working');
    } else {
      console.log('❌ Signup API failed');
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error);
  }
}

testSignupAPI();