#!/bin/bash

# Check Server Logs for JT808 Commands Received
# This script helps analyze what commands the server actually received

SERVER_IP="155.138.175.43"

echo "🔍 Checking Server Logs for JT808 Commands Received..."
echo "📍 Server: $SERVER_IP"
echo ""

echo "📊 Current Server Status:"
curl -s http://$SERVER_IP:3000/status | jq '.' 2>/dev/null || curl -s http://$SERVER_IP:3000/status
echo ""

echo "📋 To Check Server Logs Manually:"
echo ""
echo "1. SSH to server:"
echo "   ssh root@$SERVER_IP"
echo ""
echo "2. Check PM2 logs for recent activity:"
echo "   pm2 logs jt808-server --lines 100"
echo ""
echo "3. Look for these specific patterns:"
echo "   - 'Received message from terminal 628076842334'"
echo "   - 'Message ID: 0x8105' (Terminal Control)"
echo "   - 'Command type: restart/reset'"
echo "   - 'Terminal response' or 'Command acknowledged'"
echo "   - Any error messages about invalid commands"
echo ""

echo "🔍 Alternative: Check system logs:"
echo "   journalctl -u pm2-root -f | grep jt808"
echo ""

echo "💡 Expected Log Entries:"
echo "   [TIMESTAMP] Received message from terminal 628076842334"
echo "   [TIMESTAMP] Message ID: 0x8105 (Terminal Control)"
echo "   [TIMESTAMP] Command parameter: 0x00 (Restart) or 0x01 (Reset)"
echo "   [TIMESTAMP] Terminal response: [response details]"
echo ""

echo "❓ If No Logs Found:"
echo "   - Commands may not have been parsed correctly"
echo "   - Terminal may not support these command types"
echo "   - Protocol format mismatch"
echo "   - Commands sent to wrong terminal"
echo ""

echo "🚀 Quick Test - Send another command and check logs:"
echo "   ./send-command-curl.sh"
echo "   Then immediately check: ssh root@$SERVER_IP 'pm2 logs jt808-server --lines 20'"
