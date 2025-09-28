import { useState, useCallback } from 'react';
import { apiClient } from '../services/apiClient';
import { UploadResult } from '../types/api';

export interface UseImageUploadReturn {
  uploading: boolean;
  uploadProgress: number;
  error: string | null;
  uploadResult: UploadResult | null;
  uploadImage: (sessionId: string, imageUri: string) => Promise<UploadResult>;
  triggerAnalysis: (sessionId: string) => Promise<void>;
  reset: () => void;
}

export const useImageUpload = (): UseImageUploadReturn => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);

  const uploadImage = useCallback(async (sessionId: string, imageUri: string) => {
    try {
      setUploading(true);
      setError(null);
      setUploadProgress(0);

      // Simulate progress (in a real app, you might get actual progress from upload)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const result = await apiClient.uploadImage(sessionId, imageUri);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadResult(result);
      
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to upload image';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setUploading(false);
      // Reset progress after a delay
      setTimeout(() => setUploadProgress(0), 2000);
    }
  }, []);

  const triggerAnalysis = useCallback(async (sessionId: string) => {
    try {
      setError(null);
      await apiClient.analyzeImage(sessionId);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to trigger analysis';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const reset = useCallback(() => {
    setUploading(false);
    setUploadProgress(0);
    setError(null);
    setUploadResult(null);
  }, []);

  return {
    uploading,
    uploadProgress,
    error,
    uploadResult,
    uploadImage,
    triggerAnalysis,
    reset,
  };
};
