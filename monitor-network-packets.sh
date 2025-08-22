#!/bin/bash

# Monitor Network Packets for JT808 Commands
# This script captures and analyzes JT808 traffic to/from the server

SERVER_IP="155.138.175.43"
SERVER_PORT="8080"

echo "🔍 Monitoring Network Packets for JT808 Commands..."
echo "📍 Server: $SERVER_IP:$SERVER_PORT"
echo ""

echo "📡 To monitor network packets on the Vultr server:"
echo ""
echo "1. SSH to server: ssh root@$SERVER_IP"
echo "2. Install tcpdump if not available: yum install -y tcpdump"
echo "3. Monitor JT808 traffic:"
echo ""

echo "📊 Basic Packet Capture:"
echo "   tcpdump -i any -n port $SERVER_PORT -vvv"
echo ""

echo "🔍 Detailed JT808 Analysis:"
echo "   tcpdump -i any -n port $SERVER_PORT -X -s 0 | grep -E '8105|8103|628076842334'"
echo ""

echo "📋 Real-time JT808 Command Monitoring:"
echo "   tcpdump -i any -n port $SERVER_PORT -X -s 0 | grep -A5 -B5 '8105'"
echo ""

echo "💡 Alternative: Monitor specific terminal traffic:"
echo "   tcpdump -i any -n port $SERVER_PORT -X -s 0 | grep -A10 -B10 '628076842334'"
echo ""

echo "🚀 Quick Test - Send command and monitor:"
echo "1. In one terminal: ssh root@$SERVER_IP 'tcpdump -i any -n port $SERVER_PORT -X -s 0'"
echo "2. In another terminal: ./send-command-curl.sh"
echo "3. Watch for the command packets in tcpdump output"
echo ""

echo "📊 Expected Packet Structure:"
echo "   Message ID: 0x8105 (Terminal Control)"
echo "   Terminal ID: 628076842334"
echo "   Command: 0x00 (Restart) or 0x01 (Reset)"
echo "   Length: 28 bytes total"
