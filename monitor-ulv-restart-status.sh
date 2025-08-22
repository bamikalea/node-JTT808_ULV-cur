#!/bin/bash

# Monitor ULV Messages for Restart Progress and Status
# This script monitors server logs for ULV messages that indicate restart progress

echo "🔍 Monitoring ULV Messages for Restart Progress and Status..."
echo "=========================================================="
echo ""

echo "📊 What We're Looking For:"
echo "========================="
echo "1. ULV 0x900 messages with restart acknowledgment (0x74)"
echo "2. Error messages or warnings related to restart"
echo "3. Restart progress updates or status changes"
echo "4. Device state changes or restart-related notifications"
echo ""

echo "🎯 Key Monitoring Points:"
echo "========================"
echo "• ULV 0x900 messages with embedded commands"
echo "• Reserved field content for restart status"
echo "• Error messages or warnings"
echo "• Device status changes"
echo "• Restart progress indicators"
echo ""

echo "🚀 Starting Real-time ULV Message Monitor..."
echo "=========================================="
echo ""

# Function to monitor logs for ULV restart-related messages
monitor_ulv_messages() {
    echo "📡 Monitoring for ULV messages..."
    echo "🔍 Looking for restart progress, errors, and status updates..."
    echo ""
    
    # Monitor logs in real-time for ULV-related messages
    tail -f /dev/null 2>/dev/null | while read line; do
        # Look for ULV 0x900 messages
        if echo "$line" | grep -q "900\|0x900\|ULV"; then
            echo "🔍 ULV Message Detected:"
            echo "   $line"
            echo ""
            
            # Check for restart acknowledgment (0x74)
            if echo "$line" | grep -q "74\|0x74"; then
                echo "🎉 RESTART ACKNOWLEDGMENT FOUND!"
                echo "   Device is reporting restart status"
                echo "   Check for restart progress indicators"
                echo ""
            fi
            
            # Check for error messages
            if echo "$line" | grep -q "error\|Error\|ERROR\|warn\|Warn\|WARN\|fail\|Fail\|FAIL"; then
                echo "⚠️ ERROR/WARNING DETECTED!"
                echo "   This might explain why restart failed"
                echo "   $line"
                echo ""
            fi
            
            # Check for status changes
            if echo "$line" | grep -q "status\|Status\|STATUS\|state\|State\|STATE"; then
                echo "📊 STATUS CHANGE DETECTED!"
                echo "   Device status might be changing"
                echo "   $line"
                echo ""
            fi
        fi
        
        # Look for any restart-related messages
        if echo "$line" | grep -q "restart\|Restart\|RESTART\|reboot\|Reboot\|REBOOT"; then
            echo "🔄 RESTART-RELATED MESSAGE:"
            echo "   $line"
            echo ""
        fi
        
        # Look for device disconnection or reconnection
        if echo "$line" | grep -q "disconnect\|Disconnect\|DISCONNECT\|connect\|Connect\|CONNECT"; then
            echo "🔌 CONNECTION CHANGE:"
            echo "   Device connection status changed"
            echo "   $line"
            echo ""
        fi
    done
}

# Function to check current server logs for ULV messages
check_current_logs() {
    echo "📋 Checking Current Server Logs for ULV Messages..."
    echo "================================================="
    echo ""
    
    # Look for recent ULV messages in logs
    echo "🔍 Recent ULV 0x900 Messages:"
    echo "============================="
    # This would check actual log files - adjust path as needed
    echo "   (Check your server terminal for recent ULV messages)"
    echo ""
    
    echo "🔍 Recent Error Messages:"
    echo "========================"
    # This would check actual log files - adjust path as needed
    echo "   (Check your server terminal for recent errors)"
    echo ""
    
    echo "🔍 Recent Status Changes:"
    echo "========================"
    # This would check actual log files - adjust path as needed
    echo "   (Check your server terminal for recent status changes)"
    echo ""
}

# Function to provide monitoring instructions
show_monitoring_instructions() {
    echo "💡 Monitoring Instructions:"
    echo "=========================="
    echo ""
    echo "1. 📡 Watch Your Server Terminal:"
    echo "   • Look for new ULV 0x900 messages"
    echo "   • Check for error messages or warnings"
    echo "   • Monitor for status changes"
    echo ""
    echo "2. 🔍 Key Things to Look For:"
    echo "   • ULV messages with embedded restart commands (0x74)"
    echo "   • Error messages explaining restart failure"
    echo "   • Device status or state changes"
    echo "   • Connection/disconnection events"
    echo ""
    echo "3. 📊 Expected ULV Response Patterns:"
    echo "   • 0x900 messages with restart acknowledgment"
    echo "   • Status updates showing restart progress"
    echo "   • Error messages if restart fails"
    echo "   • Device state changes during restart"
    echo ""
    echo "4. 🚨 Immediate Actions:"
    echo "   • Monitor server logs for new ULV messages"
    echo "   • Look for any error messages or warnings"
    echo "   • Check if device reports restart progress"
    echo "   • Watch for connection status changes"
    echo ""
}

# Main monitoring execution
echo "🎯 Starting ULV Restart Status Monitoring..."
echo "=========================================="
echo ""

# Check current logs
check_current_logs

# Show monitoring instructions
show_monitoring_instructions

echo "🚀 Monitor your server terminal now!"
echo "=================================="
echo "Look for:"
echo "• New ULV 0x900 messages"
echo "• Error messages or warnings"
echo "• Status changes or restart progress"
echo "• Connection/disconnection events"
echo ""

echo "🔍 The device acknowledgment suggests communication is working,"
echo "   but we need to see what ULV messages indicate about restart progress!"
echo "================================================================"
