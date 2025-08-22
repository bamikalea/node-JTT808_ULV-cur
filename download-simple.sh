#!/bin/bash

# Simple Download Script using SCP
# Downloads all files from Vultr server uploads directory

echo "📥 Downloading files from Vultr server..."

# Create local directory
mkdir -p ./downloads/uploads

# Download all files from server
scp -r root@155.138.175.43:/root/node-JTT808_ULV-cur/media/uploads/* ./downloads/uploads/ 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Download completed!"
    echo "📁 Files saved to: ./downloads/uploads/"
    echo ""
    echo "📋 Downloaded files:"
    ls -la ./downloads/uploads/
else
    echo "ℹ️  No files found or download failed."
    echo "💡 This is normal if no files have been uploaded yet."
fi
