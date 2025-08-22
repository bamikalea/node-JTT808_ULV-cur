#!/bin/bash

# Test script for all terminal control commands (0x8105)
# This script tests all available ULV protocol terminal control commands

TERMINAL_ID="628076842334"
BASE_URL="http://localhost:3000"

echo "🧪 Testing all terminal control commands for terminal $TERMINAL_ID"
echo "================================================================"
echo ""

# Test disconnect oil
echo "1. Testing disconnect_oil (0x70)..."
RESPONSE=$(curl -s -X POST "$BASE_URL/api/terminal/control" \
  -H "Content-Type: application/json" \
  -d "{\"terminalId\": \"$TERMINAL_ID\", \"command\": \"disconnect_oil\"}")
echo "Response: $RESPONSE"
echo ""

# Wait a moment
sleep 2

# Test recovery oil
echo "2. Testing recovery_oil (0x71)..."
RESPONSE=$(curl -s -X POST "$BASE_URL/api/terminal/control" \
  -H "Content-Type: application/json" \
  -d "{\"terminalId\": \"$TERMINAL_ID\", \"command\": \"recovery_oil\"}")
echo "Response: $RESPONSE"
echo ""

# Wait a moment
sleep 2

# Test disconnect circuit
echo "3. Testing disconnect_circuit (0x72)..."
RESPONSE=$(curl -s -X POST "$BASE_URL/api/terminal/control" \
  -H "Content-Type: application/json" \
  -d "{\"terminalId\": \"$TERMINAL_ID\", \"command\": \"disconnect_circuit\"}")
echo "Response: $RESPONSE"
echo ""

# Wait a moment
sleep 2

# Test recovery circuit
echo "4. Testing recovery_circuit (0x73)..."
RESPONSE=$(curl -s -X POST "$BASE_URL/api/terminal/control" \
  -H "Content-Type: application/json" \
  -d "{\"terminalId\": \"$TERMINAL_ID\", \"command\": \"recovery_circuit\"}")
echo "Response: $RESPONSE"
echo ""

# Wait a moment
sleep 2

# Test restart device (use with caution!)
echo "5. Testing restart_device (0x74)..."
echo "⚠️  WARNING: This will restart the terminal device!"
read -p "Press Enter to continue or Ctrl+C to cancel..."
RESPONSE=$(curl -s -X POST "$BASE_URL/api/terminal/control" \
  -H "Content-Type: application/json" \
  -d "{\"terminalId\": \"$TERMINAL_ID\", \"command\": \"restart_device\"}")
echo "Response: $RESPONSE"
echo ""

echo "✅ All terminal control commands tested!"
echo ""
echo "📋 Next steps:"
echo "1. Monitor server logs: tail -f logs/combined.log"
echo "2. Check for 0x8105 messages in the logs"
echo "3. Look for terminal control responses from the device"
echo ""
echo "🔍 Monitor logs with:"
echo "tail -f logs/combined.log | grep -E \"(0x8105|Terminal Control|Command sent)\""

