const net = require('net');

// Create ULV Streaming Request (0x9101) - Raw HEX construction
function createULVStreamingRequest() {
    const terminalPhoneNumber = '628076842334';
    
    // Convert phone number to BCD format (10 bytes for JT808-2019)
    const bcdPhone = Buffer.alloc(10);
    // Pad with zeros and convert
    const paddedPhone = terminalPhoneNumber.padStart(20, '0');
    for (let i = 0; i < 10; i++) {
        bcdPhone[i] = parseInt(paddedPhone.substr(i * 2, 2), 16);
    }
    
    // Message ID: 0x9101 (ULV Real-time audio/video preview request)
    const messageId = Buffer.alloc(2);
    messageId.writeUInt16BE(0x9101, 0);
    
    // Properties: Version ID (bit 14) = 1, Body length
    const bodyLength = 20; // Server IP(4) + TCP Port(2) + UDP Port(2) + Channel(1) + Data Type(1) + Stream Type(1) + Reserved(9)
    const properties = Buffer.alloc(2);
    properties.writeUInt16BE(0x4000 | bodyLength, 0); // Version ID = 1, Length = 20
    
    // Protocol Version: 1
    const protocolVersion = Buffer.alloc(1);
    protocolVersion.writeUInt8(1, 0);
    
    // Message Serial Number
    const serialNumber = Buffer.alloc(2);
    serialNumber.writeUInt16BE(Math.floor(Math.random() * 65536), 0);
    
    // Message Body (20 bytes)
    const body = Buffer.alloc(20);
    
    // Server IP Address (4 bytes) - 192.168.100.100
    body.writeUInt8(192, 0);
    body.writeUInt8(168, 1);
    body.writeUInt8(100, 2);
    body.writeUInt8(100, 3);
    
    // TCP Port (2 bytes) - 1935
    body.writeUInt16BE(1935, 4);
    
    // UDP Port (2 bytes) - 8000
    body.writeUInt16BE(8000, 6);
    
    // Logical Channel Number (1 byte) - Channel 1
    body.writeUInt8(1, 8);
    
    // Data Type (1 byte) - 0: Audio and video
    body.writeUInt8(0, 9);
    
    // Stream Type (1 byte) - 0: Main stream
    body.writeUInt8(0, 10);
    
    // Reserved (9 bytes) - All zeros
    for (let i = 11; i < 20; i++) {
        body.writeUInt8(0, i);
    }
    
    // Build header (17 bytes for JT808-2019)
    const header = Buffer.concat([
        messageId,           // 2 bytes: Message ID
        properties,          // 2 bytes: Properties
        protocolVersion,     // 1 byte: Protocol Version
        bcdPhone,           // 10 bytes: Terminal Phone Number
        serialNumber        // 2 bytes: Message Serial Number
    ]);
    
    // Calculate checksum
    let checksum = 0;
    for (let i = 0; i < header.length; i++) {
        checksum ^= header[i];
    }
    for (let i = 0; i < body.length; i++) {
        checksum ^= body[i];
    }
    
    const checksumBuffer = Buffer.alloc(1);
    checksumBuffer.writeUInt8(checksum, 0);
    
    // Build complete message
    const message = Buffer.concat([header, body, checksumBuffer]);
    
    // Escape and wrap message
    return escapeAndWrapMessage(message);
}

function escapeAndWrapMessage(message) {
    const escaped = [];
    
    for (let i = 0; i < message.length; i++) {
        if (message[i] === 0x7E) {
            escaped.push(0x7D, 0x02);
        } else if (message[i] === 0x7D) {
            escaped.push(0x7D, 0x01);
        } else {
            escaped.push(message[i]);
        }
    }
    
    return Buffer.concat([Buffer.from([0x7E]), Buffer.from(escaped), Buffer.from([0x7E])]);
}

// Generate and display the HEX command
const streamingCommand = createULVStreamingRequest();
console.log('🎥 ULV Streaming Command (0x9101) - RAW HEX:');
console.log('='.repeat(60));
console.log(streamingCommand.toString('hex').toUpperCase());
console.log('='.repeat(60));
console.log(`📊 Message Length: ${streamingCommand.length} bytes`);
console.log('📋 Message Breakdown:');
console.log('  - Start Marker: 7E');
console.log('  - Message ID: 9101 (ULV Streaming Request)');
console.log('  - Server IP: 192.168.100.100');
console.log('  - TCP Port: 1935 (RTMP)');
console.log('  - UDP Port: 8000 (RTP)');
console.log('  - Channel: 1');
console.log('  - Data Type: 0 (Audio+Video)');
console.log('  - Stream Type: 0 (Main Stream)');
console.log('  - End Marker: 7E');