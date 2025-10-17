// Test script to add sample history data
// Run this in the app console or use for testing

export const addTestHistoryData = async () => {
  const { HistoryStorageService } = await import('./src/services/historyStorage');
  
  const testDesigns = [
    {
      id: 'test-1',
      sessionId: 'session-001',
      createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      thumbnail: 'https://picsum.photos/300/300?random=1',
      originalImage: 'https://picsum.photos/300/300?random=2',
      status: 'completed' as const,
      title: 'Modern Living Room',
    },
    {
      id: 'test-2',
      sessionId: 'session-002',
      createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      thumbnail: 'https://picsum.photos/300/300?random=3',
      originalImage: 'https://picsum.photos/300/300?random=4',
      status: 'completed' as const,
      title: 'Kitchen Renovation',
    },
    {
      id: 'test-3',
      sessionId: 'session-003',
      createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
      thumbnail: 'https://picsum.photos/300/300?random=5',
      originalImage: 'https://picsum.photos/300/300?random=6',
      status: 'completed' as const,
      title: 'Bedroom Makeover',
    },
    {
      id: 'test-4',
      sessionId: 'session-004',
      createdAt: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
      thumbnail: 'https://picsum.photos/300/300?random=7',
      originalImage: 'https://picsum.photos/300/300?random=8',
      status: 'completed' as const,
      title: 'Bathroom Update',
    },
    {
      id: 'test-5',
      sessionId: 'session-005',
      createdAt: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
      thumbnail: 'https://picsum.photos/300/300?random=9',
      originalImage: 'https://picsum.photos/300/300?random=10',
      status: 'completed' as const,
      title: 'Home Office Design',
    },
    {
      id: 'test-6',
      sessionId: 'session-006',
      createdAt: new Date(Date.now() - 518400000).toISOString(), // 6 days ago
      thumbnail: 'https://picsum.photos/300/300?random=11',
      originalImage: 'https://picsum.photos/300/300?random=12',
      status: 'completed' as const,
      title: 'Dining Room Refresh',
    },
  ];

  try {
    for (const design of testDesigns) {
      await HistoryStorageService.saveDesignToHistory(design);
    }
    console.log('Test history data added successfully!');
  } catch (error) {
    console.error('Failed to add test history data:', error);
  }
};

// Make it available globally for testing
if (typeof window !== 'undefined') {
  (window as any).addTestHistoryData = addTestHistoryData;
}
