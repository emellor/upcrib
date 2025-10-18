import notifee, { AndroidImportance, AuthorizationStatus, TriggerType } from '@notifee/react-native';
import { Platform } from 'react-native';

class NotificationService {
  private channelId = 'design-generation';

  /**
   * Request notification permissions
   */
  async requestPermission(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      const settings = await notifee.requestPermission();
      return settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
             settings.authorizationStatus === AuthorizationStatus.PROVISIONAL;
    }
    // Android doesn't require runtime permission for notifications
    return true;
  }

  /**
   * Create notification channel (Android only)
   */
  async createChannel(): Promise<void> {
    if (Platform.OS === 'android') {
      await notifee.createChannel({
        id: this.channelId,
        name: 'Design Generation',
        importance: AndroidImportance.HIGH,
        description: 'Notifications for when your AI design is ready',
        vibration: true,
      });
    }
  }

  /**
   * Initialize notification service
   */
  async initialize(): Promise<void> {
    console.log('[NotificationService] Initializing...');
    await this.createChannel();
    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      console.log('[NotificationService] Notification permission denied');
    } else {
      console.log('[NotificationService] Notification permission granted');
    }
  }

  /**
   * Show notification when design generation starts
   */
  async notifyGenerationStarted(sessionId: string): Promise<string | void> {
    try {
      console.log(`📢 [NotificationService] Showing generation started notification for: ${sessionId}`);
      const notificationId = await notifee.displayNotification({
        id: `generation-${sessionId}`,
        title: 'Generating Your Design',
        body: 'Your AI-powered renovation is in progress. We\'ll notify you when it\'s ready!',
        android: {
          channelId: this.channelId,
          importance: AndroidImportance.HIGH,
          ongoing: true,
          progress: {
            indeterminate: true,
          },
          smallIcon: 'ic_notification',
        },
        ios: {
          sound: 'default',
        },
      });
      
      console.log(`[NotificationService] Generation started notification shown with ID: ${notificationId}`);
      return notificationId;
    } catch (error) {
      console.error('[NotificationService] Error showing generation started notification:', error);
    }
  }

  /**
   * Show notification when design generation is complete
   */
  async notifyGenerationComplete(sessionId: string): Promise<void> {
    try {
      console.log(`[NotificationService] Showing generation complete notification for: ${sessionId}`);
      
      // Cancel the in-progress notification
      await notifee.cancelNotification(`generation-${sessionId}`);

      // Show completion notification
      await notifee.displayNotification({
        id: `complete-${sessionId}`,
        title: 'Your Design is Ready!',
        body: 'Tap to view your AI-generated renovation design.',
        android: {
          channelId: this.channelId,
          importance: AndroidImportance.HIGH,
          pressAction: {
            id: 'default',
            launchActivity: 'default',
          },
          smallIcon: 'ic_notification',
        },
        ios: {
          sound: 'default',
          categoryId: 'design-complete',
        },
        data: {
          sessionId,
          screen: 'Result',
        },
      });
      
      console.log(`[NotificationService] Generation complete notification shown`);
    } catch (error) {
      console.error('[NotificationService] Error showing generation complete notification:', error);
    }
  }

  /**
   * Show notification when design generation fails
   */
  async notifyGenerationFailed(sessionId: string): Promise<void> {
    try {
      // Cancel the in-progress notification
      await notifee.cancelNotification(`generation-${sessionId}`);

      await notifee.displayNotification({
        id: `failed-${sessionId}`,
        title: 'Design Generation Failed',
        body: 'Something went wrong. Please try again.',
        android: {
          channelId: this.channelId,
          importance: AndroidImportance.HIGH,
          smallIcon: 'ic_notification',
        },
        ios: {
          sound: 'default',
        },
      });
    } catch (error) {
      console.error('Error showing generation failed notification:', error);
    }
  }

  /**
   * Cancel all notifications
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await notifee.cancelAllNotifications();
    } catch (error) {
      console.error('Error cancelling notifications:', error);
    }
  }

  /**
   * Cancel notification by ID
   */
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await notifee.cancelNotification(notificationId);
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  }

  /**
   * TEST ONLY - Display a test notification for debugging
   */
  async displayTestNotification(counter: number): Promise<string> {
    console.log(`🧪 [NotificationService] Attempting to display test notification #${counter}`);
    
    try {
      const notificationId = await notifee.displayNotification({
        id: `test-${counter}`,
        title: `🧪 Test Notification #${counter}`,
        body: `Testing notifications at ${new Date().toLocaleTimeString()}`,
        android: {
          channelId: this.channelId,
          importance: AndroidImportance.HIGH,
          smallIcon: 'ic_notification',
        },
        ios: {
          sound: 'default',
        },
      });
      
      console.log(`✅ [NotificationService] Test notification displayed successfully with ID: ${notificationId}`);
      return notificationId;
    } catch (error) {
      console.error(`❌ [NotificationService] Error displaying test notification:`, error);
      throw error;
    }
  }

  /**
   * TEST ONLY - Schedule a test notification for future delivery (works in background)
   */
  async scheduleTestNotification(counter: number, delaySeconds: number): Promise<string> {
    console.log(`🧪 [NotificationService] Scheduling test notification #${counter} for ${delaySeconds} seconds from now`);
    
    try {
      // Create a trigger for the notification
      const trigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: Date.now() + (delaySeconds * 1000),
      };

      const notificationId = await notifee.createTriggerNotification(
        {
          id: `test-scheduled-${counter}`,
          title: `🧪 Scheduled Test #${counter}`,
          body: `This notification was scheduled ${delaySeconds} seconds ago and delivered in the background!`,
          android: {
            channelId: this.channelId,
            importance: AndroidImportance.HIGH,
            smallIcon: 'ic_notification',
          },
          ios: {
            sound: 'default',
          },
        },
        trigger
      );
      
      console.log(`✅ [NotificationService] Test notification scheduled with ID: ${notificationId}`);
      return notificationId;
    } catch (error) {
      console.error(`❌ [NotificationService] Error scheduling test notification:`, error);
      throw error;
    }
  }
}

export default new NotificationService();
