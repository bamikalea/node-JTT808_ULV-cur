#!/bin/bash

# Real-time JT808 Server Log Monitor
# Monitors server logs for responses, connections, and activity

SERVER_IP="155.138.175.43"
LOG_LINES=50

echo "🔍 Starting JT808 Server Log Monitor..."
echo "📍 Server: $SERVER_IP"
echo "📊 Current Status:"
echo ""

# Get current server status
echo "📡 Server Status:"
curl -s http://$SERVER_IP:3000/status | jq '.' 2>/dev/null || curl -s http://$SERVER_IP:3000/status
echo ""
echo "---"

# Monitor logs in real-time
echo "📋 Monitoring server logs (Press Ctrl+C to stop)..."
echo ""

# Function to show logs
show_logs() {
    echo "🕐 $(date '+%H:%M:%S') - Checking logs..."
    ssh root@$SERVER_IP "pm2 logs jt808-server --lines $LOG_LINES" 2>/dev/null | tail -20
    echo ""
    echo "---"
}

# Initial log check
show_logs

# Monitor loop
while true; do
    sleep 10
    show_logs
done
