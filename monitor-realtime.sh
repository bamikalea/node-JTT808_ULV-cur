#!/bin/bash

# Real-time JT808 Packet Monitoring
# Monitor packets as they happen

SERVER_IP="155.138.175.43"
SERVER_PORT="8080"

echo "🔍 Real-time JT808 Packet Monitoring"
echo "📍 Server: $SERVER_IP:$SERVER_PORT"
echo ""

echo "📡 To monitor packets in real-time:"
echo ""

echo "1. Start monitoring in one terminal:"
echo "   sudo tcpdump -i any -n host $SERVER_IP and port $SERVER_PORT -X -s 0"
echo ""

echo "2. Send commands in another terminal:"
echo "   ./send-command-curl.sh"
echo ""

echo "3. Watch for these packet patterns:"
echo "   - Outgoing: Your IP → $SERVER_IP:$SERVER_PORT"
echo "   - Payload: 8105... (Terminal Control Command)"
echo "   - Terminal ID: 628076842334 in BCD format"
echo ""

echo "💡 Quick test - Monitor and send simultaneously:"
echo "   (Terminal 1) sudo tcpdump -i any -n host $SERVER_IP and port $SERVER_PORT -X -s 0 | grep -E '8105|628076842334'"
echo "   (Terminal 2) ./send-command-curl.sh"
echo ""

echo "📊 Expected Packet Structure:"
echo "   TCP Header: Your IP → $SERVER_IP:$SERVER_PORT"
echo "   JT808 Payload: 28 bytes"
echo "   Message ID: 0x8105 (Terminal Control)"
echo "   Length: 0x0018 (24 bytes)"
echo "   Terminal: 628076842334 (BCD encoded)"
echo "   Command: 0x00 (Restart) or 0x01 (Reset)"
