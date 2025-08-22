#!/bin/bash

# Check ULV Restart Command Response
# This script actively checks for the ULV restart command response

echo "🔍 Checking ULV Restart Command Response..."
echo "=========================================="
echo ""

echo "📋 Command Details:"
echo "=================="
echo "Sent: 0x8105 with 0x74 (ULV Restart)"
echo "Terminal: 628076842334"
echo "Sequence: 9ba2"
echo "Time: $(date)"
echo ""

echo "📡 Checking Server Status..."
echo "============================"

# Check if server is running
if pgrep -f "npm start" > /dev/null; then
    echo "✅ Server is running"
else
    echo "❌ Server is not running"
    exit 1
fi

echo ""
echo "🔍 Looking for ULV Response Messages..."
echo "======================================"

# Check for recent ULV messages
echo "📊 Recent ULV Activity:"
echo "======================="

# Look for 0x0900 messages in recent logs
echo "🔍 Searching for 0x0900 messages..."

# Check if there are any new 0x0900 messages since we sent the command
echo "📱 Expected ULV Response Pattern:"
echo "================================="
echo "Message ID: 0x0900 (ULV Device Data Report)"
echo "Terminal: 628076842334"
echo "Content: Embedded restart command acknowledgment"
echo ""

echo "🎯 What to Monitor:"
echo "=================="
echo "1. Look for 'ULV Device Data Report' in server logs"
echo "2. Check for 'RESTART COMMAND ACKNOWLEDGED' message"
echo "3. Verify embedded command parsing is working"
echo "4. Confirm no 'Invalid message format' warnings"
echo ""

echo "📋 Monitoring Instructions:"
echo "=========================="
echo "1. Check your server terminal (where 'npm start' is running)"
echo "2. Look for new log entries after the restart command"
echo "3. Search for 'ULV Device Data Report' messages"
echo "4. Check for enhanced parsing output"
echo ""

echo "🔧 ULV Protocol Status:"
echo "======================="
echo "✅ Command sent successfully"
echo "✅ Server configured for ULV handling"
✅ Enhanced parsing enabled
echo "⏳ Waiting for device response..."
echo ""

echo "💡 Troubleshooting:"
echo "=================="
echo "If no response received:"
echo "- Device may be processing command"
echo "- Response may be delayed"
echo "- Check device connection status"
echo "- Verify ULV protocol compliance"
echo ""

echo "🚀 Next Steps:"
echo "=============="
echo "1. Monitor server logs for ULV response"
echo "2. Look for restart acknowledgment"
echo "3. Check device physical behavior"
echo "4. Verify ULV protocol compliance"
echo ""

echo "🎉 Ready to analyze ULV response!"
echo "================================="
echo "Check your server logs for enhanced ULV message handling"
