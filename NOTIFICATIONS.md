# Notification System Setup

## Overview
The app now includes a notification system that alerts users when their AI-generated design is ready, even when the app is closed.

## Features
- **Background Polling**: Automatically checks for design completion every 10 seconds
- **Progress Notifications**: Shows an ongoing notification while design is generating
- **Completion Alerts**: Notifies user when design is ready
- **Failure Alerts**: Notifies user if design generation fails
- **Session Persistence**: Resumes polling after app restart

## Installation

The notification system uses `@notifee/react-native` for local notifications.

### 1. Install Dependencies
```bash
npm install @notifee/react-native
```

### 2. iOS Setup
```bash
cd ios && pod install && cd ..
```

### 3. Android Setup (if needed)
No additional setup required for Android. The notification channel is created automatically.

## Usage

### Automatic Integration
The notification system is automatically initialized when the app starts and works in the background.

When a user:
1. Uploads a photo and starts design generation
2. The ResultScreen detects "generating" status
3. Background polling service is started
4. User receives a notification showing generation is in progress
5. When complete, user gets a notification to view the result

### Manual Testing
To test notifications:
1. Start a design generation
2. Navigate away or close the app
3. Wait for generation to complete (~30-60 seconds)
4. You should receive a notification

**Note on iOS Simulator:**
- ✅ Notifications WILL work on iOS Simulator (iOS 13+)
- ✅ Notification banners will appear at the top
- ✅ Sounds and alerts work
- ⚠️ Background app refresh is limited - app must be in background (not force quit)
- ⚠️ For full background testing, use a physical device

## How It Works

### Services

#### `notificationService.ts`
- Handles all notification display logic
- Manages notification permissions
- Creates notification channels (Android)
- Shows different notifications for different states

#### `backgroundPollingService.ts`
- Polls the API every 10 seconds to check design status
- Persists polling sessions across app restarts
- Automatically cleans up completed/failed sessions
- Coordinates with notification service

### Flow
```
User starts generation
  ↓
ResultScreen detects "generating" status
  ↓
backgroundPollingService.addSession(sessionId)
  ↓
Shows "Generating" notification
  ↓
Polls API every 10 seconds
  ↓
When complete: Shows "Ready" notification
When failed: Shows "Failed" notification
```

## Configuration

### Polling Interval
Edit `POLL_INTERVAL` in `backgroundPollingService.ts`:
```typescript
const POLL_INTERVAL = 10000; // 10 seconds
```

### Max Session Age
Edit `maxAge` in `backgroundPollingService.ts`:
```typescript
const maxAge = 30 * 60 * 1000; // 30 minutes
```

## Permissions

### iOS
- Notifications require user permission
- Permission is requested automatically on first use
- Users can revoke permission in Settings

### Android
- No runtime permission required for notifications
- Users can disable in system settings

## Troubleshooting

### Quick Debug Checklist

If notifications aren't working, follow these steps:

#### 1. **Verify Installation**
```bash
# Check if @notifee/react-native is installed
grep "@notifee/react-native" package.json

# Reinstall iOS dependencies
cd ios && pod install && cd ..

# Rebuild the app (REQUIRED after installing @notifee)
npx react-native run-ios --simulator="iPhone 15"
```

#### 2. **Check Console Logs**
Look for these specific log messages in Metro bundler:
```
✅ Expected logs when working:
🚀 [BackgroundPolling] Initializing service...
📱 [NotificationService] Initializing...
✅ [NotificationService] Notification permission granted
✅ [BackgroundPolling] Service initialized successfully
➕ [BackgroundPolling] Adding session: [sessionId]
📢 [NotificationService] Showing generation started notification
✅ [NotificationService] Generation started notification shown

❌ Error logs to watch for:
❌ [NotificationService] Notification permission denied
❌ [BackgroundPolling] Error initializing
❌ [NotificationService] Error showing generation started notification
```

#### 3. **Test Notification Permissions**
When app first runs, you should see an iOS permission alert:
- "upCrib Would Like to Send You Notifications"
- **Tap "Allow"** (NOT "Don't Allow")

If you accidentally denied:
- Simulator: Device > Erase All Content and Settings
- Then reinstall app

#### 4. **Verify Generation is Detected**
In ResultScreen, when you see "Image is still generating", check console for:
```
Image is still generating, starting background polling
➕ [BackgroundPolling] Adding session: [sessionId]
```

### Notifications Not Showing on Simulator
1. **Ensure app is in background, not force quit**
   - Swipe up to home screen (don't force quit from app switcher)
   - The polling service runs while app is in background
2. **Check notification permissions**
   - When first prompted, tap "Allow"
   - If denied, reset by: Device > Erase All Content and Settings
3. **Check console logs**
   - Look for "Started polling for session: [sessionId]"
   - Look for "Design generation complete"
4. **Verify generation is in progress**
   - Check that status is "generating" in ResultScreen
   - Background polling only starts for generating designs

### Notifications Not Showing on Device
1. Check notification permissions in device Settings > upCrib > Notifications
2. Verify `@notifee/react-native` is installed
3. Run `pod install` for iOS
4. Check console logs for errors

### Background Polling Not Working
1. Check if session is added: Look for "Started polling for session" in logs
2. Verify API is reachable
3. Check AsyncStorage for `@polling_sessions` key

## Testing on iOS Simulator

### Step-by-Step Test
1. **Start the app** on iOS Simulator (iPhone 15 or later)
2. **Upload a photo** and start design generation
3. **Allow notifications** when prompted
4. **Minimize the app** (⌘+Shift+H or swipe up to home)
   - DON'T force quit the app
   - Keep simulator running
5. **Wait 10-15 seconds**
6. **You should see:**
   - Notification banner: "🏠 Generating Your Design"
7. **Wait for generation to complete** (~30-60 seconds)
8. **You should see:**
   - Notification banner: "✨ Your Design is Ready!"
9. **Tap the notification** to open the app

### Expected Console Output
```
Background polling service initialized
Started polling for session: abc123xyz
Image is still generating, starting background polling
Checking session status for abc123xyz...
Design generation complete for session: abc123xyz
```

### Simulator Limitations
- Background execution time is limited (a few minutes)
- For long-running generations (>5 minutes), use a physical device
- Push notifications require a physical device (but local notifications work in simulator)

## Future Improvements
- Add push notifications for truly offline scenarios
- Implement exponential backoff for failed API calls
- Add notification action buttons (e.g., "View Now")
- Support notification deep linking to specific designs
