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
  baseURL: __DEV__ ? 'http://localhost:3001' : 'https://api.upcrib.com',
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

  // Public getter for baseURL
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
}

// Export the appropriate client based on environment and availability
const createApiClient = () => {
  // Always use the real API client now that backend is available
  console.log('Using Real API Client:', __DEV__ ? 'http://localhost:3001' : 'https://api.upcrib.com');
  return new UpCribAPIClient();
};

export const apiClient = createApiClient();
export default UpCribAPIClient;
