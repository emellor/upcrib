#!/usr/bin/env node

/**
 * Test specific session ID for "Renovation Ready" screen
 * This tests the completed renovation session to verify both images are available
 */

const SESSION_ID = 'bb906fb9-e411-4a02-a784-c436d605003f';
const API_BASE_URL = 'http://localhost:3001';

async function testRenovationReadyScreen() {
  try {
    console.log('🎉 Testing "Renovation Ready" Screen Data');
    console.log('═'.repeat(60));
    console.log('🆔 Session ID:', SESSION_ID);
    console.log('📍 Endpoint:', `${API_BASE_URL}/api/enhanced-style-renovation/${SESSION_ID}/status`);
    console.log('');

    const response = await fetch(`${API_BASE_URL}/api/enhanced-style-renovation/${SESSION_ID}/status`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${data.error?.message || 'Request failed'}`);
    }

    if (!data.success) {
      throw new Error(data.error?.message || 'API returned success: false');
    }

    console.log('✅ API Response Successful!');
    console.log('');

    // Test renovation completion
    if (data.data.status === 'completed') {
      console.log('🎉 RENOVATION STATUS: COMPLETED ✅');
    } else {
      console.log(`⚠️  RENOVATION STATUS: ${data.data.status.toUpperCase()}`);
      console.log('   Expected: completed');
    }

    console.log('⏳ Has Pending Jobs:', data.data.hasPendingJobs);
    console.log('');

    // Test image availability
    const hasOriginal = !!(data.data.originalImage?.url);
    const hasGenerated = !!(data.data.generatedImage?.url);

    console.log('🖼️  BEFORE/AFTER IMAGE AVAILABILITY:');
    console.log(`   Original Image (Before): ${hasOriginal ? '✅ Available' : '❌ Missing'}`);
    console.log(`   Generated Image (After): ${hasGenerated ? '✅ Available' : '❌ Missing'}`);
    console.log('');

    if (hasOriginal && hasGenerated) {
      console.log('🎨 BEFORE & AFTER SLIDER READY! 🎨');
      console.log('');
      
      // Show image details
      console.log('📸 ORIGINAL IMAGE (BEFORE):');
      console.log(`   URL: ${data.data.originalImage.url}`);
      console.log(`   Filename: ${data.data.originalImage.filename}`);
      console.log(`   Full URL: ${API_BASE_URL}${data.data.originalImage.url}`);
      if (data.data.originalImage.size) {
        console.log(`   Size: ${(data.data.originalImage.size / 1024 / 1024).toFixed(2)} MB`);
      }
      console.log('');

      console.log('🎨 GENERATED IMAGE (AFTER):');
      console.log(`   URL: ${data.data.generatedImage.url}`);
      console.log(`   Filename: ${data.data.generatedImage.filename}`);
      console.log(`   Full URL: ${API_BASE_URL}${data.data.generatedImage.url}`);
      console.log('');

      // Test image accessibility
      console.log('🔍 Testing Image Accessibility...');
      
      try {
        const originalResponse = await fetch(`${API_BASE_URL}${data.data.originalImage.url}`);
        console.log(`   Original Image: ${originalResponse.ok ? '✅ Accessible' : '❌ Not Accessible'} (${originalResponse.status})`);
      } catch (err) {
        console.log('   Original Image: ❌ Network Error');
      }

      try {
        const generatedResponse = await fetch(`${API_BASE_URL}${data.data.generatedImage.url}`);
        console.log(`   Generated Image: ${generatedResponse.ok ? '✅ Accessible' : '❌ Not Accessible'} (${generatedResponse.status})`);
      } catch (err) {
        console.log('   Generated Image: ❌ Network Error');
      }

    } else {
      console.log('⚠️  BEFORE & AFTER SLIDER NOT READY');
      console.log('   Missing required images for comparison');
    }

    console.log('');
    console.log('📱 MOBILE APP TESTING:');
    console.log(`   1. Navigate to ResultScreen with sessionId: "${SESSION_ID}"`);
    console.log('   2. Check console logs for detailed debugging info');
    console.log('   3. Verify before/after slider displays both images');
    console.log('   4. Test drag interaction on the slider');

    console.log('');
    console.log('📋 FULL RESPONSE PAYLOAD FOR DEBUGGING:');
    console.log(JSON.stringify(data, null, 2));

  } catch (error) {
    console.error('❌ Test Failed:', error.message);
    console.log('');
    console.log('💡 Troubleshooting:');
    console.log('  - Ensure backend server is running on localhost:3001');
    console.log('  - Check that the session ID exists in your database');
    console.log('  - Verify the enhanced-style-renovation endpoint is working');
  }
}

testRenovationReadyScreen();