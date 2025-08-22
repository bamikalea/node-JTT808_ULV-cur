#!/bin/bash

# Send Restart Command via ngrok to Connected Terminal
# This script sends a restart command to terminal 628076842334

EXPOSED_HOST="4.tcp.eu.ngrok.io"
EXPOSED_PORT="10366"
TERMINAL_ID="628076842334"

echo "🔄 Sending Restart Command via ngrok to Connected Terminal..."
echo "📍 ngrok URL: $EXPOSED_HOST:$EXPOSED_PORT"
echo "📱 Target Terminal: $TERMINAL_ID"
echo ""

echo "📊 Current Server Status:"
curl -s http://127.0.0.1:3000/status | jq '.' 2>/dev/null || curl -s http://127.0.0.1:3000/status
echo ""

echo "🔄 Sending Terminal Restart Command (0x8105, param 0x00)..."
echo "Command Hex: 81050018628076842334304000000000000000000000000000000000"
echo ""

# Send restart command via ngrok
echo -n "81050018628076842334304000000000000000000000000000000000" | xxd -r -p | nc $EXPOSED_HOST $EXPOSED_PORT 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Restart command sent successfully via ngrok"
else
    echo "❌ Failed to send restart command via ngrok"
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
echo "   - Command received from ngrok IP"
echo "   - Terminal 628076842334 processing restart"
echo "   - Possible disconnection/reconnection"
echo ""
echo "💡 Expected Behavior:"
echo "   - Terminal receives restart command"
echo "   - May disconnect and reconnect"
echo "   - Should maintain JTT2019 time format"
echo "   - Continue sending location/ULV data"
