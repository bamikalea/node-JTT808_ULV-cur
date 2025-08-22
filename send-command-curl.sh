#!/bin/bash

# Send JT808 Terminal Commands and Check Server Logs
# This script sends commands and then checks if they were received

SERVER_IP="155.138.175.43"
TERMINAL_ID="628076842334"

echo "🔄 Sending JT808 Terminal Commands via Direct TCP Connection..."
echo "📍 Server: $SERVER_IP"
echo "📱 Terminal: $TERMINAL_ID"
echo ""

# Function to send command and check logs
send_command_and_check() {
    local command_name="$1"
    local command_hex="$2"
    
    echo "=== Sending $command_name Command ==="
    echo "Command Hex: $command_hex"
    
    # Send command using netcat (if available) or create a simple TCP connection
    echo -n "$command_hex" | xxd -r -p | nc $SERVER_IP 8080 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "✅ Command sent successfully"
    else
        echo "❌ Failed to send command"
    fi
    
    echo ""
    
    # Wait a moment for command to be processed
    sleep 2
    
    # Check server status
    echo "📊 Checking server status..."
    curl -s http://$SERVER_IP:3000/status | jq '.' 2>/dev/null || curl -s http://$SERVER_IP:3000/status
    echo ""
}

# JT808 Terminal Restart Command (0x8105)
# Message ID: 0x8105, Length: 24, Terminal: 628076842334, Seq: 12345, Param: 0x00 (Restart)
RESTART_CMD="81050018628076842334303900000000000000000000000000000000"

# JT808 Terminal Reset Command (0x8105)
# Message ID: 0x8105, Length: 24, Terminal: 628076842334, Seq: 12346, Param: 0x01 (Reset)
RESET_CMD="81050018628076842334303a01000000000000000000000000000000"

# Send commands
send_command_and_check "Restart" "$RESTART_CMD"
send_command_and_check "Reset" "$RESET_CMD"

echo "🔍 To check detailed server logs for command reception:"
echo "   ssh root@$SERVER_IP \"pm2 logs jt808-server --lines 50\""
echo ""
echo "💡 Look for:"
echo "   - Command received messages"
echo "   - Terminal response messages"
echo "   - Any error or warning messages"
