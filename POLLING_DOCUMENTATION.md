# Enhanced Style Renovation - Before & After Image Polling

## Overview

This document explains how the app polls for renovation status and displays both original and generated images in a before/after comparison slider.

## API Endpoint

The app polls the enhanced style renovation status endpoint:

```
GET /api/enhanced-style-renovation/{SESSION_ID}/status
```

### Response Format

The API returns both original and generated image URLs:

```json
{
  "success": true,
  "data": {
    "sessionId": "SESSION_ID",
    "status": "completed", // or "uploading" | "uploaded" | "generating" | "failed"
    "hasPendingJobs": false,
    "originalImage": {
      "path": "/uploads/original-filename.jpg",
      "filename": "original-filename.jpg",
      "mimetype": "image/jpeg",
      "size": 1234567,
      "uploadedAt": "2025-01-01T00:00:00.000Z",
      "url": "/uploads/original-filename.jpg"
    },
    "generatedImage": {
      "path": "/generated/generated-filename.png",
      "filename": "generated-filename.png",
      "url": "/generated/generated-filename.png"
    }
  },
  "meta": {
    "timestamp": "2025-01-01T00:00:00.000Z"
  }
}
```

## Session States

The API returns different combinations of data based on the renovation status:

### 1. **Active Session (No Processing Started)**
- `status: "active"`
- `hasPendingJobs: false`
- `originalImage: null`
- `generatedImage: null`

### 2. **Image Uploaded**
- `status: "uploaded"`
- `hasPendingJobs: false`
- `originalImage: { url: "/uploads/...", ... }`
- `generatedImage: null`

### 3. **Generation In Progress**
- `status: "generating"`
- `hasPendingJobs: true`
- `originalImage: { url: "/uploads/...", ... }`
- `generatedImage: null`

### 4. **Generation Complete**
- `status: "completed"`
- `hasPendingJobs: false`
- `originalImage: { url: "/uploads/...", ... }`
- `generatedImage: { url: "/generated/...", ... }`

### 5. **Generation Failed**
- `status: "failed"`
- `hasPendingJobs: false`
- `originalImage: { url: "/uploads/...", ... }` (may be present)
- `generatedImage: null`

## How It Works

### 1. Polling Process

1. **Result Screen Detection**: When the ResultScreen loads and detects `sessionData.hasPendingJobs === true`, it starts polling
2. **Polling Interval**: Polls every 3 seconds using `apiClient.getEnhancedStyleRenovationStatus(sessionId)`
3. **Status Updates**: Updates both `enhancedStyleRenovationStatus` and `sessionData` state with new image URLs
4. **Stop Condition**: Stops polling when `hasPendingJobs === false`

### 2. Image URL Resolution

The app uses a priority system to find the best image URLs:

#### Original Image URL (`getOriginalImageUrl()`)
1. **Enhanced Status (Best)**: `enhancedStyleRenovationStatus.originalImage.url`
2. **Session Data**: `sessionData.imageUrl`
3. **Route Parameter**: `originalImageUrl` from navigation

#### Generated Image URL (`getImageUrl()`)
1. **Enhanced Status (Best)**: `enhancedStyleRenovationStatus.generatedImage.url`
2. **Session Data**: `sessionData.generatedImage.url`
3. **Route Parameter**: `propImageUrl` from navigation

### 3. Before/After Slider

The interactive slider allows users to compare the original and generated images:

- **Background Layer**: Shows the generated (after) image
- **Overlay Layer**: Shows the original (before) image, masked by slider position
- **Slider Handle**: Draggable handle that controls the mask width
- **Animation**: Smooth transitions using `Animated.Value`

### 4. Error Handling

- **Image Load Errors**: Shows placeholder with error message
- **Missing Images**: Gracefully degrades to single image view
- **API Errors**: Continues polling with exponential backoff

## Code Structure

### Key Files

- `src/screens/ResultScreen.tsx` - Main result display with before/after slider
- `src/services/enhancedStyleRenovationApi.ts` - API interface definitions
- `src/services/apiClient.ts` - HTTP client methods
- `src/services/backgroundPollingService.ts` - Background polling for notifications

### Key Components

