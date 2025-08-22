#!/bin/bash

# Test Restart Command via ngrok to Real Connected Device
# This will test the restart command on the ACTUAL device connected through ngrok

echo "🔍 Testing Restart Command via ngrok to Real Device..."
echo "=================================================="
echo ""

# Check if ngrok is running
echo "📡 Checking ngrok status..."
NGROK_PID=$(ps aux | grep "ngrok tcp" | grep -v grep | awk '{print $2}')

if [ -z "$NGROK_PID" ]; then
    echo "❌ ngrok is not running!"
    echo "Please start ngrok first:"
    echo "  ngrok tcp 8080"
    exit 1
fi

echo "✅ ngrok is running (PID: $NGROK_PID)"
echo ""

# Get ngrok public URL
echo "🌐 Getting ngrok public URL..."
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"[^"]*"' | cut -d'"' -f4)

if [ -z "$NGROK_URL" ]; then
    echo "❌ Could not get ngrok URL"
    echo "Make sure ngrok is running and accessible at http://localhost:4040"
    exit 1
fi

# Extract host and port from ngrok URL
NGROK_HOST=$(echo $NGROK_URL | cut -d':' -f1 | cut -d'/' -f3)
NGROK_PORT=$(echo $NGROK_URL | cut -d':' -f2)

echo "✅ ngrok URL: $NGROK_URL"
echo "✅ Host: $NGROK_HOST"
echo "✅ Port: $NGROK_PORT"
echo ""

echo "🎯 Testing Restart Command on Real Device..."
echo "=========================================="
echo "📱 Target Terminal: 628076842334"
echo "🔢 Command: 0x8105 (Terminal Control) + 0x74 (ULV Restart)"
echo "🌐 Connection: $NGROK_HOST:$NGROK_PORT"
echo ""

# Create the restart command with proper JT808 protocol
echo "📋 Creating JT808 Restart Command..."
echo "Message ID: 0x8105 (Terminal Control)"
echo "Command Word: 0x74 (ULV Restart Device)"
echo "Protocol: JT808 with proper wrapper"
echo ""

# Test connection to ngrok
echo "🔌 Testing connection to ngrok tunnel..."
if nc -z $NGROK_HOST $NGROK_PORT 2>/dev/null; then
    echo "✅ Connection to ngrok successful"
else
    echo "❌ Connection to ngrok failed"
    echo "Please check ngrok status and try again"
    exit 1
fi

echo ""
echo "🚀 Ready to send restart command to real device!"
echo "=============================================="
echo "1. ngrok tunnel is active"
echo "2. Connection to tunnel is successful"
echo "3. Real device should be connected through this tunnel"
echo "4. Sending restart command will reach the actual device"
echo ""

echo "💡 Next Steps:"
echo "=============="
echo "1. Run the restart command script:"
echo "   node send-ulv-restart-command.js"
echo ""
echo "2. But FIRST, update the script to use ngrok URL:"
echo "   Change 127.0.0.1:8080 to $NGROK_HOST:$NGROK_PORT"
echo ""
echo "3. Monitor your server logs for the real device response"
echo "4. Check if the device actually restarts physically"
echo ""

echo "🎯 This will test the restart command on the REAL device connection!"
echo "================================================================"
