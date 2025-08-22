const net = require('net');

// JT808 Location Query Message (0x8201)
function createLocationQueryMessage() {
    const terminalPhoneNumber = '628076842334'; // Your real device's terminal ID
    
    // Convert phone number to BCD format (6 bytes)
    const bcdPhone = Buffer.alloc(6);
    for (let i = 0; i < 6; i++) {
        bcdPhone[i] = parseInt(terminalPhoneNumber.substr(i * 2, 2), 16);
    }
    
    // Message structure for 0x8201 (Location Query)
    const messageId = Buffer.alloc(2);
    messageId.writeUInt16BE(0x8201, 0); // Location Query
    
    const properties = Buffer.alloc(2);
    properties.writeUInt16BE(0x0000, 0); // No body content
    
    const protocolVersion = Buffer.alloc(1);
    protocolVersion.writeUInt8(0x01, 0); // Protocol version 1
    
    const messageSerialNumber = Buffer.alloc(2);
    messageSerialNumber.writeUInt16BE(0x0001, 0); // Serial number
    
    // Build header (17 bytes)
    const header = Buffer.concat([
        messageId,           // 2 bytes: Message ID
        properties,          // 2 bytes: Properties (body length)
        protocolVersion,     // 1 byte: Protocol version
        bcdPhone,           // 6 bytes: Terminal phone number
        messageSerialNumber, // 2 bytes: Message serial number
        Buffer.alloc(4)     // 4 bytes: Reserved
    ]);
    
    // Calculate checksum (XOR from header start to body end)
    let checksum = 0;
    for (let i = 0; i < header.length; i++) {
        checksum ^= header[i];
    }
    
    // Add checksum
    const checksumBuffer = Buffer.alloc(1);
    checksumBuffer.writeUInt8(checksum, 0);
    
    // Build complete message
    const message = Buffer.concat([header, checksumBuffer]);
    
    // Escape special bytes and add markers
    return escapeAndWrapMessage(message);
}

function escapeAndWrapMessage(message) {
    let escaped = Buffer.alloc(0);
    
    for (let i = 0; i < message.length; i++) {
        if (message[i] === 0x7E) {
            escaped = Buffer.concat([escaped, Buffer.from([0x7D, 0x02])]);
        } else if (message[i] === 0x7D) {
            escaped = Buffer.concat([escaped, Buffer.from([0x7D, 0x01])]);
        } else {
            escaped = Buffer.concat([escaped, Buffer.from([message[i]])]);
        }
    }
    
    // Add start and end markers
    return Buffer.concat([Buffer.from([0x7E]), escaped, Buffer.from([0x7E])]);
}

// Connect to server and send location query
function queryLocation() {
    const client = new net.Socket();
    
    client.connect(8080, '127.0.0.1', () => {
        console.log('Connected to JT808 server');
        console.log('Sending location query message (0x8201)...');
        
        const locationQuery = createLocationQueryMessage();
        console.log('Location query message:', locationQuery.toString('hex'));
        
        client.write(locationQuery);
    });
    
    client.on('data', (data) => {
        console.log('Received response from server:');
        console.log('Raw data:', data.toString('hex'));
        
        // Try to parse the response
        try {
            // Look for JT808 message markers
            const startIndex = data.indexOf(0x7E);
            const endIndex = data.lastIndexOf(0x7E);
            
            if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
                const messageData = data.slice(startIndex + 1, endIndex);
                console.log('Extracted message data:', messageData.toString('hex'));
                
                // Check if it's a location report response
                if (messageData.length >= 2) {
                    const responseMessageId = messageData.readUInt16BE(0);
                    console.log('Response message ID: 0x' + responseMessageId.toString(16).toUpperCase());
                    
                    if (responseMessageId === 0x0200) {
                        console.log('✅ Received location report from device!');
                        console.log('Location data length:', messageData.length - 17, 'bytes');
                    } else if (responseMessageId === 0x8001) {
                        console.log('✅ Received general response from server');
                    } else {
                        console.log('⚠️ Unknown response message type');
                    }
                }
            } else {
                console.log('⚠️ No JT808 message markers found in response');
            }
        } catch (error) {
            console.log('Error parsing response:', error.message);
        }
        
        // Close connection after receiving response
        setTimeout(() => {
            client.end();
        }, 1000);
    });
    
    client.on('close', () => {
        console.log('Connection closed');
    });
    
    client.on('error', (err) => {
        console.error('Connection error:', err.message);
    });
    
    // Set timeout
    client.setTimeout(10000, () => {
        console.log('Connection timeout - no response received');
        client.end();
    });
}

// Run the location query
console.log('JT808 Location Query Client');
console.log('==========================');
console.log('Terminal ID: 628076842334');
console.log('Message Type: 0x8201 (Location Query)');
console.log('');

queryLocation();

