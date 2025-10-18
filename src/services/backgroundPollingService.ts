import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from './apiClient';
import notificationService from './notificationService';
import { HistoryStorageService } from './historyStorage';

const POLLING_SESSIONS_KEY = '@polling_sessions';
const POLL_INTERVAL = 10000; // 10 seconds

interface PollingSession {
  sessionId: string;
  startedAt: number;
  notificationShown: boolean;
}

class BackgroundPollingService {
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map();
  private isInitialized = false;

  /**
   * Initialize the service and restore any pending sessions
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      console.log('🚀 [BackgroundPolling] Initializing service...');
      
      // Initialize notification service
      await notificationService.initialize();
      
      // Restore any pending sessions
      await this.restorePendingSessions();
      
      this.isInitialized = true;
      console.log('✅ [BackgroundPolling] Service initialized successfully');
    } catch (error) {
      console.error('❌ [BackgroundPolling] Error initializing:', error);
    }
  }

  /**
   * Get all polling sessions
   */
  private async getPollingSessions(): Promise<PollingSession[]> {
    try {
      const data = await AsyncStorage.getItem(POLLING_SESSIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting polling sessions:', error);
      return [];
    }
  }

  /**
   * Save polling sessions
   */
  private async savePollingSessions(sessions: PollingSession[]): Promise<void> {
    try {
      await AsyncStorage.setItem(POLLING_SESSIONS_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error saving polling sessions:', error);
    }
  }

  /**
   * Add a session to poll
   */
  async addSession(sessionId: string): Promise<void> {
    console.log(`➕ [BackgroundPolling] Adding session: ${sessionId}`);
    
    const sessions = await this.getPollingSessions();
    
    // Check if session already exists
    const existingIndex = sessions.findIndex(s => s.sessionId === sessionId);
    if (existingIndex >= 0) {
      console.log(`⚠️ [BackgroundPolling] Session ${sessionId} already exists, skipping`);
      return; // Already polling this session
    }

    // Add new session
    sessions.push({
      sessionId,
      startedAt: Date.now(),
      notificationShown: false,
    });
    
    await this.savePollingSessions(sessions);
    
    // Start polling
    await this.startPolling(sessionId);
    
    // Show notification that generation has started
    await notificationService.notifyGenerationStarted(sessionId);
    
    console.log(`✅ [BackgroundPolling] Started polling for session: ${sessionId}`);
  }

  /**
   * Remove a session from polling
   */
  async removeSession(sessionId: string): Promise<void> {
    // Stop polling interval
    const interval = this.pollingIntervals.get(sessionId);
    if (interval) {
      clearInterval(interval);
      this.pollingIntervals.delete(sessionId);
    }

    // Remove from storage
    const sessions = await this.getPollingSessions();
    const filtered = sessions.filter(s => s.sessionId !== sessionId);
    await this.savePollingSessions(filtered);
    
    console.log(`Stopped polling for session: ${sessionId}`);
  }

  /**
   * Start polling a specific session
   */
  private async startPolling(sessionId: string): Promise<void> {
    // Don't start if already polling
    if (this.pollingIntervals.has(sessionId)) {
      return;
    }

    const interval = setInterval(async () => {
      await this.checkSessionStatus(sessionId);
    }, POLL_INTERVAL);

    this.pollingIntervals.set(sessionId, interval);
  }

  /**
   * Check the status of a session
   */
  private async checkSessionStatus(sessionId: string): Promise<void> {
    try {
      // Call API to check status
      const response = await apiClient.getEnhancedStyleRenovationStatus(sessionId);
      
      if (response.success && response.data) {
        if (response.data.status === 'completed' && response.data.generatedImage) {
          // Generation complete!
          await this.handleGenerationComplete(sessionId);
        } else if (response.data.status === 'failed') {
          // Generation failed
          await this.handleGenerationFailed(sessionId);
        }
      }
      // If still 'generating', continue polling
    } catch (error) {
      console.error(`Error checking session status for ${sessionId}:`, error);
      // Don't stop polling on error, the API might be temporarily unavailable
    }
  }

  /**
   * Handle successful generation completion
   */
  private async handleGenerationComplete(sessionId: string): Promise<void> {
    console.log(`Design generation complete for session: ${sessionId}`);
    
    // Show completion notification
    await notificationService.notifyGenerationComplete(sessionId);
    
    // History will be updated when user opens the app and refreshes
    
    // Stop polling this session
    await this.removeSession(sessionId);
  }

  /**
   * Handle generation failure
   */
  private async handleGenerationFailed(sessionId: string): Promise<void> {
    console.log(`Design generation failed for session: ${sessionId}`);
    
    // Show failure notification
    await notificationService.notifyGenerationFailed(sessionId);
    
    // History will be updated when user opens the app and refreshes
    
    // Stop polling this session
    await this.removeSession(sessionId);
  }

  /**
   * Restore any sessions that were being polled before app was closed
   */
  private async restorePendingSessions(): Promise<void> {
    const sessions = await this.getPollingSessions();
    
    if (sessions.length === 0) {
      return;
    }

    console.log(`Restoring ${sessions.length} pending session(s)`);
    
    // Start polling for each pending session
    for (const session of sessions) {
      // Check if session is too old (e.g., more than 30 minutes)
      const age = Date.now() - session.startedAt;
      const maxAge = 30 * 60 * 1000; // 30 minutes
      
      if (age > maxAge) {
        console.log(`Session ${session.sessionId} is too old, removing`);
        await this.removeSession(session.sessionId);
        continue;
      }
      
      // Start polling
      await this.startPolling(session.sessionId);
      
      // Check status immediately
      await this.checkSessionStatus(session.sessionId);
    }
  }

  /**
   * Stop all polling
   */
  stopAll(): void {
    this.pollingIntervals.forEach((interval, sessionId) => {
      clearInterval(interval);
      console.log(`Stopped polling for session: ${sessionId}`);
    });
    this.pollingIntervals.clear();
  }
}

export default new BackgroundPollingService();
