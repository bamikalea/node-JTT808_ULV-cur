const net = require('net');

// Simple multimedia event upload test
function createSimpleMultimediaEvent() {
    const terminalPhoneNumber = '628076842334';
    
    // Convert phone number to BCD format (6 bytes)
    const bcdPhone = Buffer.alloc(6);
    for (let i = 0; i < 6; i++) {
        bcdPhone[i] = parseInt(terminalPhoneNumber.substr(i * 2, 2), 16);
    }
    
    // Message structure for 0x0800 (Multimedia Event Upload)
    const messageId = Buffer.alloc(2);
    messageId.writeUInt16BE(0x0800, 0);
    
    const properties = Buffer.alloc(2);
    properties.writeUInt16BE(0x0008, 0); // Body length: 8 bytes
    
    const protocolVersion = Buffer.alloc(1);
    protocolVersion.writeUInt8(0x01, 0);
    
    const messageSerialNumber = Buffer.alloc(2);
    messageSerialNumber.writeUInt16BE(0x0001, 0);
    
    const reserved = Buffer.alloc(4);
    reserved.writeUInt32BE(0, 0);
    
    // Message body
    const body = Buffer.alloc(8);
    body.writeUInt32BE(0x12345678, 0); // multimedia data ID
    body.writeUInt8(0x00, 4); // Type: Image
    body.writeUInt8(0x00, 5); // Format: JPEG
    body.writeUInt8(0x01, 6); // Event: Timing action
    body.writeUInt8(0x01, 7); // Channel: 1
    
    // Build header
    const header = Buffer.concat([
        messageId, bcdPhone, protocolVersion, 
        messageSerialNumber, reserved
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

function testMultimediaQuery() {
    const client = new net.Socket();
    
    client.connect(8080, '127.0.0.1', () => {
        console.log('Connected to JT808 server on port 8080');
        console.log('Testing multimedia event upload...');
        
        const multimediaEvent = createSimpleMultimediaEvent();
        console.log(`Sending multimedia event (${multimediaEvent.length} bytes):`);
        console.log(`Raw: ${multimediaEvent.toString('hex')}`);
        
        client.write(multimediaEvent);
        
        // Wait for response then close
        setTimeout(() => {
            console.log('Test complete, closing connection...');
            client.end();
        }, 3000);
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
testMultimediaQuery();
