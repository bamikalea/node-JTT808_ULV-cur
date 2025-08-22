#!/bin/bash

# JT808 Streaming Command Trigger and Handshake Monitor
# Uses curl to trigger 0x9101 streaming request and monitors logs for device handshake

# Configuration
BASE_URL="http://localhost:3000"
TERMINAL_ID="628076842334"
LOG_FILE="logs/combined.log"
MONITOR_DURATION=30

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🚀 JT808 Streaming Command Trigger and Handshake Monitor${NC}"
echo "=" .repeat(60)

# Function to check if server is running
check_server() {
    echo -e "${BLUE}🔍 Checking if JT808 server is running...${NC}"
    
    if curl -s "${BASE_URL}/api/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ JT808 server is running at ${BASE_URL}${NC}"
        return 0
    else
        echo -e "${RED}❌ JT808 server is not running at ${BASE_URL}${NC}"
        echo -e "${YELLOW}   Make sure the server is started with: npm start${NC}"
        return 1
    fi
}

# Function to start log monitoring
start_log_monitor() {
    echo -e "${BLUE}📊 Starting log monitoring for handshake responses...${NC}"
    echo -e "   Log file: ${LOG_FILE}"
    echo -e "   Duration: ${MONITOR_DURATION} seconds"
    
    # Start monitoring in background
    (
        # Wait for the trigger command to be sent
        sleep 3
        
        # Monitor logs for handshake patterns
        tail -f "${LOG_FILE}" 2>/dev/null | grep --line-buffered -E "(0x9101.*Response|Response to message.*0x9101|ULV.*streaming.*data|0x9103.*ULV)" | while read -r line; do
            echo -e "\n${GREEN}🎯 HANDSHAKE DETECTED:${NC}"
            echo -e "   ${line}"
            echo -e "   ${GREEN}Status: ✅ Device handshake successful${NC}"
        done
    ) &
    
    MONITOR_PID=$!
    echo -e "${GREEN}✅ Log monitoring started (PID: ${MONITOR_PID})${NC}"
}

# Function to stop log monitoring
stop_log_monitor() {
    if [ ! -z "$MONITOR_PID" ]; then
        echo -e "${YELLOW}🛑 Stopping log monitoring...${NC}"
        kill $MONITOR_PID 2>/dev/null
        wait $MONITOR_PID 2>/dev/null
        echo -e "${GREEN}✅ Log monitoring stopped${NC}"
    fi
}

# Function to trigger streaming command
trigger_streaming() {
    echo -e "${BLUE}📡 Triggering ULV streaming command (0x9101)...${NC}"
    
    # Send ULV streaming start request
    echo -e "${CYAN}   Sending POST to: ${BASE_URL}/api/ulv/streaming/start${NC}"
    
    RESPONSE=$(curl -s -X POST "${BASE_URL}/api/ulv/streaming/start" \
        -H "Content-Type: application/json" \
        -d "{
            \"terminalId\": \"${TERMINAL_ID}\",
            \"options\": {
                \"channelNumber\": 1,
                \"streamType\": 0,
                \"quality\": 1,
                \"frameRate\": 25,
                \"audioEnabled\": true
            }
        }")
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Streaming command sent successfully${NC}"
        echo -e "${CYAN}   Response: ${RESPONSE}${NC}"
        
        # Extract session ID if available
        SESSION_ID=$(echo "$RESPONSE" | grep -o '"sessionId":"[^"]*"' | cut -d'"' -f4)
        if [ ! -z "$SESSION_ID" ]; then
            echo -e "${GREEN}   Session ID: ${SESSION_ID}${NC}"
        fi
    else
        echo -e "${RED}❌ Failed to send streaming command${NC}"
        return 1
    fi
}

# Function to check streaming status
check_streaming_status() {
    if [ ! -z "$SESSION_ID" ]; then
        echo -e "${BLUE}📊 Checking streaming status...${NC}"
        
        STATUS_RESPONSE=$(curl -s -X GET "${BASE_URL}/api/ulv/streaming/status/${TERMINAL_ID}/${SESSION_ID}")
        
        if [ $? -eq 0 ]; then
            echo -e "${CYAN}   Status Response: ${STATUS_RESPONSE}${NC}"
        fi
    fi
}

# Function to send direct HEX message (alternative approach)
send_direct_hex() {
    echo -e "${BLUE}🔧 Sending direct HEX streaming command...${NC}"
    
    # Create a simple test client that sends raw HEX
    cat > /tmp/streaming_test.js << 'EOF'
const net = require('net');

// Create JT808 0x9101 streaming message
const message = Buffer.from([
    0x7E,                    // Start marker
    0x91, 0x01,             // Message ID: 0x9101
    0x00, 0x01,             // Message body properties
    0x62, 0x80, 0x76, 0x84, 0x23, 0x34,  // Terminal ID: 628076842334
    0x00, 0x17,             // Message body length: 23 bytes
    0x01,                    // Channel number
    0x00,                    // Stream type (main)
    0x01,                    // Quality (medium)
    0x19,                    // Frame rate (25)
    0x00, 0x00, 0x00, 0x00, // Bitrate (auto)
    0x01,                    // Audio enabled
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // Reserved
    0x7E                     // End marker
]);

const client = new net.Socket();

client.connect(8080, '127.0.0.1', () => {
    console.log('Connected to JT808 server');
    console.log('Sending HEX message:', message.toString('hex').toUpperCase());
    client.write(message);
    
    setTimeout(() => {
        client.destroy();
        process.exit(0);
    }, 1000);
});

client.on('data', (data) => {
    console.log('Received response:', data.toString('hex').toUpperCase());
});

client.on('error', (error) => {
    console.error('Connection error:', error.message);
    process.exit(1);
});
EOF

    echo -e "${CYAN}   Running direct HEX test...${NC}"
    node /tmp/streaming_test.js
    
    # Clean up
    rm -f /tmp/streaming_test.js
}

# Main execution
main() {
    # Check if server is running
    if ! check_server; then
        exit 1
    fi
    
    # Start log monitoring
    start_log_monitor
    
    # Wait a moment for monitoring to start
    sleep 2
    
    # Trigger streaming command
    if trigger_streaming; then
        echo -e "\n${GREEN}✅ Streaming command triggered successfully${NC}"
        
        # Check status after a delay
        sleep 2
        check_streaming_status
        
        # Alternative: Send direct HEX message
        echo -e "\n${BLUE}🔄 Trying alternative direct HEX approach...${NC}"
        send_direct_hex
        
        echo -e "\n${YELLOW}⏳ Monitoring logs for ${MONITOR_DURATION} seconds...${NC}"
        echo -e "   Press Ctrl+C to stop early"
        
        # Keep monitoring for specified duration
        sleep $MONITOR_DURATION
        
    else
        echo -e "${RED}❌ Failed to trigger streaming command${NC}"
    fi
    
    # Stop monitoring
    stop_log_monitor
    
    echo -e "\n${GREEN}✅ Monitoring completed${NC}"
}

# Handle cleanup on exit
trap 'echo -e "\n${YELLOW}🛑 Received interrupt, cleaning up...${NC}"; stop_log_monitor; exit 0' INT TERM

# Run main function
main

