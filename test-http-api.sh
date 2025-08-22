#!/bin/bash

# JT808 HTTP API Test Script
# This script demonstrates platform control of JT808 terminals using curl commands

echo "🚀 JT808 HTTP API Test Script"
echo "=============================="
echo ""

# Base URL for the HTTP API
BASE_URL="http://localhost:3000"

echo "1️⃣  Testing Health Check..."
curl -s "$BASE_URL/health" | jq '.'
echo ""

echo "2️⃣  Checking Server Status..."
curl -s "$BASE_URL/status" | jq '.'
echo ""

echo "3️⃣  Getting Connected Terminals..."
curl -s "$BASE_URL/api/terminals" | jq '.'
echo ""

echo "4️⃣  Testing Media Upload Triggers..."
echo "   📸 Triggering image capture..."
curl -s -X POST "$BASE_URL/api/multimedia/trigger" \
  -H "Content-Type: application/json" \
  -d '{
    "terminalId": "628076842334",
    "action": "capture_image",
    "channelId": 1,
    "multimediaDataId": 12345
  }' | jq '.'
echo ""

echo "   🎥 Requesting video upload..."
curl -s -X POST "$BASE_URL/api/multimedia/request" \
  -H "Content-Type: application/json" \
  -d '{
    "terminalId": "628076842334",
    "type": "video",
    "format": "mp4",
    "event": "platform_instruction"
  }' | jq '.'
echo ""

echo "   🔄 Sending platform response..."
curl -s -X POST "$BASE_URL/api/multimedia/response" \
  -H "Content-Type: application/json" \
  -d '{
    "terminalId": "628076842334",
    "multimediaDataId": 12345,
    "action": "retransmit",
    "packetIds": [1, 3, 5]
  }' | jq '.'
echo ""

echo "5️⃣  Getting Recent Media Uploads..."
curl -s "$BASE_URL/api/multimedia/uploads?limit=10" | jq '.'
echo ""

echo "6️⃣  Getting Terminal-Specific Media..."
curl -s "$BASE_URL/api/multimedia/terminal/628076842334" | jq '.'
echo ""

echo "7️⃣  Testing Error Handling..."
echo "   ❌ Invalid terminal ID..."
curl -s -X POST "$BASE_URL/api/multimedia/trigger" \
  -H "Content-Type: application/json" \
  -d '{
    "terminalId": "INVALID_TERMINAL",
    "action": "capture_image"
  }' | jq '.'
echo ""

echo "   ❌ Missing required fields..."
curl -s -X POST "$BASE_URL/api/multimedia/trigger" \
  -H "Content-Type: application/json" \
  -d '{
    "terminalId": "628076842334"
  }' | jq '.'
echo ""

echo "8️⃣  Testing Different Media Types..."
echo "   🖼️  Image capture..."
curl -s -X POST "$BASE_URL/api/multimedia/request" \
  -H "Content-Type: application/json" \
  -d '{
    "terminalId": "628076842334",
    "type": "image",
    "format": "jpeg",
    "event": "platform_instruction"
  }' | jq '.'
echo ""

echo "   🎵 Audio capture..."
curl -s -X POST "$BASE_URL/api/multimedia/request" \
  -H "Content-Type: application/json" \
  -d '{
    "terminalId": "628076842334",
    "type": "audio",
    "format": "mp3",
    "event": "platform_instruction"
  }' | jq '.'
echo ""

echo "✅ Test Script Completed!"
echo ""
echo "📋 Available Endpoints:"
echo "   GET  /health                           - Health check"
echo "   GET  /status                           - Server status"
echo "   GET  /api/terminals                    - List all terminals"
echo "   GET  /api/terminals/:id                - Get terminal info"
echo "   POST /api/multimedia/trigger           - Trigger media capture"
echo "   POST /api/multimedia/request           - Request specific media"
echo "   POST /api/multimedia/response          - Send platform response"
echo "   GET  /api/multimedia/uploads           - Get recent uploads"
echo "   GET  /api/multimedia/terminal/:id      - Get terminal media"
echo ""
echo "🔧 Usage Examples:"
echo "   # Trigger image capture"
echo "   curl -X POST $BASE_URL/api/multimedia/trigger \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"terminalId\": \"628076842334\", \"action\": \"capture_image\"}'"
echo ""
echo "   # Request video upload"
echo "   curl -X POST $BASE_URL/api/multimedia/request \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"terminalId\": \"628076842334\", \"type\": \"video\"}'"
