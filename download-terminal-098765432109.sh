#!/bin/bash

# Download Files for Terminal 098765432109
# Downloads all files from the specific terminal directory on Vultr server

TERMINAL_ID="098765432109"
SERVER_IP="155.138.175.43"
SERVER_PATH="/root/node-JTT808_ULV-cur/media/uploads/$TERMINAL_ID"
LOCAL_PATH="./downloads/uploads/$TERMINAL_ID"

echo "📥 Downloading files for Terminal $TERMINAL_ID from Vultr server..."
echo "📍 Server: $SERVER_IP"
echo "📁 Remote Path: $SERVER_PATH"
echo "📥 Local Path: $LOCAL_PATH"
echo ""

# Create local directory
mkdir -p "$LOCAL_PATH"

# Check if terminal directory exists on server
echo "🔍 Checking for terminal directory on server..."
if ssh root@$SERVER_IP "test -d $SERVER_PATH"; then
    echo "✅ Terminal directory found on server"
    
    # Check for files
    FILE_COUNT=$(ssh root@$SERVER_IP "find $SERVER_PATH -type f 2>/dev/null | wc -l")
    
    if [ "$FILE_COUNT" -gt 0 ]; then
        echo "📁 Found $FILE_COUNT files for terminal $TERMINAL_ID"
        echo ""
        echo "📥 Downloading files..."
        
        # Download all files from terminal directory
        scp -r root@$SERVER_IP:$SERVER_PATH/* "$LOCAL_PATH/" 2>/dev/null
        
        if [ $? -eq 0 ]; then
            echo "✅ Download completed successfully!"
            echo "📊 Files downloaded to: $LOCAL_PATH"
            echo ""
            echo "📋 Downloaded files:"
            ls -la "$LOCAL_PATH"
        else
            echo "❌ Download failed. Please check your connection and try again."
            exit 1
        fi
    else
        echo "ℹ️  No files found for terminal $TERMINAL_ID yet."
        echo "💡 Files will appear when:"
        echo "   - Photo capture commands are executed"
        echo "   - Multimedia upload messages (0x0801) are received"
        echo "   - Video streaming data is captured"
    fi
else
    echo "ℹ️  Terminal directory not found on server yet."
    echo "💡 This is normal if no files have been uploaded yet."
    echo "🔄 Run this script again after files are uploaded."
fi
