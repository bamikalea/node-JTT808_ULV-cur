#!/bin/bash

# Monitor Reset Command Network Packets
# This script monitors network traffic when reset command is sent

echo "🔍 Monitoring Reset Command Network Packets"
echo "=========================================="

DEVICE_IP="192.168.100.1"
SERVER_PORT="3000"

echo "📋 Configuration:"
echo "   Device IP: $DEVICE_IP"
echo "   Server Port: $SERVER_PORT"
echo "   Looking for 0x8105 messages (Terminal Control)"

echo ""
echo "📡 Starting packet capture..."
echo "   This will monitor all traffic between server and device"
echo "   Look for 0x8105 messages with command word 0x74"
echo ""

# Start packet capture in background
sudo tcpdump -i any -n -s 0 -X host $DEVICE_IP and port $SERVER_PORT &
TCPDUMP_PID=$!

echo "📊 Packet capture started (PID: $TCPDUMP_PID)"
echo "   Now run the reset command in another terminal:"
echo ""
echo "   Option 1: HTTP API"
echo "   curl -X POST 'http://localhost:3000/api/terminal/restart' \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"terminalId\": \"628076842334\"}'"
echo ""
echo "   Option 2: Direct test script"
echo "   node test-reset-real-device.js"
echo ""
echo "   Option 3: Manual server method call"
echo "   node -e \"const s = require('./src/jt808-server'); s.restartTerminal('628076842334');\""
echo ""

echo "🔍 Monitoring packets... (Press Ctrl+C to stop)"
echo "   Look for:"
echo "   - 0x8105 message ID (Terminal Control)"
echo "   - Command word 0x74 in message body"
echo "   - Device response (0x8001 or similar)"
echo ""

# Wait for user to stop
trap "echo ''; echo '🛑 Stopping packet capture...'; sudo kill $TCPDUMP_PID; echo '✅ Packet capture stopped'; exit 0" INT

# Keep running until interrupted
while true; do
    sleep 1
done



