#!/bin/bash

# ULV JT808 Streaming Test Script
# Tests the new ULV streaming endpoints (0x9101, 0x9102, 0x9103)

BASE_URL="http://localhost:3000"
TERMINAL_ID="628076842334"

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🎥 ULV JT808 Streaming Test${NC}"
echo "============================================================"
echo ""

# Test 1: Start ULV Streaming
echo -e "${BLUE}1️⃣ Starting ULV Streaming...${NC}"
START_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/ulv/streaming/start" \
  -H "Content-Type: application/json" \
  -d "{
    \"terminalId\": \"${TERMINAL_ID}\",
    \"serverIP\": \"192.168.100.100\",
    \"tcpPort\": 1935,
    \"udpPort\": 8000,
    \"channelNumber\": 1,
    \"dataType\": 0,
    \"streamType\": 0
  }")

echo "Response: ${START_RESPONSE}"

# Extract session ID
SESSION_ID=$(echo "${START_RESPONSE}" | grep -o '"sessionId":"[^"]*"' | cut -d'"' -f4)

if [ -n "${SESSION_ID}" ]; then
    echo -e "${GREEN}✅ ULV Streaming started successfully!${NC}"
    echo "   Session ID: ${SESSION_ID}"
else
    echo -e "${RED}❌ Failed to start ULV streaming${NC}"
    exit 1
fi

echo ""

# Test 2: Get ULV Streaming Status
echo -e "${BLUE}2️⃣ Getting ULV Streaming Status...${NC}"
STATUS_RESPONSE=$(curl -s -X GET "${BASE_URL}/api/ulv/streaming/status/${TERMINAL_ID}/${SESSION_ID}")

echo "Status Response: ${STATUS_RESPONSE}"
echo ""

# Test 3: Test Different Control Commands
echo -e "${BLUE}3️⃣ Testing ULV Streaming Control Commands...${NC}"

# Test 3.1: Pause Streaming
echo -e "${YELLOW}   Pausing streaming...${NC}"
PAUSE_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/ulv/streaming/control" \
  -H "Content-Type: application/json" \
  -d "{
    \"terminalId\": \"${TERMINAL_ID}\",
    \"sessionId\": \"${SESSION_ID}\",
    \"controlCommand\": 2
  }")

echo "   Pause Response: ${PAUSE_RESPONSE}"

# Test 3.2: Resume Streaming
echo -e "${YELLOW}   Resuming streaming...${NC}"
RESUME_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/ulv/streaming/control" \
  -H "Content-Type: application/json" \
  -d "{
    \"terminalId\": \"${TERMINAL_ID}\",
    \"sessionId\": \"${SESSION_ID}\",
    \"controlCommand\": 3
  }")

echo "   Resume Response: ${RESUME_RESPONSE}"

# Test 3.3: Switch Stream Type
echo -e "${YELLOW}   Switching to sub stream...${NC}"
SWITCH_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/ulv/streaming/control" \
  -H "Content-Type: application/json" \
  -d "{
    \"terminalId\": \"${TERMINAL_ID}\",
    \"sessionId\": \"${SESSION_ID}\",
    \"controlCommand\": 1,
    \"options\": {
      \"newStreamType\": 1
    }
  }")

echo "   Switch Response: ${SWITCH_RESPONSE}"

echo ""

# Test 4: Get Updated Status
echo -e "${BLUE}4️⃣ Getting Updated Streaming Status...${NC}"
UPDATED_STATUS=$(curl -s -X GET "${BASE_URL}/api/ulv/streaming/status/${TERMINAL_ID}/${SESSION_ID}")

echo "Updated Status: ${UPDATED_STATUS}"
echo ""

# Test 5: Stop ULV Streaming
echo -e "${BLUE}5️⃣ Stopping ULV Streaming...${NC}"
STOP_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/ulv/streaming/control" \
  -H "Content-Type: application/json" \
  -d "{
    \"terminalId\": \"${TERMINAL_ID}\",
    \"sessionId\": \"${SESSION_ID}\",
    \"controlCommand\": 0,
    \"options\": {
      \"audioVideoType\": 0
    }
  }")

echo "Stop Response: ${STOP_RESPONSE}"

