import {
  SessionData,
  UploadResult,
  QuestionsResult,
  AnswersResult,
  GenerationResult,
  Answer,
  HealthCheck,
  Entitlements,
  APIResponse,
} from '../types/api';

// API Configuration
const API_CONFIG = {
  // baseURL: __DEV__ ? 'http://localhost:3001' : 'https://upcrib-backend.onrender.com',
  baseURL: 'https://upcrib-backend.onrender.com', // Force production URL
  apiPath: '/api',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
};

export class UpCribAPIClient {
  private baseURL: string;
  private apiPath: string;

  constructor(baseURL: string = API_CONFIG.baseURL) {
    this.baseURL = baseURL;
    this.apiPath = API_CONFIG.apiPath;
  }

  // Expose baseURL for accessing uploaded files
  get apiBaseURL(): string {
    return this.baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const url = `${this.baseURL}${this.apiPath}${endpoint}`;
    const config: RequestInit = {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        ...API_CONFIG.headers,
      },
      ...options,
    };

    try {
      console.log(`API Request: ${options.method || 'GET'} ${url}`);
      
      const response = await fetch(url, config);
      const data = await response.json();
      
      console.log(`API Response: ${response.status}`, data);

      if (!response.ok) {
        throw new Error(data.error?.message || `HTTP ${response.status}`);
      }

      if (!data.success) {
        throw new Error(data.error?.message || 'API request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Health Check
  async healthCheck(): Promise<HealthCheck> {
    const response = await fetch(`${this.baseURL}/health`);
    return response.json();
  }

  // Session Management
  async createSession(userId?: string): Promise<SessionData> {
    const response = await this.request<SessionData>('/session', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
    return response.data!;
  }

  async getSessionState(sessionId: string): Promise<SessionData> {
    const response = await this.request<SessionData>(`/session/${sessionId}/state`);
    return response.data!;
  }

  // Image Upload
  async uploadImage(sessionId: string, imageUri: string): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('sessionId', sessionId);
    
    // For React Native, we need to create a proper file object
    const fileInfo = {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'house-image.jpg',
    };
    
    formData.append('image', fileInfo as any);

    const response = await fetch(`${this.baseURL}${this.apiPath}/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error?.message || 'Upload failed');
    }
    
    return data.data;
  }

  // Image Analysis
  async analyzeImage(sessionId: string): Promise<GenerationResult> {
    const response = await this.request<GenerationResult>('/analyze', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    });
    return response.data!;
  }

  // Questions Management
  async getQuestions(sessionId: string): Promise<QuestionsResult> {
    const response = await this.request<QuestionsResult>(`/questions/${sessionId}`);
    return response.data!;
  }

  async submitAnswers(sessionId: string, answers: Answer[]): Promise<AnswersResult> {
    const response = await this.request<AnswersResult>(`/questions/${sessionId}/answers`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
    return response.data!;
  }

  // Image Generation
  async generateRenovatedImage(sessionId: string): Promise<GenerationResult> {
    const response = await this.request<GenerationResult>('/generate', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    });
    return response.data!;
  }

  // File Download
  async downloadGeneratedImage(filename: string): Promise<{
    blob: Blob;
    url: string;
    filename: string;
  }> {
    const url = `${this.baseURL}/generated/${filename}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to download image');
    }
    
    return {
      blob: await response.blob(),
      url: url,
      filename: filename,
    };
  }

  // Entitlements Management
  async getUserEntitlements(userId: string): Promise<Entitlements> {
    const response = await this.request<Entitlements>(`/entitlements/${userId}`);
    return response.data!;
  }

  async checkEntitlement(
    userId: string,
    entitlementType: string,
    quantity: number = 1
  ): Promise<{
    hasEntitlement: boolean;
    currentUsage: number;
    limit: number;
    remaining: number;
  }> {
    const response = await this.request<{
      hasEntitlement: boolean;
      currentUsage: number;
      limit: number;
      remaining: number;
    }>(`/entitlements/${userId}/check`, {
      method: 'POST',
      body: JSON.stringify({ entitlementType, quantity }),
    });
    return response.data!;
  }

  // Rate Limiting Helper
  async requestWithRetry<T>(
    apiCall: () => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    let retries = 0;
    
    while (retries < maxRetries) {
      try {
        return await apiCall();
      } catch (error: any) {
        if (error.message?.includes('429') && retries < maxRetries - 1) {
          const delay = Math.pow(2, retries) * 1000; // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay));
          retries++;
        } else {
          throw error;
        }
      }
    }
    
    throw new Error('Max retries exceeded');
  }

  /**
   * Start design generation process
   */
  async startGeneration(sessionId: string): Promise<{ jobId: string }> {
    const response = await this.request<{ jobId: string }>('/generate', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    });
    return response.data!;
  }

  /**
   * Get final generated images
   */
  async getGeneratedImages(sessionId: string): Promise<{
    images: Array<{
      id: string;
      url: string;
      style: string;
      description?: string;
    }>;
  }> {
    const response = await this.request<{
      images: Array<{
        id: string;
        url: string;
        style: string;
        description?: string;
      }>;
    }>(`/sessions/${sessionId}/images`);
    return response.data!;
  }

  // Enhanced Style Renovation endpoint to match the working script
    // Create enhanced style renovation with session reference
  async createEnhancedStyleRenovationFromSession(
    sessionId: string,
    architecturalStyle?: string,
    colorPalette?: string
  ): Promise<{
    success: boolean;
    data: {
      sessionId: string;
      jobId: string;
      status: string;
      houseImageUrl?: string;
      referenceImageUrl?: string;
    };
  }> {
    console.log('Creating enhanced style renovation for session:', sessionId);
    console.log('Style parameters:', { architecturalStyle, colorPalette });
    
    // Try to send the session ID and style parameters to enhanced style renovation
    // The backend should be able to use the existing uploaded image from the session
    const formData = new FormData();
    
    // Pass the session ID so backend can find the existing image
    formData.append('sessionId', sessionId);
    
    // Add style parameters
    if (architecturalStyle) {
      formData.append('architecturalStyle', architecturalStyle);
      console.log('Added architecturalStyle:', architecturalStyle);
    }
    if (colorPalette) {
      formData.append('colorPalette', colorPalette);
      console.log('Added colorPalette:', colorPalette);
    }
    
    const url = `${this.baseURL}${this.apiPath}/enhanced-style-renovation`;
    console.log('API Request: POST', url);
    
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    console.log('API Response:', response.status, JSON.stringify(data));
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Enhanced style renovation failed');
    }
    
    return data;
  }

  async createEnhancedStyleRenovation(
    houseImageUri: string,
    referenceImageUri?: string,
    architecturalStyle?: string,
    colorPalette?: string
  ): Promise<{
    success: boolean;
    data: {
      sessionId: string;
      jobId: string;
      status: string;
      houseImageUrl?: string;
      referenceImageUrl?: string;
    };
  }> {
    const formData = new FormData();
    
    // Add house image
    formData.append('houseImage', {
      uri: houseImageUri,
      type: 'image/jpeg',
      name: 'house.jpg',
    } as any);
    
    // Add reference image if provided
    if (referenceImageUri) {
      formData.append('referenceImage', {
        uri: referenceImageUri,
        type: 'image/jpeg',
        name: 'reference.jpg',
      } as any);
    }
    
    // Add style parameters
    if (architecturalStyle) {
      formData.append('architecturalStyle', architecturalStyle);
      console.log('Added architecturalStyle:', architecturalStyle);
    }
    if (colorPalette) {
      formData.append('colorPalette', colorPalette);
      console.log('Added colorPalette:', colorPalette);
    }
    
    const url = `${this.baseURL}${this.apiPath}/enhanced-style-renovation`;
    console.log('API Request: POST', url);
    
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    console.log('API Response:', response.status, JSON.stringify(data));
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Enhanced style renovation failed');
    }
    
    return data;
  }

  // Get enhanced style renovation status
  async getEnhancedStyleRenovationStatus(sessionId: string): Promise<{
    success: boolean;
    data: {
      sessionId: string;
      status: string;
      hasPendingJobs: boolean;
      styleData: {
        architecturalStyle: string;
        colorPalette: string;
        customColors: string[] | null;
        colors: string[];
        referenceImagePath: string | null;
        referenceImageOriginalName: string | null;
      };
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
        extension?: string;
        generatedAt?: string;
        url: string;
      };
    };
  }> {
    const response = await fetch(`${this.baseURL}${this.apiPath}/enhanced-style-renovation/${sessionId}/status`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to get status');
    }
    
    return data;
  }
}

// Export the appropriate client based on environment and availability
const createApiClient = () => {
  // Always use the real API client now that backend is available
  const baseURL = __DEV__ ? 'http://localhost:3001' : 'https://upcrib-backend.onrender.com';
  console.log('Using Real API Client:', baseURL);
  return new UpCribAPIClient(baseURL);
};

export const apiClient = createApiClient();
export default UpCribAPIClient;
