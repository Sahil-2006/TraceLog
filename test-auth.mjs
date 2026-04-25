import { auth } from './lib/auth.js';
import dotenv from 'dotenv';

dotenv.config();

async function testAuth() {
  try {
    console.log('🔄 Testing auth configuration...');
    
    // Test if auth object is created properly
    console.log('✅ Auth object created');
    console.log('Auth API methods:', Object.keys(auth.api));
    
    // Test signup
    console.log('🔄 Testing signup...');
    const signupResult = await auth.api.signUpEmail({
      body: {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      }
    });
    
    console.log('✅ Signup test result:', signupResult);
    
  } catch (error) {
    console.error('❌ Auth test failed:', error);
  }
}

testAuth();