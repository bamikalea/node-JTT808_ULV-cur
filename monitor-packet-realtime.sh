#!/bin/bash

# Monitor Network Packets in Real-time for Restart Command
# This script monitors network packets to see the exact restart command

echo "🔍 Monitoring Network Packets for Restart Command..."
echo "=================================================="
echo ""

echo "📡 Command Details:"
echo "=================="
echo "Message ID: 0x8105 (Terminal Control)"
echo "Command Word: 0x74 (ULV Restart Device)"
echo "Terminal: 628076842334"
echo "Sequence: c2a0"
echo "Time: $(date)"
echo ""

echo "📊 Expected Packet Structure:"
echo "============================"
echo "Start Flag: 7e"
echo "Message ID: 8105 (Terminal Control)"
echo "Body Length: 0001 (1 byte)"
echo "Terminal ID: 628076842334"
echo "Sequence: c2a0"
echo "Command Word: 74 (ULV Restart Device)"
echo "End Flag: 7e"
echo ""

echo "🎯 Real-time Packet Monitoring:"
echo "=============================="
echo "1. Starting tcpdump to monitor JT808 packets"
echo "2. Looking for packets on port 8080"
echo "3. Filtering for restart command patterns"
echo "4. Analyzing packet structure in real-time"
echo ""

echo "🚀 Starting Real-time Packet Monitor..."
echo "====================================="

# Start real-time packet monitoring
echo "📡 Starting tcpdump real-time monitoring..."
echo "🔍 Looking for JT808 packets on port 8080..."
echo ""

# Monitor packets in real-time with hex output
sudo tcpdump -i lo0 -s 0 -X port 8080 | grep -E "(8105|7e|74)" --color=always
