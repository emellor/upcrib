import { HistoryStorageService, DesignHistoryItem } from './src/services/historyStorage';

/**
 * Test function to add sample history data with file downloads
 */
export const testFileStorage = async () => {
  try {
    console.log('Testing file storage...');
    
    // Get storage info
    const storageInfo = await HistoryStorageService.getStorageInfo();
    console.log('Storage Info:', storageInfo);
    
    // Add a test design with image downloads
    const testDesign: DesignHistoryItem = {
      id: 'test-file-' + Date.now(),
      sessionId: 'session-file-test',
      createdAt: new Date().toISOString(),
      thumbnail: 'https://picsum.photos/300/300?random=100',
      originalImage: 'https://picsum.photos/300/300?random=101',
      status: 'completed',
      title: 'File Storage Test Design',
    };
    
    console.log('Saving test design...');
    await HistoryStorageService.saveDesignToHistory(testDesign);
    
    // Get all history
    const history = await HistoryStorageService.getDesignHistory();
    console.log('History after save:', history.length, 'items');
    
    // Find our test design
    const savedDesign = history.find(item => item.sessionId === 'session-file-test');
    if (savedDesign) {
      console.log('Test design saved successfully!');
      console.log('Local thumbnail path:', savedDesign.localThumbnailPath);
      console.log('Local original path:', savedDesign.localOriginalPath);
    } else {
      console.log('Test design not found in history');
    }
    
    return true;
  } catch (error) {
    console.error('File storage test failed:', error);
    return false;
  }
};

// Add to global scope for testing
if (typeof global !== 'undefined') {
  (global as any).testFileStorage = testFileStorage;
}