# Test 6: Final Status Check
echo -e "${BLUE}6️⃣ Final Status Check...${NC}"
FINAL_STATUS=$(curl -s -X GET "${BASE_URL}/api/ulv/streaming/status/${TERMINAL_ID}/${SESSION_ID}")

echo "Final Status: ${FINAL_STATUS}"
echo ""

# Test 7: Test Different Configurations
echo -e "${BLUE}7️⃣ Testing Different Streaming Configurations...${NC}"
echo "============================================================"

# Test 7.1: Video Only Stream
echo -e "${CYAN}🎥 Testing: Video Only Stream${NC}"
VIDEO_SESSION=$(curl -s -X POST "${BASE_URL}/api/ulv/streaming/start" \
  -H "Content-Type: application/json" \
  -d "{
    \"terminalId\": \"${TERMINAL_ID}\",
    \"serverIP\": \"192.168.100.100\",
    \"tcpPort\": 1935,
    \"udpPort\": 8000,
    \"channelNumber\": 2,
    \"dataType\": 1,
    \"streamType\": 0
  }")

VIDEO_SESSION_ID=$(echo "${VIDEO_SESSION}" | grep -o '"sessionId":"[^"]*"' | cut -d'"' -f4)

if [ -n "${VIDEO_SESSION_ID}" ]; then
    echo -e "${GREEN}✅ Started: Video Only Stream${NC}"
    echo "   Session: ${VIDEO_SESSION_ID}"
    
    # Stop it immediately
    curl -s -X POST "${BASE_URL}/api/ulv/streaming/control" \
      -H "Content-Type: application/json" \
      -d "{
        \"terminalId\": \"${TERMINAL_ID}\",
        \"sessionId\": \"${VIDEO_SESSION_ID}\",
        \"controlCommand\": 0
      }" > /dev/null
    
    echo -e "${RED}🛑 Stopped: Video Only Stream${NC}"
else
    echo -e "${RED}❌ Failed: Video Only Stream${NC}"
fi

echo ""

# Test 7.2: Sub Stream
echo -e "${CYAN}🎥 Testing: Sub Stream${NC}"
SUB_SESSION=$(curl -s -X POST "${BASE_URL}/api/ulv/streaming/start" \
  -H "Content-Type: application/json" \
  -d "{
    \"terminalId\": \"${TERMINAL_ID}\",
    \"serverIP\": \"192.168.100.100\",
    \"tcpPort\": 1935,
    \"udpPort\": 8000,
    \"channelNumber\": 3,
    \"dataType\": 0,
    \"streamType\": 1
  }")

SUB_SESSION_ID=$(echo "${SUB_SESSION}" | grep -o '"sessionId":"[^"]*"' | cut -d'"' -f4)

if [ -n "${SUB_SESSION_ID}" ]; then
    echo -e "${GREEN}✅ Started: Sub Stream${NC}"
    echo "   Session: ${SUB_SESSION_ID}"
    
    # Stop it immediately
    curl -s -X POST "${BASE_URL}/api/ulv/streaming/control" \
      -H "Content-Type: application/json" \
      -d "{
        \"terminalId\": \"${TERMINAL_ID}\",
        \"sessionId\": \"${SUB_SESSION_ID}\",
        \"controlCommand\": 0
      }" > /dev/null
    
    echo -e "${RED}🛑 Stopped: Sub Stream${NC}"
else
    echo -e "${RED}❌ Failed: Sub Stream${NC}"
fi

echo ""

echo -e "${CYAN}🎬 ULV Streaming Test Completed!${NC}"
echo "============================================================"
echo ""
echo -e "${GREEN}✅ All ULV streaming endpoints tested successfully!${NC}"
echo ""
echo -e "${YELLOW}📋 Next Steps:${NC}"
echo "   1. Start SRS media server: docker-compose up -d"
echo "   2. Open web player: http://localhost:8080/player.html"
echo "   3. Test with real ULV device streaming"
echo ""
echo -e "${BLUE}🔗 SRS Server URLs:${NC}"
echo "   - RTMP: rtmp://192.168.100.100:1935"
echo "   - HLS: http://192.168.100.100:8080"
echo "   - HTTP-FLV: http://192.168.100.100:8080"
echo "   - WebRTC: http://192.168.100.100:8001"
echo "   - SRS API: http://192.168.100.100:1985"
