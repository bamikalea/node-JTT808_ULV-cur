#!/bin/bash

# JT808 Handshake Response Monitor
# Monitors logs for device handshake responses to 0x9101 streaming commands

# Configuration
LOG_FILE="logs/combined.log"
MONITOR_DURATION=${1:-30}  # Default 30 seconds, can be overridden

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}📊 JT808 Handshake Response Monitor${NC}"
echo "=================================================="
echo -e "${BLUE}Monitoring logs for handshake responses...${NC}"
echo -e "   Log file: ${LOG_FILE}"
echo -e "   Duration: ${MONITOR_DURATION} seconds"
echo -e "   Patterns: 0x9101 responses, ULV streaming data"
echo ""

# Check if log file exists
if [ ! -f "$LOG_FILE" ]; then
    echo -e "${YELLOW}⚠️  Log file not found: ${LOG_FILE}${NC}"
    echo -e "   Make sure the JT808 server is running and generating logs"
    exit 1
fi

# Function to monitor logs for handshake patterns
monitor_logs() {
    echo -e "${GREEN}🎯 Starting handshake monitoring...${NC}"
    echo -e "${YELLOW}   Press Ctrl+C to stop early${NC}"
    echo ""
    
    # Monitor logs for handshake patterns
    tail -f "$LOG_FILE" 2>/dev/null | grep --line-buffered -E "(0x9101.*Response|Response to message.*0x9101|ULV.*streaming.*data|0x9103.*ULV|handshake|handshake.*response)" | while read -r line; do
        timestamp=$(date '+%H:%M:%S')
        echo -e "\n${GREEN}[${timestamp}] 🎯 HANDSHAKE DETECTED:${NC}"
        echo -e "   ${line}"
        
        # Highlight key information
        if echo "$line" | grep -q "0x9101.*Response.*Result.*0x0"; then
            echo -e "   ${GREEN}✅ SUCCESS: Device accepted streaming request${NC}"
        elif echo "$line" | grep -q "ULV.*streaming.*data"; then
            echo -e "   ${GREEN}✅ SUCCESS: ULV streaming data received${NC}"
        elif echo "$line" | grep -q "0x9103.*ULV"; then
            echo -e "   ${GREEN}✅ SUCCESS: ULV streaming control response${NC}"
        else
            echo -e "   ${CYAN}📡 INFO: Handshake response detected${NC}"
        fi
    done
}

# Function to show recent handshake activity
show_recent_activity() {
    echo -e "${BLUE}📋 Recent handshake activity (last 10 entries):${NC}"
    grep -E "(0x9101.*Response|Response to message.*0x9101|ULV.*streaming.*data|0x9103.*ULV)" "$LOG_FILE" | tail -10 | while read -r line; do
        echo -e "   ${line}"
    done
    echo ""
}

# Function to show streaming statistics
show_streaming_stats() {
    echo -e "${BLUE}📊 Streaming statistics from logs:${NC}"
    
    # Count 0x9101 messages sent
    local sent_count=$(grep -c "0x9101 message sent successfully" "$LOG_FILE" 2>/dev/null || echo "0")
    echo -e "   📤 0x9101 messages sent: ${sent_count}"
    
    # Count successful responses
    local response_count=$(grep -c "Response to message.*0x9101.*Result.*0x0" "$LOG_FILE" 2>/dev/null || echo "0")
    echo -e "   📥 Successful responses: ${response_count}"
    
    # Count ULV streaming data
    local ulv_count=$(grep -c "ULV.*streaming.*data" "$LOG_FILE" 2>/dev/null || echo "0")
    echo -e "   📡 ULV streaming data packets: ${ulv_count}"
    
    echo ""
}

# Main execution
main() {
    # Show recent activity first
    show_recent_activity
    
    # Show streaming statistics
    show_streaming_stats
    
    # Start monitoring
    monitor_logs &
    MONITOR_PID=$!
    
    # Wait for specified duration
    sleep $MONITOR_DURATION
    
    # Stop monitoring
    echo -e "\n${YELLOW}⏰ Monitoring duration completed${NC}"
    kill $MONITOR_PID 2>/dev/null
    wait $MONITOR_PID 2>/dev/null
    
    echo -e "${GREEN}✅ Handshake monitoring completed${NC}"
}

# Handle cleanup on exit
trap 'echo -e "\n${YELLOW}🛑 Received interrupt, stopping monitor...${NC}"; kill $MONITOR_PID 2>/dev/null; exit 0' INT TERM

# Run main function
main
