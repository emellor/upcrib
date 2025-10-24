const { enhancedStyleRenovationApi } = require('./src/services/enhancedStyleRenovationApi');

async function testDirectApiCall() {
  try {
    console.log('🧪 Testing Enhanced Style Renovation API directly...');
    
    const request = {
      houseImageUri: 'https://picsum.photos/400/300', // Use a web URL for testing
      architecturalStyle: 'modern-farmhouse',
      colorPalette: 'neutral-tones'
    };
    
    console.log('📡 Making API call with request:', request);
    
    const result = await enhancedStyleRenovationApi.createAndWaitForCompletion(
      request,
      (status) => {
        console.log('📊 Status update:', status);
      }
    );
    
    console.log('✅ API call successful! Result:', result);
    
  } catch (error) {
    console.error('❌ API call failed:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
  }
}

testDirectApiCall();