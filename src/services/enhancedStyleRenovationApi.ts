import { API_BASE_URL } from './apiClient';

const ENHANCED_STYLE_API_BASE = 'http://localhost:3001/api/enhanced-style-renovation';

export interface ArchitecturalStyle {
  id: string;
  name: string;
  description: string;
  period: string;
  characteristics: string[];
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
      console.log('Creating enhanced style renovation with:', request);
      
      const formData = new FormData();
      
      // Add house image (required)
      formData.append('houseImage', {
        uri: request.houseImageUri,
        type: 'image/jpeg',
        name: 'house.jpg',
      } as any);
      
      // Add reference image if provided
      if (request.referenceImageUri) {
        formData.append('referenceImage', {
          uri: request.referenceImageUri,
          type: 'image/jpeg',
          name: 'reference.jpg',
        } as any);
      }
      
      // Add style configuration (choose one)
      if (request.architecturalStyle) {
        formData.append('architecturalStyle', request.architecturalStyle);
      } else if (request.customStyleDescription) {
        formData.append('customStyleDescription', request.customStyleDescription);
      }
      
      // Add color configuration (choose one)
      if (request.colorPalette) {
        formData.append('colorPalette', request.colorPalette);
      } else if (request.customColors) {
        formData.append('customColors', JSON.stringify(request.customColors));
      }
      
      console.log('API Request: POST', this.baseUrl);
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      console.log('API Response:', response.status, JSON.stringify(data));
      
      if (!data.success) {
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
      const response = await fetch(`${this.baseUrl}/${sessionId}/status`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to get renovation status');
      }
      
      return data;
    } catch (error) {
      console.error('Error getting renovation status:', error);
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
    const imageUrl = `http://localhost:3001${completedStatus.data.generatedImage.url}`;
    
    return {
      sessionId,
      imageUrl
    };
  }
}

export const enhancedStyleRenovationApi = new EnhancedStyleRenovationApi();
