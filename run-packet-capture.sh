#!/bin/bash

# Run Packet Capture and Send JT808 Commands
# This script captures packets while sending commands

SERVER_IP="155.138.175.43"
SERVER_PORT="8080"
CAPTURE_FILE="jt808_capture_$(date +%Y%m%d_%H%M%S).pcap"

echo "🚀 Starting JT808 Packet Capture and Command Test..."
echo "📍 Server: $SERVER_IP:$SERVER_PORT"
echo "📁 Capture File: $CAPTURE_FILE"
echo ""

echo "📡 Starting packet capture in background..."
echo "   Capturing all traffic to/from JT808 server..."
echo ""

# Start packet capture in background
sudo tcpdump -i any -n host $SERVER_IP and port $SERVER_PORT -w "$CAPTURE_FILE" &
CAPTURE_PID=$!

echo "✅ Packet capture started (PID: $CAPTURE_PID)"
echo "⏳ Waiting 3 seconds for capture to initialize..."
sleep 3

echo ""
echo "🔄 Sending JT808 Commands..."
echo ""

# Send commands
./send-command-curl.sh

echo ""
echo "⏳ Waiting 5 seconds for commands to be processed..."
sleep 5

echo ""
echo "🛑 Stopping packet capture..."
sudo kill $CAPTURE_PID 2>/dev/null

echo ""
echo "📊 Packet Capture Results:"
echo "   Capture file: $CAPTURE_FILE"
echo "   File size: $(ls -lh "$CAPTURE_FILE" 2>/dev/null | awk '{print $5}' || echo 'N/A')"
echo ""

echo "🔍 Analyze captured packets:"
echo "   sudo tcpdump -r $CAPTURE_FILE -X -s 0 | grep -E '8105|8103|628076842334'"
echo ""

echo "📋 Quick packet summary:"
sudo tcpdump -r "$CAPTURE_FILE" -n 2>/dev/null | head -20

echo ""
echo "💡 To view detailed packet contents:"
echo "   sudo tcpdump -r $CAPTURE_FILE -X -s 0"
