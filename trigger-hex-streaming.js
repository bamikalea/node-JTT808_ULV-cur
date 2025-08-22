#!/usr/bin/env node

const net = require('net');

/**
 * Direct HEX Streaming Command Trigger
 * Sends raw 0x9101 streaming message to JT808 server
 */

// JT808 0x9101 Streaming Message (ULV Real-time audio/video preview request)
const streamingMessage = Buffer.from([
    0x7E,                    // Start marker
    0x91, 0x01,             // Message ID: 0x9101
    0x00, 0x01,             // Message body properties
    0x62, 0x80, 0x76, 0x84, 0x23, 0x34,  // Terminal ID: 628076842334
    0x00, 0x17,             // Message body length: 23 bytes
    0x01,                    // Channel number (1)
    0x00,                    // Stream type (0: Main stream)
    0x01,                    // Quality (1: Medium)
    0x19,                    // Frame rate (25 fps)
    0x00, 0x00, 0x00, 0x00, // Bitrate (0: Auto)
    0x01,                    // Audio enabled (1: Yes)
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // Reserved bytes
    0x7E                     // End marker
]);

console.log('🚀 JT808 Direct HEX Streaming Command Trigger');
console.log('=' .repeat(50));
console.log(`📤 Message ID: 0x9101 (ULV Streaming Request)`);
console.log(`📱 Terminal ID: 628076842334`);
console.log(`📊 Body Length: 23 bytes`);
console.log(`🔢 Total Length: ${streamingMessage.length} bytes`);
console.log(`🔍 HEX: ${streamingMessage.toString('hex').toUpperCase()}`);
console.log('');

// Create TCP connection to JT808 server
const client = new net.Socket();

client.connect(8080, '127.0.0.1', () => {
    console.log('🔌 Connected to JT808 server at 127.0.0.1:8080');
    console.log('📤 Sending streaming command...');
    
    // Send the streaming message
    client.write(streamingMessage);
    
    // Keep connection open briefly to receive response
    setTimeout(() => {
        console.log('🔌 Closing connection...');
        client.destroy();
    }, 2000);
});

client.on('data', (data) => {
    console.log(`📥 Received response:`);
    console.log(`   HEX: ${data.toString('hex').toUpperCase()}`);
    console.log(`   Length: ${data.length} bytes`);
    
    // Try to parse as JT808 message
    if (data.length >= 12) {
        const messageId = data.readUInt16BE(1);
        console.log(`   Message ID: 0x${messageId.toString(16).toUpperCase()}`);
        
        if (messageId === 0x8001) {
            console.log(`   Type: General Response`);
        } else if (messageId === 0x0001) {
            console.log(`   Type: Alternative General Response`);
        } else {
            console.log(`   Type: Unknown Response`);
        }
    }
});

client.on('error', (error) => {
    console.error(`❌ Connection error: ${error.message}`);
    process.exit(1);
});

client.on('close', () => {
    console.log('🔌 Connection closed');
    console.log('');
    console.log('✅ Streaming command sent successfully');
    console.log('📊 Check server logs for handshake response');
    console.log('   Command: tail -f logs/combined.log | grep -E "(0x9101|Response.*0x9101|ULV.*streaming)"');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, closing connection...');
    client.destroy();
    process.exit(0);
});

