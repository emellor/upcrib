#!/bin/bash

# Enhanced Style Renovation API - Complete Workflow Test
# This script tests the full renovation workflow including polling and image retrieval

set -e  # Exit on any error

API_BASE="http://localhost:3001"
TEST_IMAGE="test-data/house.jpg"

echo "🧪 Enhanced Style Renovation - Complete Workflow Test"
echo "═══════════════════════════════════════════════════════"

# Check if test image exists
if [ ! -f "$TEST_IMAGE" ]; then
    echo "❌ Test image not found: $TEST_IMAGE"
    echo "💡 Please provide a test image or update the TEST_IMAGE path"
    exit 1
fi

echo "📸 Using test image: $TEST_IMAGE"
echo "🌐 API Base URL: $API_BASE"
echo ""

# 1. Create renovation and get session ID
echo "🚀 Step 1: Creating renovation request..."
RESPONSE=$(curl -s -X POST \
  -F "houseImage=@$TEST_IMAGE" \
  -F "architecturalStyle=victorian" \
  -F "colorPalette=heritage-red" \
  $API_BASE/api/enhanced-style-renovation)

echo "📋 Creation Response:"
echo "$RESPONSE" | jq '.'

SESSION_ID=$(echo "$RESPONSE" | jq -r '.data.sessionId')

if [ "$SESSION_ID" = "null" ] || [ -z "$SESSION_ID" ]; then
    echo "❌ Failed to create renovation or get session ID"
    exit 1
fi

echo "✅ Created session: $SESSION_ID"
echo ""

# 2. Poll for completion
echo "⏳ Step 2: Polling for completion..."
POLL_COUNT=0
MAX_POLLS=60  # 3 minutes at 3-second intervals

while [ $POLL_COUNT -lt $MAX_POLLS ]; do
    POLL_COUNT=$((POLL_COUNT + 1))
    
    STATUS_RESPONSE=$(curl -s $API_BASE/api/enhanced-style-renovation/$SESSION_ID/status)
    STATUS=$(echo "$STATUS_RESPONSE" | jq -r '.data.status')
    HAS_PENDING=$(echo "$STATUS_RESPONSE" | jq -r '.data.hasPendingJobs')
    
    echo "[$POLL_COUNT/$MAX_POLLS] Status: $STATUS, Pending Jobs: $HAS_PENDING"
    
    if [ "$STATUS" = "completed" ]; then
        echo "🎉 Generation completed!"
        break
    elif [ "$STATUS" = "failed" ]; then
        echo "❌ Generation failed!"
        echo "$STATUS_RESPONSE" | jq '.data'
        exit 1
    fi
    
    sleep 3
done

if [ $POLL_COUNT -eq $MAX_POLLS ]; then
    echo "⏰ Polling timeout reached. Current status: $STATUS"
    exit 1
fi

echo ""

# 3. Get final status with image URLs
echo "📊 Step 3: Getting final status and image URLs..."
FINAL_STATUS=$(curl -s $API_BASE/api/enhanced-style-renovation/$SESSION_ID/status)

echo "📋 Final Status Response:"
echo "$FINAL_STATUS" | jq '.data'
echo ""

# 4. Extract image URLs
ORIGINAL_URL=$(echo "$FINAL_STATUS" | jq -r '.data.originalImage.url')
GENERATED_URL=$(echo "$FINAL_STATUS" | jq -r '.data.generatedImage.url')

echo "🔗 Image URLs:"
echo "📸 Original: $ORIGINAL_URL"
echo "🎨 Generated: $GENERATED_URL"
echo ""

# Validate URLs
if [ "$ORIGINAL_URL" = "null" ] || [ -z "$ORIGINAL_URL" ]; then
    echo "❌ Original image URL not available"
    exit 1
fi

if [ "$GENERATED_URL" = "null" ] || [ -z "$GENERATED_URL" ]; then
    echo "❌ Generated image URL not available"
    exit 1
fi

# 5. Download the images
echo "⬇️  Step 4: Downloading images..."

echo "📥 Downloading original image..."
curl -s -o "original_${SESSION_ID}.jpg" "$API_BASE$ORIGINAL_URL"
if [ $? -eq 0 ]; then
    echo "✅ Original image saved: original_${SESSION_ID}.jpg"
else
    echo "❌ Failed to download original image"
fi

echo "📥 Downloading generated image..."
curl -s -o "generated_${SESSION_ID}.png" "$API_BASE$GENERATED_URL"
if [ $? -eq 0 ]; then
    echo "✅ Generated image saved: generated_${SESSION_ID}.png"
else
    echo "❌ Failed to download generated image"
fi

echo ""
echo "🎉 Test completed successfully!"
echo "📁 Files created:"
echo "   - original_${SESSION_ID}.jpg"
echo "   - generated_${SESSION_ID}.png"
echo "🆔 Session ID: $SESSION_ID"
echo ""
echo "💡 You can now test the mobile app with this session ID to see the before/after slider!"