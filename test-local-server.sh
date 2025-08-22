#!/bin/bash

# Test JT808 Commands on Local Server
# This script tests commands locally for easier debugging

LOCAL_IP="127.0.0.1"
LOCAL_PORT="8080"
HTTP_PORT="3000"

echo "🧪 Testing JT808 Commands on Local Server..."
echo "📍 Local Server: $LOCAL_IP:$LOCAL_PORT"
echo "🌐 HTTP API: $LOCAL_IP:$HTTP_PORT"
echo ""

echo "📊 Current Local Server Status:"
curl -s http://$LOCAL_IP:$HTTP_PORT/status | jq '.' 2>/dev/null || curl -s http://$LOCAL_IP:$HTTP_PORT/status
echo ""

echo "🔄 Sending Test Commands to Local Server..."
echo ""

# Test 1: Restart Command
echo "=== Test 1: Terminal Restart Command ==="
echo "Command: 81050018628076842334303c00000000000000000000000000000000"
echo "Target: Terminal 628076842334"
echo ""

echo -n "81050018628076842334303c00000000000000000000000000000000" | xxd -r -p | nc $LOCAL_IP $LOCAL_PORT 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Restart command sent successfully"
else
    echo "❌ Failed to send restart command"
fi

echo ""
echo "⏳ Waiting 2 seconds..."
sleep 2

echo "📊 Server Status After Restart Command:"
curl -s http://$LOCAL_IP:$HTTP_PORT/status | jq '.' 2>/dev/null || curl -s http://$LOCAL_IP:$HTTP_PORT/status
echo ""

# Test 2: Reset Command
echo "=== Test 2: Terminal Reset Command ==="
echo "Command: 81050018628076842334303d01000000000000000000000000000000"
echo "Target: Terminal 628076842334"
echo ""

echo -n "81050018628076842334303d01000000000000000000000000000000" | xxd -r -p | nc $LOCAL_IP $LOCAL_PORT 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Reset command sent successfully"
else
    echo "❌ Failed to send reset command"
fi

echo ""
echo "⏳ Waiting 2 seconds..."
sleep 2

echo "📊 Server Status After Reset Command:"
curl -s http://$LOCAL_IP:$HTTP_PORT/status | jq '.' 2>/dev/null || curl -s http://$LOCAL_IP:$HTTP_PORT/status
echo ""

echo "🔍 Local Server Logs:"
echo "   Check your terminal where npm start is running for JT808 logs"
echo "   Look for: command received, parsing, terminal responses"
echo ""
echo "💡 Expected Log Entries:"
echo "   - 'Received message from terminal 628076842334'"
echo "   - 'Message ID: 0x8105 (Terminal Control)'"
echo "   - 'Command parameter: 0x00 (Restart) or 0x01 (Reset)'"
echo "   - Any parsing errors or validation messages"
