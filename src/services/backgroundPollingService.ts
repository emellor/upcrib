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
  private pollingIntervals: Map<string, any> = new Map();
  private isInitialized = false;
  private inMemorySessions: PollingSession[] = []; // Fallback for when AsyncStorage fails
  private useAsyncStorage = true; // Flag to track if AsyncStorage is working

  /**
   * Initialize the service and restore any pending sessions
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      console.log('🚀 [BackgroundPolling] Initializing service...');
      
      // Test AsyncStorage availability
      try {
        await AsyncStorage.setItem('@init_test', 'initialized');
        await AsyncStorage.removeItem('@init_test');
        console.log('✅ [BackgroundPolling] AsyncStorage is available');
        this.useAsyncStorage = true;
      } catch (storageError) {
        console.warn('⚠️ [BackgroundPolling] AsyncStorage unavailable, using in-memory mode:', storageError);
        this.useAsyncStorage = false;
      }
      
      // Initialize notification service
      await notificationService.initialize();
      
      // Restore any pending sessions
      await this.restorePendingSessions();
      
      this.isInitialized = true;
      console.log('✅ [BackgroundPolling] Service initialized successfully');
    } catch (error) {
      console.error('❌ [BackgroundPolling] Error initializing:', error);
      // Mark as initialized anyway to prevent infinite retry loops
      this.isInitialized = true;
    }
  }

  /**
   * Get all polling sessions with fallback to in-memory storage
   */
  private async getPollingSessions(): Promise<PollingSession[]> {
    if (!this.useAsyncStorage) {
      console.log('📝 [BackgroundPolling] Using in-memory sessions (AsyncStorage disabled)');
      return [...this.inMemorySessions];
    }

    try {
      const data = await AsyncStorage.getItem(POLLING_SESSIONS_KEY);
      const sessions = data ? JSON.parse(data) : [];
      console.log('📝 [BackgroundPolling] Loaded sessions from AsyncStorage:', sessions.length);
      return sessions;
    } catch (error) {
      console.warn('⚠️ [BackgroundPolling] AsyncStorage failed, switching to in-memory mode:', error);
      this.useAsyncStorage = false;
      return [...this.inMemorySessions];
    }
  }

  /**
   * Save polling sessions with fallback to in-memory storage
   */
  private async savePollingSessions(sessions: PollingSession[]): Promise<void> {
    // Always update in-memory backup
    this.inMemorySessions = [...sessions];
    
    if (!this.useAsyncStorage) {
      console.log('📝 [BackgroundPolling] Saved to in-memory storage (AsyncStorage disabled)');
      return;
    }

    try {
      await AsyncStorage.setItem(POLLING_SESSIONS_KEY, JSON.stringify(sessions));
      console.log('📝 [BackgroundPolling] Saved sessions to AsyncStorage:', sessions.length);
    } catch (error) {
      console.warn('⚠️ [BackgroundPolling] AsyncStorage save failed, switching to in-memory mode:', error);
      this.useAsyncStorage = false;
      // Data is already saved to inMemorySessions above
    }
  }

  /**
   * Add a session to poll
   */
  async addSession(sessionId: string): Promise<void> {
    console.log(`➕ [BackgroundPolling] Adding session: ${sessionId}`);
    
    try {
      const sessions = await this.getPollingSessions();
      
      // Check if session already exists
      const existingIndex = sessions.findIndex(s => s.sessionId === sessionId);
      if (existingIndex >= 0) {
        console.log(`⚠️ [BackgroundPolling] Session ${sessionId} already exists, skipping`);
        return; // Already polling this session
      }

      // Add new session
      const newSession: PollingSession = {
        sessionId,
        startedAt: Date.now(),
        notificationShown: false,
      };
      
      sessions.push(newSession);
      
      // Save sessions (will use AsyncStorage or in-memory as fallback)
      await this.savePollingSessions(sessions);
      
      // Start polling
      await this.startPolling(sessionId);
      
      // Show notification that generation has started
      try {
        await notificationService.notifyGenerationStarted(sessionId);
      } catch (notifError) {
        console.warn('⚠️ [BackgroundPolling] Failed to show start notification:', notifError);
      }
      
      console.log(`✅ [BackgroundPolling] Started polling for session: ${sessionId}`);
    } catch (error) {
      console.error('❌ [BackgroundPolling] Error adding session:', error);
      // This should not happen with the new storage system, but add fallback
      await this.startPolling(sessionId);
    }
  }

  /**
   * Remove a session from polling
   */
  async removeSession(sessionId: string): Promise<void> {
    console.log(`➖ [BackgroundPolling] Removing session: ${sessionId}`);
    
    // Stop polling interval first (this is most important)
    const interval = this.pollingIntervals.get(sessionId);
    if (interval) {
      clearInterval(interval);
      this.pollingIntervals.delete(sessionId);
      console.log(`✅ [BackgroundPolling] Stopped polling interval for session: ${sessionId}`);
    }

    // Remove from both storage systems
    try {
      const sessions = await this.getPollingSessions();
      const filtered = sessions.filter(s => s.sessionId !== sessionId);
      await this.savePollingSessions(filtered);
      console.log(`✅ [BackgroundPolling] Removed session ${sessionId} from storage`);
    } catch (error) {
      console.warn(`⚠️ [BackgroundPolling] Failed to remove session ${sessionId} from storage:`, error);
      // Still remove from in-memory storage as fallback
      this.inMemorySessions = this.inMemorySessions.filter(s => s.sessionId !== sessionId);
    }
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
    console.log(`🎉 [BackgroundPolling] Design generation complete for session: ${sessionId}`);
    
    try {
      // Get the full renovation data and save to history
      const response = await apiClient.getEnhancedStyleRenovationStatus(sessionId);
      
      if (response.success && response.data && response.data.status === 'completed') {
        console.log(`💾 [BackgroundPolling] Saving completed renovation to history...`);
        
        // Import and call the Enhanced Style Renovation API to save completed data
        const { enhancedStyleRenovationApi } = require('./enhancedStyleRenovationApi');
        await enhancedStyleRenovationApi.saveCompletedRenovation(response.data);
        
        console.log(`✅ [BackgroundPolling] Successfully saved completed renovation to history`);
      }
    } catch (error) {
      console.error(`❌ [BackgroundPolling] Failed to save completed renovation:`, error);
    }
    
    // Show completion notification
    await notificationService.notifyGenerationComplete(sessionId);
    
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
