#!/usr/bin/env node

/**
 * Test DesignStyleScreen polling functionality
 * This simulates the polling that happens in the DesignStyleScreen
 */

const SESSION_ID = 'bb906fb9-e411-4a02-a784-c436d605003f'; // Completed session
const API_BASE_URL = 'http://localhost:3001';

async function testDesignStyleScreenPolling() {
  try {
    console.log('🎨 Testing DesignStyleScreen Polling Functionality');
    console.log('═'.repeat(60));
    console.log('🆔 Session ID:', SESSION_ID);
    console.log('📍 Endpoint:', `${API_BASE_URL}/api/enhanced-style-renovation/${SESSION_ID}/status`);
    console.log('');

    let pollCount = 0;
    const maxPolls = 3; // Test just a few polls

    const pollStatus = async () => {
      pollCount++;
      console.log(`🔄 Poll #${pollCount} - Checking renovation status...`);
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/enhanced-style-renovation/${SESSION_ID}/status`);
        const data = await response.json();
        
        console.log('📊 POLLING RESPONSE:');
        console.log('═'.repeat(40));
        console.log('📍 Session ID:', SESSION_ID);
        console.log('📊 Status:', data.data?.status);
        console.log('⏳ Has Pending Jobs:', data.data?.hasPendingJobs);
        
        if (data.data?.originalImage?.url) {
          console.log('🖼️  Original Image URL:', data.data.originalImage.url);
          console.log('   Full URL:', `${API_BASE_URL}${data.data.originalImage.url}`);
        } else {
          console.log('❌ Original Image: Not available');
        }
        
        if (data.data?.generatedImage?.url) {
          console.log('🎨 Generated Image URL:', data.data.generatedImage.url);
          console.log('   Full URL:', `${API_BASE_URL}${data.data.generatedImage.url}`);
        } else {
          console.log('❌ Generated Image: Not available');
        }
        
        console.log('═'.repeat(40));
        
        // Check if renovation is complete
        if (data.data?.status === 'completed') {
          console.log('🎉 RENOVATION COMPLETED!');
          console.log('✅ DesignStyleScreen should now display:');
          console.log('   - "Your Renovation is Ready!" message');
          console.log('   - Before & After image comparison');
          console.log('   - "View Full Result" button');
          console.log('   - Polling should stop');
          return true; // Stop polling
        } else if (data.data?.status === 'failed') {
          console.log('❌ RENOVATION FAILED!');
          console.log('⚠️  DesignStyleScreen should stop polling');
          return true; // Stop polling
        } else {
          console.log(`⏳ Status: ${data.data?.status || 'unknown'} - Continue polling...`);
          return false; // Continue polling
        }
        
      } catch (error) {
        console.error('❌ Polling error:', error.message);
        return false; // Continue polling despite error
      }
    };

    // Simulate polling loop
    while (pollCount < maxPolls) {
      const shouldStop = await pollStatus();
      
      if (shouldStop) {
        console.log('');
        console.log('🛑 Polling stopped - renovation complete or failed');
        break;
      }
      
      if (pollCount < maxPolls) {
        console.log('⏱️  Waiting 3 seconds before next poll...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        console.log('');
      }
    }

    if (pollCount >= maxPolls) {
      console.log('');
      console.log('⏰ Reached maximum test polls');
    }

    console.log('');
    console.log('📱 DESIGNSTYLESCREEN BEHAVIOR:');
    console.log('   1. After user clicks "Generate Design"');
    console.log('   2. Start polling every 3 seconds');
    console.log('   3. Show progress indicator while status != "completed"');
    console.log('   4. When completed, display before/after images');
    console.log('   5. Provide navigation to full ResultScreen');

  } catch (error) {
    console.error('❌ Test Failed:', error.message);
  }
}

testDesignStyleScreenPolling();