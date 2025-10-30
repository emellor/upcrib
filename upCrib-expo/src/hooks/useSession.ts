import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '../services/apiClient';
import { SessionData } from '../types/api';

export interface UseSessionReturn {
  session: SessionData | null;
  loading: boolean;
  error: string | null;
  createSession: (userId?: string) => Promise<SessionData>;
  getSessionState: (sessionId: string) => Promise<SessionData>;
  refreshSession: () => Promise<void>;
}

export const useSession = (): UseSessionReturn => {
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSession = useCallback(async (userId?: string) => {
    try {
      setLoading(true);
      setError(null);
      const sessionData = await apiClient.createSession(userId);
      setSession(sessionData);
      return sessionData;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create session';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const getSessionState = useCallback(async (sessionId: string) => {
    try {
      setLoading(true);
      setError(null);
      const state = await apiClient.getSessionState(sessionId);
      setSession(state);
      return state;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to get session state';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshSession = useCallback(async () => {
    if (session?.sessionId) {
      await getSessionState(session.sessionId);
    }
  }, [session?.sessionId, getSessionState]);

  return {
    session,
    loading,
    error,
    createSession,
    getSessionState,
    refreshSession,
  };
};