```typescript
// Polling logic in ResultScreen
useEffect(() => {
  let pollInterval: any = null;
  
  if (sessionData?.hasPendingJobs) {
    pollInterval = setInterval(async () => {
      const data = await apiClient.getEnhancedStyleRenovationStatus(sessionId);
      setEnhancedStyleRenovationStatus(data.data);
      // Update session data with new image URLs...
    }, 3000);
  }
  
  return () => {
    if (pollInterval) clearInterval(pollInterval);
  };
}, [sessionData?.hasPendingJobs]);
```

## Testing

### Quick Status Check

Use the included test script to verify the API endpoint:

```bash
node test_api_polling.js [SESSION_ID]
```

### Complete Workflow Test

For a full end-to-end test including image creation and retrieval:

```bash
# 1. Create renovation and get session ID
SESSION_ID=$(curl -s -X POST \
  -F "houseImage=@test-data/house.jpg" \
  -F "architecturalStyle=victorian" \
  -F "colorPalette=heritage-red" \
  http://localhost:3001/api/enhanced-style-renovation | jq -r '.data.sessionId')

echo "Created session: $SESSION_ID"

# 2. Poll for completion
echo "Polling for completion..."
while true; do
  STATUS=$(curl -s http://localhost:3001/api/enhanced-style-renovation/$SESSION_ID/status | jq -r '.data.status')
  echo "Status: $STATUS"
  
  if [ "$STATUS" = "completed" ]; then
    echo "✅ Generation completed!"
    break
  elif [ "$STATUS" = "failed" ]; then
    echo "❌ Generation failed!"
    exit 1
  fi
  
  sleep 3
done

# 3. Get final status with image URLs
echo "Getting image URLs..."
curl -s http://localhost:3001/api/enhanced-style-renovation/$SESSION_ID/status | jq '.data'

# 4. Extract and download images
ORIGINAL_URL=$(curl -s http://localhost:3001/api/enhanced-style-renovation/$SESSION_ID/status | jq -r '.data.originalImage.url')
GENERATED_URL=$(curl -s http://localhost:3001/api/enhanced-style-renovation/$SESSION_ID/status | jq -r '.data.generatedImage.url')

echo "Original image URL: $ORIGINAL_URL"
echo "Generated image URL: $GENERATED_URL"

# 5. Download the images
curl -o original.jpg "http://localhost:3001$ORIGINAL_URL"
curl -o generated.png "http://localhost:3001$GENERATED_URL"

echo "✅ Images downloaded: original.jpg and generated.png"
```

### Example Test Results

**Active Session (No Images Yet):**
```bash
node test_api_polling.js 1fea267e-3f7d-4a9e-8f3a-20019dc612fb
```

Response:
```json
{
  "success": true,
  "data": {
    "sessionId": "1fea267e-3f7d-4a9e-8f3a-20019dc612fb",
    "status": "active",
    "hasPendingJobs": false,
    "originalImage": null,
    "generatedImage": null
  }
}
```

**Completed Session (With Images):**
When renovation is complete, the response will include:
```json
{
  "success": true,
  "data": {
    "status": "completed",
    "originalImage": {
      "url": "/uploads/filename.jpg",
      "filename": "original.jpg"
    },
    "generatedImage": {
      "url": "/generated/filename.png", 
      "filename": "generated.png"
    }
  }
}
```

### Test Coverage

The testing suite includes:

**Quick Status Check (`test_api_polling.js`)**:
- API connectivity
- Response format validation
- Image URL availability
- Error handling for missing sessions

**Complete Workflow Test (`test_complete_workflow.sh`)**:
- End-to-end renovation creation
- Polling until completion
- Image URL extraction
- Image download verification
- Full integration testing

**Requirements for Complete Test**:
- Place a test image at `test-data/house.jpg`
- Ensure backend server is running on `localhost:3001`
- Have `jq` installed for JSON parsing

```bash
# Run complete workflow test
./test_complete_workflow.sh
```

This will create a renovation, poll until complete, and download both images for verification.

## Debugging

The app logs detailed information about image URL resolution:

```javascript
console.log('🔄 Polling Enhanced Style Renovation Status:', {
  sessionId,
  status: data.data?.status,
  hasPendingJobs: data.data?.hasPendingJobs,
  hasOriginalImage: !!data.data?.originalImage?.url,
  hasGeneratedImage: !!data.data?.generatedImage?.url,
  originalImageUrl: data.data?.originalImage?.url,
  generatedImageUrl: data.data?.generatedImage?.url
});
```

Check the console for these logs to debug polling issues.