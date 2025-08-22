#!/bin/bash

# Audio/Video Streaming Test Script using curl
# Tests the ULV Protocol streaming implementation

BASE_URL="http://localhost:3000"
TERMINAL_ID="628076842334"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🎥 Audio/Video Streaming Test (ULV Protocol)${NC}"
echo "============================================================"

# Test 1: Start Streaming
echo -e "\n${YELLOW}1️⃣ Starting Audio/Video Streaming...${NC}"
START_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/streaming/start" \
  -H "Content-Type: application/json" \
  -d "{
    \"terminalId\": \"${TERMINAL_ID}\",
    \"channelNumber\": 1,
    \"streamType\": 0,
    \"quality\": 1,
    \"frameRate\": 25,
    \"bitrate\": 0,
    \"audioEnabled\": true,
    \"videoEnabled\": true
  }")

echo "Response: $START_RESPONSE"

# Extract session ID from response
SESSION_ID=$(echo "$START_RESPONSE" | grep -o '"sessionId":"[^"]*"' | cut -d'"' -f4)

if [ -n "$SESSION_ID" ]; then
    echo -e "${GREEN}✅ Streaming started successfully!${NC}"
    echo -e "   Session ID: ${GREEN}${SESSION_ID}${NC}"
    
    # Test 2: Get Streaming Status
    echo -e "\n${YELLOW}2️⃣ Getting Streaming Status...${NC}"
    sleep 2
    
    STATUS_RESPONSE=$(curl -s -X GET "${BASE_URL}/api/streaming/status/${TERMINAL_ID}?sessionId=${SESSION_ID}")
    echo "Status Response: $STATUS_RESPONSE"
    
    # Test 3: Get Streaming Statistics
    echo -e "\n${YELLOW}3️⃣ Getting Streaming Statistics...${NC}"
    STATS_RESPONSE=$(curl -s -X GET "${BASE_URL}/api/streaming/stats/${TERMINAL_ID}/${SESSION_ID}")
    echo "Stats Response: $STATS_RESPONSE"
    
    # Test 4: List All Streaming Sessions
    echo -e "\n${YELLOW}4️⃣ Listing All Streaming Sessions...${NC}"
    SESSIONS_RESPONSE=$(curl -s -X GET "${BASE_URL}/api/streaming/sessions")
    echo "Sessions Response: $SESSIONS_RESPONSE"
    
    # Test 5: Stop Streaming
    echo -e "\n${YELLOW}5️⃣ Stopping Streaming...${NC}"
    sleep 3
    
    STOP_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/streaming/stop" \
      -H "Content-Type: application/json" \
      -d "{
        \"terminalId\": \"${TERMINAL_ID}\",
        \"sessionId\": \"${SESSION_ID}\"
      }")
    
    echo "Stop Response: $STOP_RESPONSE"
    
    # Test 6: Final Status Check
    echo -e "\n${YELLOW}6️⃣ Final Status Check...${NC}"
    FINAL_STATUS_RESPONSE=$(curl -s -X GET "${BASE_URL}/api/streaming/status/${TERMINAL_ID}?sessionId=${SESSION_ID}")
    echo "Final Status Response: $FINAL_STATUS_RESPONSE"
    
else
    echo -e "${RED}❌ Failed to start streaming${NC}"
    echo "Response: $START_RESPONSE"
fi

echo -e "\n${CYAN}🎬 Streaming Test Completed!${NC}"
echo "============================================================"

# Test different streaming configurations
echo -e "\n${BLUE}🔧 Testing Different Streaming Configurations${NC}"
echo "============================================================"

# High Quality Video + Audio
echo -e "\n${YELLOW}🎥 Testing: High Quality Video + Audio${NC}"
HIGH_QUALITY_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/streaming/start" \
  -H "Content-Type: application/json" \
  -d "{
    \"terminalId\": \"${TERMINAL_ID}\",
    \"channelNumber\": 1,
    \"quality\": 1,
    \"frameRate\": 30,
    \"audioEnabled\": true,
    \"videoEnabled\": true
  }")

HIGH_QUALITY_SESSION=$(echo "$HIGH_QUALITY_RESPONSE" | grep -o '"sessionId":"[^"]*"' | cut -d'"' -f4)

if [ -n "$HIGH_QUALITY_SESSION" ]; then
    echo -e "${GREEN}✅ Started: High Quality Video + Audio${NC}"
    echo -e "   Session: ${GREEN}${HIGH_QUALITY_SESSION}${NC}"
    
    sleep 2
    
    # Stop it
    curl -s -X POST "${BASE_URL}/api/streaming/stop" \
      -H "Content-Type: application/json" \
      -d "{
        \"terminalId\": \"${TERMINAL_ID}\",
        \"sessionId\": \"${HIGH_QUALITY_SESSION}\"
      }"
    
    echo -e "${GREEN}🛑 Stopped: High Quality Video + Audio${NC}"
else
    echo -e "${RED}❌ Failed: High Quality Video + Audio${NC}"
fi

# Medium Quality Video Only
echo -e "\n${YELLOW}🎥 Testing: Medium Quality Video Only${NC}"
MEDIUM_QUALITY_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/streaming/start" \
  -H "Content-Type: application/json" \
  -d "{
    \"terminalId\": \"${TERMINAL_ID}\",
    \"channelNumber\": 1,
    \"quality\": 2,
    \"frameRate\": 25,
    \"audioEnabled\": false,
    \"videoEnabled\": true
  }")

MEDIUM_QUALITY_SESSION=$(echo "$MEDIUM_QUALITY_RESPONSE" | grep -o '"sessionId":"[^"]*"' | cut -d'"' -f4)

if [ -n "$MEDIUM_QUALITY_SESSION" ]; then
    echo -e "${GREEN}✅ Started: Medium Quality Video Only${NC}"
    echo -e "   Session: ${GREEN}${MEDIUM_QUALITY_SESSION}${NC}"
    
    sleep 2
    
    # Stop it
    curl -s -X POST "${BASE_URL}/api/streaming/stop" \
      -H "Content-Type: application/json" \
      -d "{
        \"terminalId\": \"${TERMINAL_ID}\",
        \"sessionId\": \"${MEDIUM_QUALITY_SESSION}\"
      }"
    
    echo -e "${GREEN}🛑 Stopped: Medium Quality Video Only${NC}"
else
    echo -e "${RED}❌ Failed: Medium Quality Video Only${NC}"
fi

echo -e "\n${CYAN}✨ All streaming tests completed!${NC}"
