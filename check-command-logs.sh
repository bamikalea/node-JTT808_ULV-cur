#!/bin/bash

# Check JT808 Server Logs for Command Reception
# This script checks if the terminal received the commands

SERVER_IP="155.138.175.43"

echo "🔍 Checking JT808 Server Logs for Command Reception..."
echo "📍 Server: $SERVER_IP"
echo ""

echo "📊 Current Server Status:"
curl -s http://$SERVER_IP:3000/status | jq '.' 2>/dev/null || curl -s http://$SERVER_IP:3000/status
echo ""

echo "📋 Recent Server Logs (Last 30 lines):"
echo "Looking for command reception, terminal responses, or errors..."
echo ""

# Try to get logs via SSH (if available) or suggest manual check
echo "💡 To check detailed logs manually:"
echo "   ssh root@$SERVER_IP \"pm2 logs jt808-server --lines 50\""
echo ""
echo "🔍 Look for these patterns in the logs:"
echo "   - 'Received message from' with terminal ID 628076842334"
echo "   - 'Command received' or 'Terminal command' messages"
echo "   - Any error messages about invalid commands"
echo "   - Terminal response messages"
echo "   - Connection status changes"
echo ""
echo "📱 Expected Behavior:"
echo "   - Terminal should receive restart/reset commands"
echo "   - Should send acknowledgment or response"
echo "   - May disconnect and reconnect after restart"
echo "   - Should maintain JTT2019 time format"
