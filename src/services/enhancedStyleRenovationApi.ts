const ENHANCED_STYLE_API_BASE = __DEV__ ? 'http://localhost:3001/api/enhanced-style-renovation' : 'https://upcrib-backend.onrender.com/api/enhanced-style-renovation';

export interface ArchitecturalStyle {
  id: string;
  name: string;
  description: string;
  period: string;
  characteristics: string[];
  iconUri?: string; // Optional icon URL from API
}

export interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
  description: string;
}

export interface EnhancedStyleRenovationRequest {
  houseImageUri: string; // Local file URI for React Native
  referenceImageUri?: string; // Optional reference image
  architecturalStyle?: string; // Style ID
  customStyleDescription?: string; // Custom style description
  colorPalette?: string; // Palette ID
  customColors?: string[]; // Custom hex colors (3-6 colors)
}

export interface EnhancedStyleRenovationResponse {
  success: boolean;
  data: {
    sessionId: string;
    jobId: string;
    status: string;
    message: string;
  };
  meta: {
    timestamp: string;
  };
}

export interface RenovationStatusResponse {
  success: boolean;
  data: {
    sessionId: string;
    status: 'uploading' | 'uploaded' | 'generating' | 'completed' | 'failed';
    hasPendingJobs: boolean;
    originalImage?: {
      path: string;
      filename: string;
      mimetype?: string;
      size?: number;
      uploadedAt?: string;
      url: string;
    };
    generatedImage?: {
      path: string;
      filename: string;
      url: string;
    };
  };
  meta: {
    timestamp: string;
  };
}

class EnhancedStyleRenovationApi {
  private baseUrl = ENHANCED_STYLE_API_BASE;

  // Step 1: Get available architectural styles
  async getArchitecturalStyles(): Promise<ArchitecturalStyle[]> {
    try {
      const response = await fetch(`${this.baseUrl}/styles`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to fetch architectural styles');
      }
      
      // Handle both direct data array and nested data.styles structure
      const styles = data.data?.styles || data.data || [];
      return styles;
    } catch (error) {
      console.error('Error fetching architectural styles:', error);
      throw error;
    }
  }

  // Step 2: Get available color palettes
  async getColorPalettes(): Promise<ColorPalette[]> {
    try {
      const response = await fetch(`${this.baseUrl}/color-palettes`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to fetch color palettes');
      }
      
      // Handle both direct data array and nested data.palettes structure
      const palettes = data.data?.palettes || data.data || [];
      return palettes;
    } catch (error) {
      console.error('Error fetching color palettes:', error);
      throw error;
    }
  }

  // Step 3: Create enhanced style renovation
  async createRenovation(request: EnhancedStyleRenovationRequest): Promise<EnhancedStyleRenovationResponse> {
    try {
      console.log('🚀 [EnhancedStyleApi] Creating enhanced style renovation with:', JSON.stringify(request, null, 2));
      
      const formData = new FormData();
      
      // Add house image (required)
      formData.append('houseImage', {
        uri: request.houseImageUri,
        type: 'image/jpeg',
        name: 'house.jpg',
      } as any);
      console.log('📸 [EnhancedStyleApi] Added house image:', request.houseImageUri);
      
      // Add reference image if provided
      if (request.referenceImageUri) {
        formData.append('referenceImage', {
          uri: request.referenceImageUri,
          type: 'image/jpeg',
          name: 'reference.jpg',
        } as any);
        console.log('📸 [EnhancedStyleApi] Added reference image:', request.referenceImageUri);
      }
      
      // Add style configuration (choose one)
      if (request.architecturalStyle) {
        formData.append('architecturalStyle', request.architecturalStyle);
        console.log('🏗️ [EnhancedStyleApi] Added architectural style:', request.architecturalStyle);
      } else if (request.customStyleDescription) {
        formData.append('customStyleDescription', request.customStyleDescription);
        console.log('🏗️ [EnhancedStyleApi] Added custom style description:', request.customStyleDescription);
      }
      
      // Add color configuration (choose one)
      if (request.colorPalette) {
        formData.append('colorPalette', request.colorPalette);
        console.log('🎨 [EnhancedStyleApi] Added color palette:', request.colorPalette);
      } else if (request.customColors) {
        formData.append('customColors', JSON.stringify(request.customColors));
        console.log('🎨 [EnhancedStyleApi] Added custom colors:', request.customColors);
      }
      
      console.log('📡 [EnhancedStyleApi] API Request: POST', this.baseUrl);
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        body: formData,
      });
      
