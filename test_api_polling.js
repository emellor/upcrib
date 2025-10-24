#!/usr/bin/env node

/**
 * Test script to verify that the polling API endpoint returns both originalImage and generatedImage URLs
 * 
 * Usage: node test_api_polling.js [SESSION_ID]
 * 
 * If no SESSION_ID is provided, it will use a sample one for demonstration
 */

const SESSION_ID = process.argv[2] || 'sample-session-id';
const API_BASE_URL = 'http://localhost:3001';

async function testPollingEndpoint() {
  try {
    console.log('🔍 Testing Enhanced Style Renovation Status API...');
    console.log(`📍 Endpoint: ${API_BASE_URL}/api/enhanced-style-renovation/${SESSION_ID}/status`);
    console.log(`🆔 Session ID: ${SESSION_ID}`);
    console.log('─'.repeat(60));

    const response = await fetch(`${API_BASE_URL}/api/enhanced-style-renovation/${SESSION_ID}/status`);
    const data = await response.json();

    console.log('📊 Response Status:', response.status);
    console.log('✅ Response OK:', response.ok);
    console.log('─'.repeat(60));

    if (data.success) {
      console.log('🎉 API Response Successful!');
      console.log('📋 Session Status:', data.data.status);
      console.log('⏳ Has Pending Jobs:', data.data.hasPendingJobs);
      console.log('📊 Style Data Available:', !!data.data.styleData);
      console.log('');
      
      if (data.data.originalImage) {
        console.log('🖼️  Original Image URL:', data.data.originalImage.url);
        console.log('📁 Original Image Path:', data.data.originalImage.path);
        console.log('📝 Original Image Filename:', data.data.originalImage.filename);
        if (data.data.originalImage.mimetype) {
          console.log('📄 Original Image Type:', data.data.originalImage.mimetype);
        }
        if (data.data.originalImage.size) {
          console.log('📏 Original Image Size:', (data.data.originalImage.size / 1024 / 1024).toFixed(2) + ' MB');
        }
      } else {
        console.log('❌ No originalImage found in response (value is null/undefined)');
      }

      if (data.data.generatedImage) {
        console.log('🎨 Generated Image URL:', data.data.generatedImage.url);
        console.log('📁 Generated Image Path:', data.data.generatedImage.path);
        console.log('📝 Generated Image Filename:', data.data.generatedImage.filename);
      } else {
        console.log('❌ No generatedImage found in response (value is null/undefined)');
      }

      // Test full URL construction
      if (data.data.originalImage?.url) {
        const fullOriginalUrl = `${API_BASE_URL}${data.data.originalImage.url}`;
        console.log('🔗 Full Original URL:', fullOriginalUrl);
      }

      if (data.data.generatedImage?.url) {
        const fullGeneratedUrl = `${API_BASE_URL}${data.data.generatedImage.url}`;
        console.log('🔗 Full Generated URL:', fullGeneratedUrl);
      }

    } else {
      console.log('❌ API Response Failed');
      console.log('🚫 Error:', data.error?.message || 'Unknown error');
    }

    console.log('─'.repeat(60));
    console.log('📋 Full Response:');
    console.log(JSON.stringify(data, null, 2));

  } catch (error) {
    console.error('❌ Test Failed:', error.message);
    console.log('');
    console.log('💡 Tips:');
    console.log('  - Make sure your backend server is running on localhost:3001');
    console.log('  - Provide a valid session ID that exists in your database');
    console.log('  - Check that the enhanced-style-renovation endpoint is implemented');
  }
}

console.log('🧪 Enhanced Style Renovation API Polling Test');
console.log('═'.repeat(60));
testPollingEndpoint();