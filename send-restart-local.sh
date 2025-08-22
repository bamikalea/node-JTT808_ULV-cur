#!/bin/bash

# Send Restart Command Directly to Local JT808 Server
# This script sends a restart command to terminal 628076842334

LOCAL_IP="127.0.0.1"
LOCAL_PORT="8080"
TERMINAL_ID="628076842334"

echo "🔄 Sending Restart Command to Local JT808 Server..."
echo "📍 Local Server: $LOCAL_IP:$LOCAL_PORT"
echo "📱 Target Terminal: $TERMINAL_ID"
echo ""

echo "📊 Current Server Status:"
curl -s http://127.0.0.1:3000/status | jq '.' 2>/dev/null || curl -s http://127.0.0.1:3000/status
echo ""

echo "🔄 Sending Terminal Restart Command (0x8105, param 0x00)..."
echo "Command Hex: 81050018628076842334304100000000000000000000000000000000"
echo ""

# Send restart command directly to local server
echo -n "81050018628076842334304100000000000000000000000000000000" | xxd -r -p | nc $LOCAL_IP $LOCAL_PORT 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Restart command sent successfully to local server"
else
    echo "❌ Failed to send restart command to local server"
fi

echo ""
echo "⏳ Waiting 5 seconds for command processing..."
sleep 5

echo ""
echo "📊 Server Status After Restart Command:"
curl -s http://127.0.0.1:3000/status | jq '.' 2>/dev/null || curl -s http://127.0.0.1:3000/status
echo ""

echo "🔍 Check Server Logs:"
echo "   Look at the terminal where 'npm start' is running"
echo "   You should see:"
echo "   - 'Client connected: 127.0.0.1:[port]'"
echo "   - 'New connection established from 127.0.0.1:[port]'"
echo "   - 'Received message from 127.0.0.1:[port]'"
echo "   - Command parsing and processing"
echo ""
echo "💡 Expected Behavior:"
echo "   - Terminal receives restart command"
echo "   - May disconnect and reconnect"
echo "   - Should maintain JTT2019 time format"
echo "   - Continue sending location/ULV data"
