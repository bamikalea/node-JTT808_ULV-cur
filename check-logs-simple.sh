#!/bin/bash

# Simple Server Log Check for Command Responses
SERVER_IP="155.138.175.43"

echo "🔍 Checking JT808 Server Logs for Command Responses..."
echo "📍 Server: $SERVER_IP"
echo ""

echo "📊 Current Server Status:"
curl -s http://$SERVER_IP:3000/status
echo ""
echo ""

echo "📋 To check server logs for command responses:"
echo "1. SSH to server: ssh root@$SERVER_IP"
echo "2. Check PM2 logs: pm2 logs jt808-server --lines 100"
echo "3. Look for:"
echo "   - Command received messages"
echo "   - Terminal 628076842334 responses"
echo "   - Any error messages"
echo "   - Connection status changes"
echo ""
echo "💡 Alternative: Check if terminal disconnected after commands:"
echo "   curl -s http://$SERVER_IP:3000/status | grep connections"
