import RNFS from 'react-native-fs';
import RNBlobUtil from 'react-native-blob-util';

export interface DesignHistoryItem {
  id: string;
  sessionId: string;
  createdAt: string;
  thumbnail: string; // URL for the generated image
  originalImage?: string; // URL for the original image
  status: 'generating' | 'completed' | 'failed';
  title?: string; // User-defined or generated title
  localThumbnailPath?: string; // Local file path for thumbnail
  localOriginalPath?: string; // Local file path for original image
}

const HISTORY_FILE_NAME = 'design_history.json';
const IMAGES_FOLDER = 'design_images';

export class HistoryStorageService {
  
  /**
   * Get the path to the history file
   */
  private static getHistoryFilePath(): string {
    return `${RNFS.DocumentDirectoryPath}/${HISTORY_FILE_NAME}`;
  }
  
  /**
   * Get the path to the images folder
   */
  private static getImagesFolderPath(): string {
    return `${RNFS.DocumentDirectoryPath}/${IMAGES_FOLDER}`;
  }
  
  /**
   * Ensure the images folder exists
   */
  private static async ensureImagesFolderExists(): Promise<void> {
    const imagesPath = this.getImagesFolderPath();
    const exists = await RNFS.exists(imagesPath);
    if (!exists) {
      await RNFS.mkdir(imagesPath);
    }
  }
  
