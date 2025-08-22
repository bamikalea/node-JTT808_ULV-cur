#!/bin/bash

# Monitor Network Packets for JT808 Commands
# This script captures and analyzes the exact commands sent

LOCAL_IP="127.0.0.1"
LOCAL_PORT="8080"

echo "🔍 Monitoring Network Packets for JT808 Commands..."
echo "📍 Local Server: $LOCAL_IP:$LOCAL_PORT"
echo ""

echo "📡 Starting packet capture in background..."
echo "   Capturing all traffic to/from JT808 server..."
echo ""

# Start packet capture in background
sudo tcpdump -i any -n host $LOCAL_IP and port $LOCAL_PORT -X -s 0 > command_capture.log 2>&1 &
CAPTURE_PID=$!

echo "✅ Packet capture started (PID: $CAPTURE_PID)"
echo "⏳ Waiting 3 seconds for capture to initialize..."
sleep 3

echo ""
echo "🔄 Sending JT808 Restart Command..."
echo "Command: 81050018628076842334304200000000000000000000000000000000"
echo ""

# Send restart command
echo -n "81050018628076842334304200000000000000000000000000000000" | xxd -r -p | nc $LOCAL_IP $LOCAL_PORT 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Command sent successfully"
else
    echo "❌ Failed to send command"
fi

echo ""
echo "⏳ Waiting 5 seconds for packet capture..."
sleep 5

echo ""
echo "🛑 Stopping packet capture..."
sudo kill $CAPTURE_PID 2>/dev/null

echo ""
echo "📊 Captured Packet Analysis:"
echo ""

# Analyze captured packets
if [ -f command_capture.log ]; then
    echo "📋 Raw Packet Data:"
    cat command_capture.log | grep -A10 -B5 "8105\|628076842334" | head -30
    
    echo ""
    echo "🔍 Command Analysis:"
    echo "   Look for:"
    echo "   - TCP connection establishment"
    echo "   - JT808 payload: 8105..."
    echo "   - Terminal ID: 628076842334"
    echo "   - Command parameter: 0x00 (Restart)"
    echo "   - Packet length and structure"
else
    echo "❌ No packet capture file found"
fi

echo ""
echo "💡 Expected JT808 Command Structure:"
echo "   Message ID: 0x8105 (Terminal Control)"
echo "   Length: 0x0018 (24 bytes)"
echo "   Terminal: 628076842334 (BCD encoded)"
echo "   Command: 0x00 (Restart)"
echo "   Total Length: 28 bytes"
