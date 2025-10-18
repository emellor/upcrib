# Notification Troubleshooting Guide

## The Issue
Notifications not appearing on iPhone Simulator

## Most Common Cause
**App was not rebuilt after installing `@notifee/react-native`**

## Solution Steps

### Step 1: Rebuild the App
```bash
# Kill current Metro bundler (Ctrl+C)
# Then rebuild:
npx react-native run-ios --simulator="iPhone 15"
```

### Step 2: Allow Permissions
When the app launches, you'll see:
```
"upCrib" Would Like to Send You Notifications
[Don't Allow]  [Allow]
```
**Tap "Allow"**

### Step 3: Test Notifications
1. Upload a photo
2. Start design generation
3. Minimize app (⌘+Shift+H)
4. Watch for notification banner at top

### Step 4: Check Console Logs
Look for these in Metro bundler console:

**✅ SUCCESS - You should see:**
```
🚀 [App] Starting upCrib app...
🚀 [BackgroundPolling] Initializing service...
📱 [NotificationService] Initializing...
✅ [NotificationService] Notification permission granted
✅ [BackgroundPolling] Service initialized successfully
```

**When you start generation:**
```
Image is still generating, starting background polling
➕ [BackgroundPolling] Adding session: abc123
📢 [NotificationService] Showing generation started notification
✅ [NotificationService] Generation started notification shown with ID: generation-abc123
```

**❌ ERROR - If you see:**
```
❌ [NotificationService] Notification permission denied
```
Solution: Reset simulator and allow permissions

**❌ ERROR - If you see:**
```
Cannot find module '@notifee/react-native'
```
Solution: Rebuild the app (see Step 1)

## Quick Reset

If nothing works, do a complete reset:

```bash
# 1. Clean build
cd ios
rm -rf build
rm -rf Pods
rm Podfile.lock
pod install
cd ..

# 2. Reset Metro cache
npx react-native start --reset-cache

# 3. In another terminal, rebuild
npx react-native run-ios --simulator="iPhone 15"

# 4. In simulator: Device > Erase All Content and Settings

# 5. Reinstall app (will prompt for notification permission again)
```

## What to Expect

### Timeline:
1. **0 seconds**: App opens, notification permission prompt
2. **10 seconds**: First polling check
3. **20-30 seconds**: "🏠 Generating Your Design" notification appears
4. **30-60 seconds**: Generation completes
5. **Immediately**: "✨ Your Design is Ready!" notification appears

### Notification Appearance:
- **Banner slides down from top** of screen
- **Sound plays** (default notification sound)
- **Stays for 3-5 seconds** then goes to Notification Center
- **Tap to open app** and view result

## Still Not Working?

Check these:

1. **Is @notifee installed?**
   ```bash
   cat package.json | grep notifee
   # Should show: "@notifee/react-native": "^9.1.8"
   ```

2. **Are iOS pods installed?**
   ```bash
   ls ios/Pods | grep RNNotifee
   # Should show: RNNotifee folder
   ```

3. **Is app running latest build?**
   - Look at build time in Xcode logs
   - Should be very recent (within last few minutes)

4. **Is Metro bundler showing your changes?**
   - Save a file
   - App should reload
   - Check timestamp in console

## Need More Help?

Run this diagnostic command and share output:
```bash
echo "=== Diagnostic Info ==="
echo "Package installed:"
grep "@notifee/react-native" package.json
echo ""
echo "Pods installed:"
ls ios/Pods | grep RNNotifee
echo ""
echo "Last iOS build:"
ls -lt ios/build/Build/Products/Debug-iphonesimulator/*.app | head -1
```