  /**
   * Download and save an image locally
   */
  private static async saveImageLocally(imageUrl: string, fileName: string): Promise<string> {
    console.log('Saving image locally from URL:', imageUrl);
    console.log('Target file name:', fileName);
    try {
      await this.ensureImagesFolderExists();
      const localPath = `${this.getImagesFolderPath()}/${fileName}`;
      
      // Check if file already exists
      const exists = await RNFS.exists(localPath);
      if (exists) {
        return localPath;
      }
      
      // Download the image
      if (imageUrl.startsWith('content://') || imageUrl.startsWith('file://')) {
        // Handle content:// or file:// URIs
        // Strip file:// prefix if present
        const sourcePath = imageUrl.replace('file://', '');
        await RNFS.copyFile(sourcePath, localPath);
      } else if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        // Download from URL
        const downloadResult = await RNFS.downloadFile({
          fromUrl: imageUrl,
          toFile: localPath,
        }).promise;
        
        if (downloadResult.statusCode !== 200) {
          throw new Error(`Failed to download image: ${downloadResult.statusCode}`);
        }
      } else {
        // Assume it's a local path, copy it
        await RNFS.copyFile(imageUrl, localPath);
      }
      
      return localPath;
    } catch (error) {
      console.warn('Failed to save image locally:', error);
      // Return original URL as fallback
      return imageUrl;
    }
  }
  
  /**
   * Generate a unique filename for an image
   */
  private static generateImageFileName(sessionId: string, type: 'thumbnail' | 'original'): string {
    const timestamp = Date.now();
    const extension = 'jpg'; // Default extension
    return `${sessionId}_${type}_${timestamp}.${extension}`;
  }
  
  /**
   * Save a design to history
   */
  static async saveDesignToHistory(design: DesignHistoryItem): Promise<void> {
    try {
      // Download and save images locally
      const thumbnailFileName = this.generateImageFileName(design.sessionId, 'thumbnail');
      const localThumbnailPath = await this.saveImageLocally(design.thumbnail, thumbnailFileName);
      
      let localOriginalPath: string | undefined;
      if (design.originalImage) {
        const originalFileName = this.generateImageFileName(design.sessionId, 'original');
        localOriginalPath = await this.saveImageLocally(design.originalImage, originalFileName);
      }
      
      // Create design with local paths
      const designWithLocalPaths: DesignHistoryItem = {
        ...design,
        localThumbnailPath,
        localOriginalPath,
      };
      
      const existingHistory = await this.getDesignHistory();
      
      // Check if design already exists (update if it does)
      const existingIndex = existingHistory.findIndex(item => item.sessionId === design.sessionId);
      
      if (existingIndex >= 0) {
        // Update existing design
        existingHistory[existingIndex] = designWithLocalPaths;
      } else {
        // Add new design to the beginning of the array
        existingHistory.unshift(designWithLocalPaths);
      }
      
      // Keep only the last 100 designs to avoid storage bloat
      const trimmedHistory = existingHistory.slice(0, 100);
      
      // Save to file
      const historyFilePath = this.getHistoryFilePath();
      await RNFS.writeFile(historyFilePath, JSON.stringify(trimmedHistory, null, 2), 'utf8');
      
      console.log('Design saved to file storage:', design.title || design.sessionId);
    } catch (error) {
      console.error('Failed to save design to history:', error);
      throw error;
    }
  }
  
  /**
   * Get all design history
   */
  static async getDesignHistory(): Promise<DesignHistoryItem[]> {
    try {
      const historyFilePath = this.getHistoryFilePath();
      const exists = await RNFS.exists(historyFilePath);
      
      if (!exists) {
        // Return sample data for testing
        return this.getSampleData();
      }
      
      const historyData = await RNFS.readFile(historyFilePath, 'utf8');
      const history: DesignHistoryItem[] = JSON.parse(historyData);
      
      // If history is empty, return sample data
      if (history.length === 0) {
        return this.getSampleData();
      }
      
      return history;
    } catch (error) {
      console.error('Failed to get design history:', error);
      // Return sample data as fallback
      return this.getSampleData();
    }
  }
  
  /**
   * Get sample data for testing
   */
  private static getSampleData(): DesignHistoryItem[] {
    return [
      {
        id: 'sample-1',
        sessionId: 'session-sample-001',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        thumbnail: 'https://picsum.photos/300/300?random=1',
        originalImage: 'https://picsum.photos/300/300?random=2',
        status: 'completed',
        title: 'Modern Living Room',
      },
      {
        id: 'sample-2',
        sessionId: 'session-sample-002',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        thumbnail: 'https://picsum.photos/300/300?random=3',
        originalImage: 'https://picsum.photos/300/300?random=4',
        status: 'completed',
        title: 'Kitchen Renovation',
      },
      {
        id: 'sample-3',
        sessionId: 'session-sample-003',
        createdAt: new Date(Date.now() - 259200000).toISOString(),
        thumbnail: 'https://picsum.photos/300/300?random=5',
        originalImage: 'https://picsum.photos/300/300?random=6',
        status: 'completed',
        title: 'Bedroom Makeover',
      },
      {
        id: 'sample-4',
        sessionId: 'session-sample-004',
        createdAt: new Date(Date.now() - 345600000).toISOString(),
        thumbnail: 'https://picsum.photos/300/300?random=7',
        originalImage: 'https://picsum.photos/300/300?random=8',
        status: 'completed',
        title: 'Bathroom Update',
      },
      {
        id: 'sample-5',
        sessionId: 'session-sample-005',
        createdAt: new Date(Date.now() - 432000000).toISOString(),
        thumbnail: 'https://picsum.photos/300/300?random=9',
        originalImage: 'https://picsum.photos/300/300?random=10',
        status: 'completed',
        title: 'Home Office Design',
      },
      {
        id: 'sample-6',
        sessionId: 'session-sample-006',
        createdAt: new Date(Date.now() - 518400000).toISOString(),
        thumbnail: 'https://picsum.photos/300/300?random=11',
        originalImage: 'https://picsum.photos/300/300?random=12',
        status: 'completed',
        title: 'Dining Room Refresh',
      },
    ];
  }
  
  /**
   * Delete a specific design from history
   */
  static async deleteDesignFromHistory(sessionId: string): Promise<void> {
    try {
      const existingHistory = await this.getDesignHistory();
      const designToDelete = existingHistory.find(item => item.sessionId === sessionId);
      
      // Delete associated image files
      if (designToDelete) {
        if (designToDelete.localThumbnailPath) {
          const exists = await RNFS.exists(designToDelete.localThumbnailPath);
          if (exists) {
            await RNFS.unlink(designToDelete.localThumbnailPath);
          }
        }
        if (designToDelete.localOriginalPath) {
          const exists = await RNFS.exists(designToDelete.localOriginalPath);
          if (exists) {
            await RNFS.unlink(designToDelete.localOriginalPath);
          }
        }
      }
      
      const filteredHistory = existingHistory.filter(item => item.sessionId !== sessionId);
      
      // Save updated history
      const historyFilePath = this.getHistoryFilePath();
      await RNFS.writeFile(historyFilePath, JSON.stringify(filteredHistory, null, 2), 'utf8');
      
      console.log('Design deleted from file storage:', sessionId);
    } catch (error) {
      console.error('Failed to delete design from history:', error);
      throw error;
    }
  }
  
  /**
   * Clear all design history
   */
  static async clearDesignHistory(): Promise<void> {
    try {
      // Get existing history to delete image files
      const existingHistory = await this.getDesignHistory();
      
      // Delete all image files
      for (const design of existingHistory) {
        if (design.localThumbnailPath) {
          const exists = await RNFS.exists(design.localThumbnailPath);
          if (exists) {
            await RNFS.unlink(design.localThumbnailPath);
          }
        }
        if (design.localOriginalPath) {
          const exists = await RNFS.exists(design.localOriginalPath);
          if (exists) {
            await RNFS.unlink(design.localOriginalPath);
          }
        }
      }
      
      // Clear the history file
      const historyFilePath = this.getHistoryFilePath();
      await RNFS.writeFile(historyFilePath, JSON.stringify([], null, 2), 'utf8');
      
      console.log('All designs cleared from file storage');
    } catch (error) {
      console.error('Failed to clear design history:', error);
      throw error;
    }
  }
  
  /**
   * Get a specific design from history
   */
  static async getDesignFromHistory(sessionId: string): Promise<DesignHistoryItem | null> {
    try {
      const history = await this.getDesignHistory();
      return history.find(item => item.sessionId === sessionId) || null;
    } catch (error) {
      console.error('Failed to get design from history:', error);
      return null;
    }
  }
  
  /**
   * Update a design title in history
   */
  static async updateDesignTitle(sessionId: string, title: string): Promise<void> {
    try {
      const existingHistory = await this.getDesignHistory();
      const designIndex = existingHistory.findIndex(item => item.sessionId === sessionId);
      
      if (designIndex >= 0) {
        existingHistory[designIndex].title = title;
        
        // Save updated history
        const historyFilePath = this.getHistoryFilePath();
        await RNFS.writeFile(historyFilePath, JSON.stringify(existingHistory, null, 2), 'utf8');
        
        console.log('Design title updated in file storage:', title);
      }
    } catch (error) {
      console.error('Failed to update design title:', error);
      throw error;
    }
  }
  
  /**
   * Get storage info for debugging
   */
  static async getStorageInfo(): Promise<{
    historyFilePath: string;
    imagesFolderPath: string;
    historyFileExists: boolean;
    imagesFolderExists: boolean;
    historyCount: number;
  }> {
    try {
      const historyFilePath = this.getHistoryFilePath();
      const imagesFolderPath = this.getImagesFolderPath();
      
      const historyFileExists = await RNFS.exists(historyFilePath);
      const imagesFolderExists = await RNFS.exists(imagesFolderPath);
      
      const history = await this.getDesignHistory();
      
      return {
        historyFilePath,
        imagesFolderPath,
        historyFileExists,
        imagesFolderExists,
        historyCount: history.length,
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      throw error;
    }
  }
}