      console.log('📡 [EnhancedStyleApi] API Response:', response.status, response.statusText);
      console.log('📡 [EnhancedStyleApi] Response headers:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));
      
      const data = await response.json();
      console.log('📋 [EnhancedStyleApi] Full response data:', JSON.stringify(data, null, 2));
      console.log('🆔 [EnhancedStyleApi] Session ID created:', data.data?.sessionId);
      
      if (!data.success) {
        console.error('❌ [EnhancedStyleApi] Create renovation failed:', data.error);
        throw new Error(data.error?.message || 'Failed to create renovation');
      }
      
      return data;
    } catch (error) {
      console.error('Error creating renovation:', error);
      throw error;
    }
  }

  // Step 4: Get renovation status
  async getRenovationStatus(sessionId: string): Promise<RenovationStatusResponse> {
    try {
      const statusUrl = `${this.baseUrl}/${sessionId}/status`;
      console.log('🔄 [EnhancedStyleApi] Getting renovation status from:', statusUrl);
      
      const response = await fetch(statusUrl);
      console.log('📡 [EnhancedStyleApi] Status response:', response.status, response.statusText);
      
      const data = await response.json();
      console.log('📋 [EnhancedStyleApi] Status full response:', JSON.stringify(data, null, 2));
      console.log('🖼️ [EnhancedStyleApi] Original image data:', {
        hasOriginalImage: !!data.data?.originalImage,
        originalImageUrl: data.data?.originalImage?.url,
        originalImagePath: data.data?.originalImage?.path,
        dataKeys: Object.keys(data.data || {})
      });
      
      if (!data.success) {
        console.error('❌ [EnhancedStyleApi] API returned error:', data.error);
        throw new Error(data.error?.message || 'Failed to get renovation status');
      }
      
      // Save completed renovation to local storage
      if (data.data?.status === 'completed' && data.data?.originalImage && data.data?.generatedImage) {
        console.log('💾 [EnhancedStyleApi] Saving completed renovation to local storage');
        await this.saveCompletedRenovation(data.data);
      }
      
      return data;
    } catch (error) {
      console.error('❌ [EnhancedStyleApi] Error getting renovation status:', error);
      throw error;
    }
  }

  // Step 5: Poll for completion
  async pollForCompletion(
    sessionId: string, 
    onProgress?: (status: string) => void,
    timeoutMs: number = 300000 // 5 minutes default
  ): Promise<RenovationStatusResponse> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const poll = async () => {
        try {
          // Check timeout
          if (Date.now() - startTime > timeoutMs) {
            reject(new Error('Renovation generation timeout'));
            return;
          }
          
          const status = await this.getRenovationStatus(sessionId);
          
          if (onProgress) {
            onProgress(status.data.status);
          }
          
          console.log('Polling status:', status.data.status);
          
          if (status.data.status === 'completed') {
            resolve(status);
          } else if (status.data.status === 'failed') {
            reject(new Error('Renovation generation failed'));
          } else {
            // Continue polling every 5 seconds
            setTimeout(poll, 5000);
          }
        } catch (error) {
          reject(error);
        }
      };
      
      poll();
    });
  }

  // Convenience method: Create and wait for completion
  async createAndWaitForCompletion(
    request: EnhancedStyleRenovationRequest,
    onProgress?: (status: string) => void
  ): Promise<{ sessionId: string; imageUrl: string }> {
    // Step 3: Create renovation
    const createResponse = await this.createRenovation(request);
    const sessionId = createResponse.data.sessionId;
    
    // Step 4-5: Poll until completion
    const completedStatus = await this.pollForCompletion(sessionId, onProgress);
    
    if (!completedStatus.data.generatedImage) {
      throw new Error('No generated image found in completed status');
    }
    
    // Construct full image URL
    const baseUrl = __DEV__ ? 'http://localhost:3001' : 'https://upcrib-backend.onrender.com';
    const imageUrl = `${baseUrl}${completedStatus.data.generatedImage.url}`;
    
    return {
      sessionId,
      imageUrl
    };
  }

  // Save completed renovation to local storage
  async saveCompletedRenovation(renovationData: any): Promise<void> {
    try {
      const { HistoryStorageService } = require('./historyStorage');
      
      // Create a design history item from the renovation data
      const historyItem = {
        id: `${renovationData.sessionId}-${Date.now()}`,
        sessionId: renovationData.sessionId,
        createdAt: renovationData.generatedImage?.generatedAt || new Date().toISOString(),
        thumbnail: `http://localhost:3001${renovationData.generatedImage.url}`,
        originalImage: `http://localhost:3001${renovationData.originalImage.url}`,
        generatedImage: `http://localhost:3001${renovationData.generatedImage.url}`,
        status: 'completed' as const,
        title: `${renovationData.styleData.architecturalStyle.charAt(0).toUpperCase() + renovationData.styleData.architecturalStyle.slice(1)} Design`,
        styleData: renovationData.styleData,
        metadata: {
          originalImageData: renovationData.originalImage,
          generatedImageData: renovationData.generatedImage,
          renovationData: renovationData // Store complete renovation data for modal
        }
      };
      
      console.log('💾 [EnhancedStyleApi] Saving design to history:', historyItem);
      await HistoryStorageService.saveDesignToHistory(historyItem);
      console.log('✅ [EnhancedStyleApi] Successfully saved completed renovation to history');
    } catch (error) {
      console.error('❌ [EnhancedStyleApi] Error saving completed renovation:', error);
      // Don't throw - this is not critical to the main flow
    }
  }
}

export const enhancedStyleRenovationApi = new EnhancedStyleRenovationApi();
