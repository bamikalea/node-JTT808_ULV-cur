const net = require('net');

// JT808 Terminal Authentication Message (0x0100)
function createTerminalAuthentication() {
    const terminalPhoneNumber = '628076842334';
    
    // Convert phone number to BCD format (6 bytes)
    const bcdPhone = Buffer.alloc(6);
    for (let i = 0; i < 6; i++) {
        bcdPhone[i] = parseInt(terminalPhoneNumber.substr(i * 2, 2), 16);
    }
    
    // Message structure for 0x0100 (Terminal Authentication)
    const messageId = Buffer.alloc(2);
    messageId.writeUInt16BE(0x0100, 0);
    
    const properties = Buffer.alloc(2);
    properties.writeUInt16BE(0x0000, 0); // Body length: 0 bytes for simple auth
    
    const protocolVersion = Buffer.alloc(1);
    protocolVersion.writeUInt8(0x01, 0);
    
    const messageSerialNumber = Buffer.alloc(2);
    messageSerialNumber.writeUInt16BE(0x0001, 0);
    
    const reserved = Buffer.alloc(4);
    reserved.writeUInt32BE(0, 0);
    
    // Build header (17 bytes)
    const header = Buffer.concat([
        messageId, bcdPhone, protocolVersion, 
        messageSerialNumber, reserved
    ]);
    
    // Calculate checksum
    let checksum = 0;
    for (let i = 0; i < header.length; i++) {
        checksum ^= header[i];
    }
    
    const checksumBuffer = Buffer.alloc(1);
    checksumBuffer.writeUInt8(checksum, 0);
    
    // Build complete message
    const message = Buffer.concat([header, checksumBuffer]);
    
    // Escape and wrap message
    return escapeAndWrapMessage(message);
}

// JT808 Multimedia Event Upload Message (0x0800)
function createMultimediaEventUpload() {
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
    messageSerialNumber.writeUInt16BE(0x0002, 0);
    
    const reserved = Buffer.alloc(4);
    reserved.writeUInt32BE(0, 0);
    
    // Message body according to Table 3.7.1
    const body = Buffer.alloc(8);
    body.writeUInt32BE(0x12345678, 0); // multimedia data ID (DWORD)
    body.writeUInt8(0x00, 4); // Multimedia Type: 0=Image
    body.writeUInt8(0x00, 5); // multimedia format: 0=JPEG
    body.writeUInt8(0x01, 6); // event coding: 1=Timing action
    body.writeUInt8(0x01, 7); // channel ID: 1
    
    // Build header (17 bytes)
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

function testAuthenticatedMultimedia() {
    const client = new net.Socket();
    
    client.connect(8080, '127.0.0.1', () => {
        console.log('Connected to JT808 server on port 8080');
        
        // Step 1: Send Terminal Authentication (0x0100)
        console.log('\n=== Step 1: Terminal Authentication (0x0100) ===');
        const authMessage = createTerminalAuthentication();
        console.log(`Sending authentication (${authMessage.length} bytes):`);
        console.log(`Raw: ${authMessage.toString('hex')}`);
        client.write(authMessage);
        
        // Wait for authentication response then send multimedia
        setTimeout(() => {
            console.log('\n=== Step 2: Multimedia Event Upload (0x0800) ===');
            const multimediaMessage = createMultimediaEventUpload();
            console.log(`Sending multimedia event (${multimediaMessage.length} bytes):`);
            console.log(`Raw: ${multimediaMessage.toString('hex')}`);
            client.write(multimediaMessage);
            
            // Wait for response then close
            setTimeout(() => {
                console.log('\n=== Test Complete ===');
                client.end();
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
testAuthenticatedMultimedia();
