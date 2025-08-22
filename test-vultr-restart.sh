#!/bin/bash

# Test Restart Command on Real Vultr Server
# This script tests the restart command on the actual device connection

VULTR_IP="45.76.223.123"
VULTR_PORT="8080"

echo "🔍 Testing Restart Command on Real Vultr Server..."
echo "================================================"
echo ""

echo "📡 Server Details:"
echo "=================="
echo "IP: $VULTR_IP"
echo "Port: $VULTR_PORT"
echo "Terminal: 628076842334 (Real connected device)"
echo ""

echo "🎯 Testing ULV Restart Command..."
echo "================================"

# Create the proper JT808 restart command
echo "📋 Creating JT808 Restart Command..."
echo "Message ID: 0x8105 (Terminal Control)"
echo "Command Word: 0x74 (ULV Restart Device)"
echo ""

# Test connection to Vultr server
echo "🔌 Testing connection to Vultr server..."
if nc -z -w5 $VULTR_IP $VULTR_PORT; then
    echo "✅ Connection to Vultr server successful"
    echo ""
    
    echo "📡 Sending restart command to real device..."
    echo "Command: 0x8105 with 0x74 command word"
    echo ""
    
    # Send the restart command using netcat
    echo "🚀 Sending command via netcat..."
    echo "7e8105000101628076842334000000000001747e" | xxd -r -p | nc $VULTR_IP $VULTR_PORT
    
    if [ $? -eq 0 ]; then
        echo "✅ Command sent successfully to Vultr server"
        echo ""
        echo "📊 Expected Response:"
        echo "   - Device should disconnect if restart works"
        echo "   - ULV 0x900 messages with restart acknowledgment"
        echo "   - Physical device restart"
        echo ""
        echo "🔍 Monitor Vultr server logs for response..."
    else
        echo "❌ Failed to send command to Vultr server"
    fi
else
    echo "❌ Cannot connect to Vultr server on port $VULTR_PORT"
    echo "   - Check if server is running"
    echo "   - Check firewall settings"
    echo "   - Check if device is still connected"
fi

echo ""
echo "💡 Next Steps:"
echo "=============="
echo "1. Check Vultr server logs for command reception"
echo "2. Monitor if device disconnects (restart indicator)"
echo "3. Look for ULV 0x900 responses with restart acknowledgment"
echo "4. Verify if device physically restarts"
echo ""
echo "🎯 This will test the restart command on the REAL device connection!"
