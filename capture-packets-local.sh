#!/bin/bash

# Capture JT808 Packets Locally
# This script captures packets to/from the JT808 server

SERVER_IP="155.138.175.43"
SERVER_PORT="8080"

echo "🔍 Capturing JT808 Network Packets Locally..."
echo "📍 Server: $SERVER_IP:$SERVER_PORT"
echo ""

echo "📡 Prerequisites:"
echo "   - Install tcpdump: brew install tcpdump (macOS) or sudo apt-get install tcpdump (Linux)"
echo "   - Run with sudo/root privileges for packet capture"
echo ""

echo "🚀 Quick Packet Capture Commands:"
echo ""

echo "1. Basic JT808 Traffic Capture:"
echo "   sudo tcpdump -i any -n host $SERVER_IP and port $SERVER_PORT -vvv"
echo ""

echo "2. Detailed JT808 Command Analysis:"
echo "   sudo tcpdump -i any -n host $SERVER_IP and port $SERVER_PORT -X -s 0 | grep -E '8105|8103|628076842334'"
echo ""

echo "3. Real-time Command Monitoring:"
echo "   sudo tcpdump -i any -n host $SERVER_IP and port $SERVER_PORT -X -s 0 | grep -A5 -B5 '8105'"
echo ""

echo "4. Capture to File for Analysis:"
echo "   sudo tcpdump -i any -n host $SERVER_IP and port $SERVER_PORT -w jt808_capture.pcap"
echo ""

echo "💡 Test Procedure:"
echo "1. Start packet capture in one terminal"
echo "2. Send commands in another terminal: ./send-command-curl.sh"
echo "3. Watch for command packets in real-time"
echo "4. Analyze captured packets for JT808 structure"
echo ""

echo "📊 Expected Packet Analysis:"
echo "   - Source: Your local IP"
echo "   - Destination: $SERVER_IP:$SERVER_PORT"
echo "   - Protocol: TCP"
echo "   - Payload: 28-byte JT808 command (0x8105...)"
echo "   - Terminal ID: 628076842334 in BCD format"
