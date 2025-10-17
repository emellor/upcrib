import { useState, useEffect, useCallback } from 'react';
import { DesignHistoryItem, HistoryStorageService } from '../services/historyStorage';

export interface UseHistoryReturn {
  history: DesignHistoryItem[];
  loading: boolean;
  error: string | null;
  refreshHistory: () => Promise<void>;
  saveDesign: (design: DesignHistoryItem) => Promise<void>;
  deleteDesign: (sessionId: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  updateDesignTitle: (sessionId: string, title: string) => Promise<void>;
}

export const useHistory = (): UseHistoryReturn => {
  const [history, setHistory] = useState<DesignHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const historyData = await HistoryStorageService.getDesignHistory();
      setHistory(historyData);
    } catch (err) {
      setError('Failed to load design history');
      console.error('Error loading history:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveDesign = useCallback(async (design: DesignHistoryItem) => {
    try {
      setError(null);
      await HistoryStorageService.saveDesignToHistory(design);
      await refreshHistory(); // Refresh to get updated list
    } catch (err) {
      setError('Failed to save design');
      console.error('Error saving design:', err);
      throw err;
    }
  }, [refreshHistory]);

  const deleteDesign = useCallback(async (sessionId: string) => {
    try {
      setError(null);
      await HistoryStorageService.deleteDesignFromHistory(sessionId);
      await refreshHistory(); // Refresh to get updated list
    } catch (err) {
      setError('Failed to delete design');
      console.error('Error deleting design:', err);
      throw err;
    }
  }, [refreshHistory]);

  const clearHistory = useCallback(async () => {
    try {
      setError(null);
      await HistoryStorageService.clearDesignHistory();
      setHistory([]);
    } catch (err) {
      setError('Failed to clear history');
      console.error('Error clearing history:', err);
      throw err;
    }
  }, []);

  const updateDesignTitle = useCallback(async (sessionId: string, title: string) => {
    try {
      setError(null);
      await HistoryStorageService.updateDesignTitle(sessionId, title);
      await refreshHistory(); // Refresh to get updated list
    } catch (err) {
      setError('Failed to update design title');
      console.error('Error updating design title:', err);
      throw err;
    }
  }, [refreshHistory]);

  // Load history on mount
  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  return {
    history,
    loading,
    error,
    refreshHistory,
    saveDesign,
    deleteDesign,
    clearHistory,
    updateDesignTitle,
  };
};
