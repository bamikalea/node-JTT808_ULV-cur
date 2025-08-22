#!/bin/bash

# Test Exposed JT808 Server via ngrok
# This script tests commands on your internet-exposed server

EXPOSED_HOST="5.tcp.eu.ngrok.io"
EXPOSED_PORT="19511"

echo "🌐 Testing Exposed JT808 Server via ngrok..."
echo "📍 Public URL: $EXPOSED_HOST:$EXPOSED_PORT"
echo "🔗 Local Server: 127.0.0.1:8080"
echo ""

echo "📊 Current Local Server Status:"
curl -s http://127.0.0.1:3000/status | jq '.' 2>/dev/null || curl -s http://127.0.0.1:3000/status
echo ""

echo "🔄 Sending Test Commands to Exposed Server..."
echo ""

# Test 1: Restart Command
echo "=== Test 1: Terminal Restart Command ==="
echo "Command: 81050018628076842334303e00000000000000000000000000000000"
echo "Target: Terminal 628076842334"
echo ""

echo -n "81050018628076842334303e00000000000000000000000000000000" | xxd -r -p | nc $EXPOSED_HOST $EXPOSED_PORT 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Restart command sent successfully to exposed server"
else
    echo "❌ Failed to send restart command to exposed server"
fi

echo ""
echo "⏳ Waiting 3 seconds..."
sleep 3

echo "📊 Local Server Status After Exposed Command:"
curl -s http://127.0.0.1:3000/status | jq '.' 2>/dev/null || curl -s http://127.0.0.1:3000/status
echo ""

# Test 2: Reset Command
echo "=== Test 2: Terminal Reset Command ==="
echo "Command: 81050018628076842334303f01000000000000000000000000000000"
echo "Target: Terminal 628076842334"
echo ""

echo -n "81050018628076842334303f01000000000000000000000000000000" | xxd -r -p | nc $EXPOSED_HOST $EXPOSED_PORT 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Reset command sent successfully to exposed server"
else
    echo "❌ Failed to send reset command to exposed server"
fi

echo ""
echo "⏳ Waiting 3 seconds..."
sleep 3

echo "📊 Final Local Server Status:"
curl -s http://127.0.0.1:3000/status | jq '.' 2>/dev/null || curl -s http://127.0.0.1:3000/status
echo ""

echo "🔍 Check Local Server Logs:"
echo "   Look at the terminal where 'npm start' is running"
echo "   You should see commands coming from the ngrok IP address"
echo ""
echo "💡 Expected Log Entries:"
echo "   - 'Client connected: [ngrok-ip]:[port]'"
echo "   - 'New connection established from [ngrok-ip]:[port]'"
echo "   - 'Invalid message format from [ngrok-ip]:[port]'"
echo "   - 'Connection closed from [ngrok-ip]:[port]'"
echo ""
echo "🌐 Your JT808 Server is now accessible at:"
echo "   $EXPOSED_HOST:$EXPOSED_PORT"
echo "   Anyone can connect to test your server!"
