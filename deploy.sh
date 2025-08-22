#!/bin/bash

# JT808 Server Deployment Script for Vendor Debugging
# This script sets up the server for multimedia debugging

echo "🚀 Deploying JT808 Server for Vendor Debugging..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create logs directory
echo "📁 Creating logs directory..."
mkdir -p logs

# Set environment variables
export PORT=8080
export HOST=0.0.0.0
export HTTP_PORT=3000
export RTP_MONITORING_ENABLED=true
export LOG_LEVEL=info

echo "⚙️  Server Configuration:"
echo "   JT808 Server Port: $PORT"
echo "   HTTP API Port: $HTTP_PORT"
echo "   RTP Monitoring: Enabled"
echo "   Log Level: $LOG_LEVEL"

echo ""
echo "🔥 FIREWALL STATUS (Vultr):"
echo "   ✅ Port 8080 (JT808 Server) - ALREADY OPEN"
echo "   ✅ Port 3000 (HTTP API) - ALREADY OPEN"
echo "   ✅ No additional firewall rules needed!"
echo ""

# Start the server
echo "🎯 Starting JT808 Server..."
echo "📺 Raw video data will be monitored and logged to console for debugging"
echo "🌐 HTTP API available at: http://localhost:$HTTP_PORT"
echo "🔍 Debug endpoints:"
echo "   - /api/multimedia/debug"
echo "   - /api/multimedia/debug/vendor"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm start
