const net = require('net');

// JT808 Multimedia Event Upload Message (0x0800)
function createMultimediaEventUpload() {
    const terminalPhoneNumber = '628076842334'; // Your real device's terminal ID
    
    // Convert phone number to BCD format (6 bytes)
    const bcdPhone = Buffer.alloc(6);
    for (let i = 0; i < 6; i++) {
        bcdPhone[i] = parseInt(terminalPhoneNumber.substr(i * 2, 2), 16);
    }
    
    // Message structure for 0x0800 (Multimedia Event Upload) - Table 3.7.1
    const messageId = Buffer.alloc(2);
    messageId.writeUInt16BE(0x0800, 0); // Multimedia Event Upload
    
    const properties = Buffer.alloc(2);
    properties.writeUInt16BE(0x0008, 0); // Body length: 8 bytes
    
    const protocolVersion = Buffer.alloc(1);
    protocolVersion.writeUInt8(0x01, 0); // Protocol version 1
    
    const messageSerialNumber = Buffer.alloc(2);
    messageSerialNumber.writeUInt16BE(0x0001, 0); // Serial number
    
    const reserved = Buffer.alloc(4);
    reserved.writeUInt32BE(0, 0); // Reserved field
    
    // Message body according to Table 3.7.1
    const body = Buffer.alloc(8);
    body.writeUInt32BE(0x12345678, 0); // multimedia data ID (DWORD)
    body.writeUInt8(0x00, 4); // Multimedia Type: 0=Image
    body.writeUInt8(0x00, 5); // multimedia format: 0=JPEG
    body.writeUInt8(0x01, 6); // event coding: 1=Timing action
    body.writeUInt8(0x01, 7); // channel ID: 1
    
    // Build header (17 bytes)
    const header = Buffer.concat([
        messageId,           // 2 bytes: Message ID
        properties,          // 2 bytes: Properties (body length)
        protocolVersion,     // 1 byte: Protocol Version
        bcdPhone,           // 6 bytes: Terminal Phone Number
        messageSerialNumber, // 2 bytes: Message Serial Number
        reserved            // 4 bytes: Reserved
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

// JT808 Multimedia Data Upload Message (0x0801)
function createMultimediaDataUpload() {
    const terminalPhoneNumber = '628076842334'; // Your real device's terminal ID
    
    // Convert phone number to BCD format (6 bytes)
    const bcdPhone = Buffer.alloc(6);
    for (let i = 0; i < 6; i++) {
        bcdPhone[i] = parseInt(terminalPhoneNumber.substr(i * 2, 2), 16);
    }
    
    // Message structure for 0x0801 (Multimedia Data Upload) - Table 3.8.1
    const messageId = Buffer.alloc(2);
    messageId.writeUInt16BE(0x0801, 0); // Multimedia Data Upload
    
    const properties = Buffer.alloc(2);
    properties.writeUInt16BE(0x0024, 0); // Body length: 36 bytes (8 + 28)
    
    const protocolVersion = Buffer.alloc(1);
    protocolVersion.writeUInt8(0x01, 0); // Protocol version 1
    
    const messageSerialNumber = Buffer.alloc(2);
    messageSerialNumber.writeUInt16BE(0x0002, 0); // Serial number
    
    const reserved = Buffer.alloc(4);
    reserved.writeUInt32BE(0, 0); // Reserved field
    
    // Message body according to Table 3.8.1
    const body = Buffer.alloc(36);
    
    // Header (8 bytes) - same as 0x0800
    body.writeUInt32BE(0x87654321, 0); // multimedia data ID (DWORD)
    body.writeUInt8(0x01, 4); // Multimedia Type: 1=Audio
    body.writeUInt8(0x00, 5); // multimedia format: 0=JPEG (reserved for audio)
    body.writeUInt8(0x00, 6); // event coding: 0=Platform instruction
    body.writeUInt8(0x02, 7); // channel ID: 2
    
    // Location information (28 bytes) - structured as 0x0200 message body
    // Basic location data without additional information
    let offset = 8;
    
    // Alarm flags (DWORD)
    body.writeUInt32BE(0x00000000, offset); offset += 4; // No alarms
    
    // Status bits (DWORD)
    body.writeUInt32BE(0x00000001, offset); offset += 4; // ACC=ON, Located=YES
    
    // Latitude (DWORD) - Lagos coordinates * 10^6
    body.writeUInt32BE(0x0651F990, offset); offset += 4; // 6.627225 * 10^6
    
    // Longitude (DWORD) - Lagos coordinates * 10^6
    body.writeUInt32BE(0x031EDC84, offset); offset += 4; // 3.272136 * 10^6
    
    // Altitude (WORD)
    body.writeUInt16BE(0x002A, offset); offset += 2; // 42 meters
    
    // Speed (WORD) - 0.1 km/h units
    body.writeUInt16BE(0x0000, offset); offset += 2; // 0 km/h
    
    // Direction (WORD)
    body.writeUInt16BE(0x0000, offset); offset += 2; // 0 degrees (North)
    
    // Time (BCD[6]) - YY-MM-DD-hh-mm-ss
    body.writeUInt8(0x25, offset); offset += 1; // 2025
    body.writeUInt8(0x08, offset); offset += 1; // 08 (August)
    body.writeUInt8(0x14, offset); offset += 1; // 14
    body.writeUInt8(0x22, offset); offset += 1; // 22:49
    body.writeUInt8(0x49, offset); offset += 1; // 49
    body.writeUInt8(0x04, offset); offset += 1; // 04
    
    // Build header (17 bytes)
    const header = Buffer.concat([
        messageId,           // 2 bytes: Message ID
        properties,          // 2 bytes: Properties (body length)
        protocolVersion,     // 1 byte: Protocol Version
        bcdPhone,           // 6 bytes: Terminal Phone Number
        messageSerialNumber, // 2 bytes: Message Serial Number
        reserved            // 4 bytes: Reserved
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

// JT808 Multimedia Platform Response Message (0x8800)
function createMultimediaPlatformResponse() {
    const terminalPhoneNumber = '628076842334'; // Your real device's terminal ID
    
    // Convert phone number to BCD format (6 bytes)
    const bcdPhone = Buffer.alloc(6);
    for (let i = 0; i < 6; i++) {
        bcdPhone[i] = parseInt(terminalPhoneNumber.substr(i * 2, 2), 16);
    }
    
    // Message structure for 0x8800 (Multimedia Platform Response) - Table 3.8.2
    const messageId = Buffer.alloc(2);
    messageId.writeUInt16BE(0x8800, 0); // Multimedia Platform Response
    
    const properties = Buffer.alloc(2);
    properties.writeUInt16BE(0x0006, 0); // Body length: 6 bytes (4 + 1 + 1)
    
    const protocolVersion = Buffer.alloc(1);
    protocolVersion.writeUInt8(0x01, 0); // Protocol version 1
    
    const messageSerialNumber = Buffer.alloc(2);
    messageSerialNumber.writeUInt16BE(0x0003, 0); // Serial number
    
    const reserved = Buffer.alloc(4);
    reserved.writeUInt32BE(0, 0); // Reserved field
    
    // Message body according to Table 3.8.2
    const body = Buffer.alloc(7); // Increased to 7 bytes to accommodate 16-bit packet ID
    body.writeUInt32BE(0x12345678, 0); // multimedia data ID (DWORD)
    body.writeUInt8(0x01, 4); // Total number of retransmitted packets: 1
    body.writeUInt16BE(0x0001, 5); // List of retransmission packet IDs: packet ID 1
    
    // Update properties to reflect correct body length
    properties.writeUInt16BE(0x0007, 0); // Body length: 7 bytes (4 + 1 + 2)
    
    // Build header (17 bytes)
    const header = Buffer.concat([
        messageId,           // 2 bytes: Message ID
        properties,          // 2 bytes: Properties (body length)
        protocolVersion,     // 1 byte: Protocol Version
        bcdPhone,           // 6 bytes: Terminal Phone Number
        messageSerialNumber, // 2 bytes: Message Serial Number
        reserved            // 4 bytes: Reserved
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
    // Escape special characters according to JT808 protocol 2.2.1
    const escaped = [];
    
    for (let i = 0; i < message.length; i++) {
        if (message[i] === 0x7E) {
            escaped.push(0x7D, 0x02); // 0x7E becomes 0x7D 0x02
        } else if (message[i] === 0x7D) {
            escaped.push(0x7D, 0x01); // 0x7D becomes 0x7D 0x01
        } else {
            escaped.push(message[i]);
        }
    }
    
    // Add start/end markers
    return Buffer.concat([Buffer.from([0x7E]), Buffer.from(escaped), Buffer.from([0x7E])]);
}

function testMultimediaProtocol() {
    const client = new net.Socket();
    
    client.connect(8080, '127.0.0.1', () => {
        console.log('Connected to JT808 server');
        
        // Test 1: Multimedia Event Upload (0x0800)
        console.log('\n=== Testing Multimedia Event Upload (0x0800) ===');
        const eventUpload = createMultimediaEventUpload();
        console.log(`Sending 0x0800 message (${eventUpload.length} bytes):`);
        console.log(`Raw: ${eventUpload.toString('hex')}`);
        client.write(eventUpload);
        
        // Wait 2 seconds then test next message
        setTimeout(() => {
            // Test 2: Multimedia Data Upload (0x0801)
            console.log('\n=== Testing Multimedia Data Upload (0x0801) ===');
            const dataUpload = createMultimediaDataUpload();
            console.log(`Sending 0x0801 message (${dataUpload.length} bytes):`);
            console.log(`Raw: ${dataUpload.toString('hex')}`);
            client.write(dataUpload);
            
            // Wait 2 seconds then test next message
            setTimeout(() => {
                // Test 3: Multimedia Platform Response (0x8800)
                console.log('\n=== Testing Multimedia Platform Response (0x8800) ===');
                const platformResponse = createMultimediaPlatformResponse();
                console.log(`Sending 0x8800 message (${platformResponse.length} bytes):`);
                console.log(`Raw: ${platformResponse.toString('hex')}`);
                client.write(platformResponse);
                
                // Wait 2 seconds then close connection
                setTimeout(() => {
                    console.log('\n=== Test Complete ===');
                    client.end();
                }, 2000);
            }, 2000);
        }, 2000);
    });
    
    client.on('data', (data) => {
        console.log(`Received response: ${data.toString('hex')}`);
    });
    
    client.on('close', () => {
        console.log('Connection closed');
    });
    
    client.on('error', (err) => {
        console.error('Connection error:', err.message);
    });
}

// Run the test
testMultimediaProtocol();
