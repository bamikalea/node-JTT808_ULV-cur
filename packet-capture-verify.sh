#!/bin/bash

# Packet Capture Verification Script for JT808 Commands
# This script uses tcpdump to verify that commands are actually being sent to the device

echo "🚀 Starting Packet Capture Verification for JT808 Commands"
echo "========================================================"

# Configuration
DEVICE_IP="192.168.100.1"
DEVICE_PORT="52202"
SERVER_IP="192.168.100.100"
SERVER_PORT="3000"
CAPTURE_FILE="jt808_packets.pcap"
LOG_FILE="packet_capture.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Check if tcpdump is available
if ! command -v tcpdump &> /dev/null; then
    error "tcpdump is not installed. Please install it first."
    exit 1
fi

# Check if we have permission to capture packets
if ! sudo -n true 2>/dev/null; then
    warning "This script requires sudo privileges for packet capture."
    echo "Please run with: sudo $0"
    exit 1
fi

# Function to start packet capture
start_capture() {
    log "📡 Starting packet capture on interface..."
    log "   Target: $DEVICE_IP:$DEVICE_PORT"
    log "   Capture file: $CAPTURE_FILE"
    
    # Start tcpdump in background
    sudo tcpdump -i any -w "$CAPTURE_FILE" \
        "host $DEVICE_IP and port $DEVICE_PORT" \
        -s 0 -U &
    
    TCPDUMP_PID=$!
    echo $TCPDUMP_PID > tcpdump.pid
    
    log "✅ Packet capture started (PID: $TCPDUMP_PID)"
    log "   Capturing packets to $CAPTURE_FILE"
}

# Function to stop packet capture
stop_capture() {
    if [ -f tcpdump.pid ]; then
        TCPDUMP_PID=$(cat tcpdump.pid)
        if kill -0 $TCPDUMP_PID 2>/dev/null; then
            log "🛑 Stopping packet capture (PID: $TCPDUMP_PID)..."
            sudo kill $TCPDUMP_PID
            rm -f tcpdump.pid
            success "Packet capture stopped"
        fi
    fi
}

# Function to analyze captured packets
analyze_packets() {
    if [ ! -f "$CAPTURE_FILE" ]; then
        error "No capture file found: $CAPTURE_FILE"
        return 1
    fi
    
    log "🔍 Analyzing captured packets..."
    
    # Count total packets
    TOTAL_PACKETS=$(sudo tcpdump -r "$CAPTURE_FILE" 2>/dev/null | wc -l)
    log "   Total packets captured: $TOTAL_PACKETS"
    
    if [ $TOTAL_PACKETS -eq 0 ]; then
        warning "No packets were captured. This suggests:"
        warning "   1. No commands were sent to the device"
        warning "   2. Commands were sent but not captured"
        warning "   3. Device is not responding"
        return 1
    fi
    
    # Analyze packet directions
    OUTGOING=$(sudo tcpdump -r "$CAPTURE_FILE" "src $SERVER_IP and dst $DEVICE_IP" 2>/dev/null | wc -l)
    INCOMING=$(sudo tcpdump -r "$CAPTURE_FILE" "src $DEVICE_IP and dst $SERVER_IP" 2>/dev/null | wc -l)
    
    log "   Outgoing packets (server → device): $OUTGOING"
    log "   Incoming packets (device → server): $INCOMING"
    
    # Show packet details
    log "📦 Packet details:"
    sudo tcpdump -r "$CAPTURE_FILE" -n -l 2>/dev/null | head -20 | while read line; do
        log "   $line"
    done
    
    # Check for specific command patterns
    log "🔍 Looking for JT808 command patterns..."
    
    # Check for restart command (0x8105)
    if sudo tcpdump -r "$CAPTURE_FILE" -A 2>/dev/null | grep -q "8105"; then
        success "Found restart command (0x8105) in captured packets"
    else
        warning "Restart command (0x8105) NOT found in captured packets"
    fi
    
    # Check for streaming command (0x9101)
    if sudo tcpdump -r "$CAPTURE_FILE" -A 2>/dev/null | grep -q "9101"; then
        success "Found streaming command (0x9101) in captured packets"
    else
        warning "Streaming command (0x9101) NOT found in captured packets"
    fi
    
    # Check for parameter setting (0x8103)
    if sudo tcpdump -r "$CAPTURE_FILE" -A 2>/dev/null | grep -q "8103"; then
        success "Found parameter setting command (0x8103) in captured packets"
    else
        warning "Parameter setting command (0x8103) NOT found in captured packets"
    fi
}

# Function to send test commands and monitor
send_test_commands() {
    log "📤 Sending test commands to verify packet capture..."
    
    # Send restart command
    log "   Sending restart command..."
    curl -s -X POST http://localhost:3000/api/terminal/restart \
        -H "Content-Type: application/json" \
        -d '{"terminalId":"628076842334"}' > /dev/null
    
    sleep 2
    
    # Send streaming command
    log "   Sending streaming command..."
    curl -s -X POST http://localhost:3000/api/streaming/jt1078 \
        -H "Content-Type: application/json" \
        -d '{"terminalId":"628076842334","channelId":1,"dataType":0}' > /dev/null
    
    sleep 2
    
    # Send parameter setting
    log "   Sending parameter setting..."
    curl -s -X POST http://localhost:3000/api/terminal/set-params \
        -H "Content-Type: application/json" \
        -d '{"terminalId":"628076842334","parameters":{"0x0070":1,"0x0064":2,"0x0065":5}}' > /dev/null
    
    log "✅ Test commands sent. Check packet capture for transmission."
}

# Function to check connection status
check_connection() {
    log "🔗 Checking connection status..."
    
    # Check for any connection to the device IP
    if netstat -an | grep -q "$DEVICE_IP.*ESTABLISHED"; then
        success "Active connection found to device"
        netstat -an | grep "$DEVICE_IP.*ESTABLISHED" | while read line; do
            log "   $line"
        done
        return 0
    else
        error "No active connection to device found"
        return 1
    fi
}

# Main execution
main() {
    log "Starting JT808 Command Verification..."
    
    # Check connection first
    if ! check_connection; then
        error "Cannot proceed without active connection"
        exit 1
    fi
    
    # Start packet capture
    start_capture
    
    # Wait a moment for capture to start
    sleep 3
    
    # Send test commands
    send_test_commands
    
    # Wait for packets to be captured
    log "⏳ Waiting for packet capture..."
    sleep 10
    
    # Stop capture and analyze
    stop_capture
    
    # Analyze captured packets
    analyze_packets
    
    log "✅ Verification complete. Check $LOG_FILE for details."
}

# Cleanup function
cleanup() {
    log "🧹 Cleaning up..."
    stop_capture
    rm -f tcpdump.pid
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Run main function
main "$@"
