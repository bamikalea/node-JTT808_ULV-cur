#!/bin/bash

# Monitor Uploads and Auto-Download
# Continuously monitors Vultr server for new files and downloads them

SERVER_IP="155.138.175.43"
LOCAL_PATH="./downloads/uploads"

echo "🔍 Starting upload monitor for Vultr JT808 server..."
echo "📍 Server: $SERVER_IP"
echo "📥 Local Path: $LOCAL_PATH"
echo "⏰ Monitoring every 30 seconds..."
echo "🔄 Press Ctrl+C to stop monitoring"
echo ""

# Create local directory
mkdir -p "$LOCAL_PATH"

# Function to download files
download_files() {
    echo "📥 Checking for new files..."
    scp -r root@$SERVER_IP:/root/node-JTT808_ULV-cur/media/uploads/* "$LOCAL_PATH/" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "✅ New files downloaded!"
        echo "📋 Current files in downloads:"
        ls -la "$LOCAL_PATH/"
    else
        echo "ℹ️  No new files found"
    fi
    echo ""
}

# Initial download
download_files

# Monitor loop
while true; do
    sleep 30
    download_files
done
