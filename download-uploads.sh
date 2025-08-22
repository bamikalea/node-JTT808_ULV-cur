#!/bin/bash

# Download Uploaded Files from Vultr JT808 Server
# This script downloads all files from the server's media/uploads directory

SERVER_IP="155.138.175.43"
SERVER_USER="root"
SERVER_PATH="/root/node-JTT808_ULV-cur/media/uploads"
LOCAL_PATH="./downloads/uploads"

echo "🚀 Starting download of uploaded files from Vultr server..."
echo "📍 Server: $SERVER_IP"
echo "📁 Remote Path: $SERVER_PATH"
echo "📥 Local Path: $LOCAL_PATH"
echo ""

# Create local directory if it doesn't exist
mkdir -p "$LOCAL_PATH"

# Check if there are any files on the server
echo "🔍 Checking for files on server..."
FILES_ON_SERVER=$(ssh $SERVER_USER@$SERVER_IP "find $SERVER_PATH -type f 2>/dev/null | wc -l")

if [ "$FILES_ON_SERVER" -eq 0 ]; then
    echo "ℹ️  No files found on server yet."
    echo "💡 Files will appear here when:"
    echo "   - Photo capture commands are executed"
    echo "   - Multimedia upload messages (0x0801) are received"
    echo "   - Video streaming data is captured"
    echo ""
    echo "🔄 Run this script again after files are uploaded."
    exit 0
fi

echo "📁 Found $FILES_ON_SERVER files on server"
echo ""

# Download all files recursively
echo "📥 Downloading files..."
rsync -avz --progress $SERVER_USER@$SERVER_IP:$SERVER_PATH/ "$LOCAL_PATH/"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Download completed successfully!"
    echo "📊 Files downloaded to: $LOCAL_PATH"
    echo ""
    echo "📋 Downloaded files:"
    find "$LOCAL_PATH" -type f -exec ls -lh {} \;
else
    echo ""
    echo "❌ Download failed. Please check your connection and try again."
    exit 1
fi
