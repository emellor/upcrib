import { useState, useCallback, useEffect, useRef } from 'react';
import { apiClient } from '../services/apiClient';
import { Question, Answer, QuestionsResult, AnswersResult } from '../types/api';

export interface UseQuestionsReturn {
  questions: Question[];
  loading: boolean;
  error: string | null;
  answers: Record<string, string>;
  allAnswered: boolean;
  getQuestions: (sessionId: string) => Promise<QuestionsResult>;
  setAnswer: (questionId: string, value: string) => void;
  submitAnswers: (sessionId: string) => Promise<AnswersResult>;
  reset: () => void;
}

export const useQuestions = (): UseQuestionsReturn => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const getQuestions = useCallback(async (sessionId: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiClient.getQuestions(sessionId);
      setQuestions(result.questions);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to get questions';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const setAnswer = useCallback((questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
  }, []);

  const submitAnswers = useCallback(async (sessionId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const formattedAnswers: Answer[] = Object.entries(answers).map(([questionId, value]) => ({
        questionId,
        value,
      }));

      const result = await apiClient.submitAnswers(sessionId, formattedAnswers);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to submit answers';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [answers]);

  const reset = useCallback(() => {
    setQuestions([]);
    setAnswers({});
    setError(null);
    setLoading(false);
  }, []);

  const allAnswered = questions.length > 0 && Object.keys(answers).length === questions.length;

  return {
    questions,
    loading,
    error,
    answers,
    allAnswered,
    getQuestions,
    setAnswer,
    submitAnswers,
    reset,
  };
};

// Hook for polling session status
export interface UsePollingReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  startPolling: () => void;
  stopPolling: () => void;
  poll: () => Promise<void>;
}

export const usePolling = <T>(
  pollFunction: () => Promise<T>,
  interval: number = 5000,
  shouldStop: (data: T) => boolean = () => false
): UsePollingReturn<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const timeoutRef = useRef<any>(null);

  const poll = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const result = await pollFunction();
      setData(result);
      
      if (shouldStop(result)) {
        setIsPolling(false);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Polling failed';
      setError(errorMessage);
      setIsPolling(false);
    } finally {
      setLoading(false);
    }
  }, [pollFunction, shouldStop]);

  const startPolling = useCallback(() => {
    if (!isPolling) {
      setIsPolling(true);
    }
  }, [isPolling]);

  const stopPolling = useCallback(() => {
    setIsPolling(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isPolling) {
      const runPolling = async () => {
        await poll();
        if (isPolling) {
          timeoutRef.current = setTimeout(runPolling, interval);
        }
      };
      
      runPolling();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isPolling, interval, poll]);

  return {
    data,
    loading,
    error,
    startPolling,
    stopPolling,
    poll,
  };
};
