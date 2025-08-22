#!/bin/bash

# Test Command Logging - Send command and check immediate response
# This script helps verify if commands are being logged

SERVER_IP="155.138.175.43"

echo "🧪 Testing JT808 Command Logging..."
echo "📍 Server: $SERVER_IP"
echo ""

echo "📊 Server Status Before Command:"
curl -s http://$SERVER_IP:3000/status | jq '.' 2>/dev/null || curl -s http://$SERVER_IP:3000/status
echo ""

echo "🔄 Sending Test Command..."
echo "Command: Terminal Restart (0x8105, param 0x00)"
echo ""

# Send a simple restart command
echo -n "81050018628076842334303b00000000000000000000000000000000" | xxd -r -p | nc $SERVER_IP 8080 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Command sent successfully"
else
    echo "❌ Failed to send command"
fi

echo ""
echo "⏳ Waiting 3 seconds for command processing..."
sleep 3

echo ""
echo "📊 Server Status After Command:"
curl -s http://$SERVER_IP:3000/status | jq '.' 2>/dev/null || curl -s http://$SERVER_IP:3000/status
echo ""

echo "🔍 To check server logs for this command:"
echo "   ssh root@$SERVER_IP 'pm2 logs jt808-server --lines 20'"
echo ""
echo "💡 Look for:"
echo "   - 'Received message from terminal 628076842334'"
echo "   - 'Message ID: 0x8105'"
echo "   - 'Command parameter: 0x00'"
echo "   - Any error or parsing messages"
