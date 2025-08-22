#!/bin/bash

# Capture Restart Command Network Packet
# This script captures the exact network packet sent to the device

echo "🔍 Capturing Restart Command Network Packet..."
echo "============================================="
echo ""

echo "📡 Command Sent:"
echo "================"
echo "Message ID: 0x8105 (Terminal Control)"
echo "Command Word: 0x74 (ULV Restart Device)"
echo "Terminal: 628076842334"
echo "Sequence: 0891"
echo "Time: $(date)"
echo ""

echo "📊 Command Details:"
echo "=================="
echo "Length: 28 bytes"
echo "Hex: 81050001628076842334089174000000000000000000000000000000"
echo ""

echo "🔍 Command Structure:"
echo "===================="
echo "Start Flag: 7e"
echo "Message ID: 8105 (Terminal Control)"
echo "Body Length: 0001 (1 byte)"
echo "Terminal ID: 628076842334"
echo "Sequence: 0891"
echo "Command Word: 74 (ULV Restart Device)"
echo "End Flag: 7e"
echo ""

echo "🎯 Packet Capture Instructions:"
echo "=============================="
echo "1. Starting tcpdump to capture JT808 packets"
echo "2. Looking for packets to/from port 8080"
echo "3. Filtering for restart command (0x8105)"
echo "4. Analyzing exact packet structure"
echo ""

echo "🚀 Starting Packet Capture..."
echo "============================"

# Start packet capture in background
echo "📡 Starting tcpdump capture..."
sudo tcpdump -i lo0 -s 0 -w restart_command_capture.pcap port 8080 &
TCPDUMP_PID=$!

echo "✅ tcpdump started with PID: $TCPDUMP_PID"
echo "📁 Capture file: restart_command_capture.pcap"
echo ""

echo "💡 Monitoring Instructions:"
echo "========================="
echo "1. tcpdump is now capturing packets on port 8080"
echo "2. Send another restart command to capture the packet"
echo "3. Stop capture with: sudo kill $TCPDUMP_PID"
echo "4. Analyze with: tcpdump -r restart_command_capture.pcap -x"
echo ""

echo "⏳ Ready to capture restart command packet!"
echo "=========================================="
echo "Send another restart command now to capture the packet..."
echo "Then run: sudo kill $TCPDUMP_PID to stop capture"
