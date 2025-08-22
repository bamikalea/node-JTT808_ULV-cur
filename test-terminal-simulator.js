const net = require('net');

// Simple JT808 Terminal Simulator
class JT808TerminalSimulator {
    constructor(phoneNumber = '628076842334') {
        this.phoneNumber = phoneNumber;
        this.client = new net.Socket();
        this.isConnected = false;
        this.isAuthenticated = false;
        this.messageCount = 0;
    }

    connect() {
        console.log(`🔌 Connecting to JT808 server...`);
        
        this.client.connect(8080, '127.0.0.1', () => {
            console.log(`✅ Connected to JT808 server`);
            this.isConnected = true;
            
            // Send authentication message
            setTimeout(() => {
                this.sendAuthentication();
            }, 1000);
        });

        this.client.on('data', (data) => {
            this.handleServerMessage(data);
        });

        this.client.on('close', () => {
            console.log(`❌ Connection closed`);
            this.isConnected = false;
            this.isAuthenticated = false;
        });

        this.client.on('error', (err) => {
            console.error(`❌ Connection error: ${err.message}`);
        });
    }

    sendAuthentication() {
        console.log(`🔐 Sending authentication...`);
        
        // Create authentication message (0x0100)
        const messageId = Buffer.alloc(2);
        messageId.writeUInt16BE(0x0100, 0);

        const properties = Buffer.alloc(2);
        properties.writeUInt16BE(76, 0); // Body length

        const protocolVersion = Buffer.alloc(1);
        protocolVersion.writeUInt8(0x01, 0);

        // Convert phone number to BCD format
        const bcdPhone = Buffer.alloc(6);
        for (let i = 0; i < 6; i++) {
            bcdPhone[i] = parseInt(this.phoneNumber.substr(i * 2, 2), 16);
        }

        const messageSerialNumber = Buffer.alloc(2);
        messageSerialNumber.writeUInt16BE(++this.messageCount, 0);

        // Registration body (76 bytes)
        const registrationBody = Buffer.concat([
            Buffer.from([0x01, 0x01]), // Province ID (2 bytes)
            Buffer.from([0x01, 0x01]), // County ID (2 bytes)
            Buffer.from('MFGID123456789012345678901234567890', 'ascii').slice(0, 11), // Manufacturer ID (11 bytes)
            Buffer.from('TERMINALMODEL123456789012345678901234567890', 'ascii').slice(0, 30), // Terminal Model (30 bytes)
            Buffer.concat([Buffer.from(this.phoneNumber, 'ascii'), Buffer.alloc(30 - this.phoneNumber.length, 0)]), // Terminal ID (30 bytes)
            Buffer.from([0x01]) // License Plate Color (1 byte)
        ]);

        const header = Buffer.concat([
            messageId,
            properties,
            protocolVersion,
            bcdPhone,
            messageSerialNumber
        ]);

        const dataWithoutChecksum = Buffer.concat([header, registrationBody]);
        const checksum = this.calculateChecksum(dataWithoutChecksum);

        const completeMessage = Buffer.concat([
            Buffer.from([0x7E]), // Start marker
            dataWithoutChecksum,
            Buffer.from([checksum]),
            Buffer.from([0x7E])  // End marker
        ]);

        this.client.write(completeMessage);
        console.log(`📤 Authentication message sent`);
    }

    handleServerMessage(data) {
        console.log(`📥 Received server message: ${data.toString('hex')}`);
        
        // Check if this is an authentication challenge (0x8100)
        if (data.includes(0x81) && data.includes(0x00)) {
            console.log(`🔑 Authentication challenge received, sending response...`);
            this.sendAuthenticationResponse();
        }
        
        // Check if this is a multimedia request (0x8800)
        if (data.includes(0x88) && data.includes(0x00)) {
            console.log(`📸 Multimedia request received from platform!`);
            this.handleMultimediaRequest(data);
        }
    }

    sendAuthenticationResponse() {
        console.log(`🔐 Sending authentication response...`);
        
        // Create authentication response (0x0102)
        const messageId = Buffer.alloc(2);
        messageId.writeUInt16BE(0x0102, 0);

        const properties = Buffer.alloc(2);
        properties.writeUInt16BE(0, 0); // No body

        const protocolVersion = Buffer.alloc(1);
        protocolVersion.writeUInt8(0x01, 0);

        // Convert phone number to BCD format
        const bcdPhone = Buffer.alloc(6);
        for (let i = 0; i < 6; i++) {
            bcdPhone[i] = parseInt(this.phoneNumber.substr(i * 2, 2), 16);
        }

        const messageSerialNumber = Buffer.alloc(2);
        messageSerialNumber.writeUInt16BE(++this.messageCount, 0);

        const header = Buffer.concat([
            messageId,
            properties,
            protocolVersion,
            bcdPhone,
            messageSerialNumber
        ]);

        const checksum = this.calculateChecksum(header);

        const completeMessage = Buffer.concat([
            Buffer.from([0x7E]), // Start marker
            header,
            Buffer.from([checksum]),
            Buffer.from([0x7E])  // End marker
        ]);

        this.client.write(completeMessage);
        console.log(`📤 Authentication response sent`);
        this.isAuthenticated = true;
    }

    handleMultimediaRequest(data) {
        console.log(`📸 Processing multimedia request from platform...`);
        
        // Simulate capturing and uploading media
        setTimeout(() => {
            this.sendMultimediaEventUpload();
        }, 2000);
    }

    sendMultimediaEventUpload() {
        console.log(`📤 Sending multimedia event upload...`);
        
        // Create multimedia event upload (0x0800)
        const messageId = Buffer.alloc(2);
        messageId.writeUInt16BE(0x0800, 0);

        const properties = Buffer.alloc(2);
        properties.writeUInt16BE(8, 0); // Body length

        const protocolVersion = Buffer.alloc(1);
        protocolVersion.writeUInt8(0x01, 0);

        // Convert phone number to BCD format
        const bcdPhone = Buffer.alloc(6);
        for (let i = 0; i < 6; i++) {
            bcdPhone[i] = parseInt(this.phoneNumber.substr(i * 2, 2), 16);
        }

        const messageSerialNumber = Buffer.alloc(2);
        messageSerialNumber.writeUInt16BE(++this.messageCount, 0);

        // Multimedia event body
        const multimediaDataId = Buffer.alloc(4);
        multimediaDataId.writeUInt32BE(Date.now(), 0);

        const multimediaType = Buffer.alloc(1);
        multimediaType.writeUInt8(0, 0); // Image

        const multimediaFormat = Buffer.alloc(1);
        multimediaFormat.writeUInt8(0, 0); // JPEG

        const eventCode = Buffer.alloc(1);
        eventCode.writeUInt8(0, 0); // Platform instruction

        const channelId = Buffer.alloc(1);
        channelId.writeUInt8(1, 0); // Channel 1

        const body = Buffer.concat([
            multimediaDataId,
            multimediaType,
            multimediaFormat,
            eventCode,
            channelId
        ]);

        const header = Buffer.concat([
            messageId,
            properties,
            protocolVersion,
            bcdPhone,
            messageSerialNumber
        ]);

        const dataWithoutChecksum = Buffer.concat([header, body]);
        const checksum = this.calculateChecksum(dataWithoutChecksum);

        const completeMessage = Buffer.concat([
            Buffer.from([0x7E]), // Start marker
            dataWithoutChecksum,
            Buffer.from([checksum]),
            Buffer.from([0x7E])  // End marker
        ]);

        this.client.write(completeMessage);
        console.log(`📤 Multimedia event upload sent`);
        
        // Simulate sending the actual media data
        setTimeout(() => {
            this.sendMultimediaDataUpload();
        }, 1000);
    }

    sendMultimediaDataUpload() {
        console.log(`📤 Sending multimedia data upload...`);
        
        // Create multimedia data upload (0x0801)
        const messageId = Buffer.alloc(2);
        messageId.writeUInt16BE(0x0801, 0);

        const properties = Buffer.alloc(2);
        properties.writeUInt16BE(108, 0); // Body length

        const protocolVersion = Buffer.alloc(1);
        protocolVersion.writeUInt8(0x01, 0);

        // Convert phone number to BCD format
        const bcdPhone = Buffer.alloc(6);
        for (let i = 0; i < 6; i++) {
            bcdPhone[i] = parseInt(this.phoneNumber.substr(i * 2, 2), 16);
        }

        const messageSerialNumber = Buffer.alloc(2);
        messageSerialNumber.writeUInt16BE(++this.messageCount, 0);

        // Multimedia data body (108 bytes)
        const multimediaDataId = Buffer.alloc(4);
        multimediaDataId.writeUInt32BE(Date.now(), 0);

        const multimediaType = Buffer.alloc(1);
        multimediaType.writeUInt8(0, 0); // Image

        const multimediaFormat = Buffer.alloc(1);
        multimediaFormat.writeUInt8(0, 0); // JPEG

        const eventCode = Buffer.alloc(1);
        eventCode.writeUInt8(0, 0); // Platform instruction

        const channelId = Buffer.alloc(1);
        channelId.writeUInt8(1, 0); // Channel 1

        // Mock location data (28 bytes)
        const locationData = Buffer.alloc(28);
        locationData.writeUInt32BE(Math.floor(Date.now() / 1000), 0); // Timestamp
        locationData.writeUInt32BE(0, 4); // Latitude
        locationData.writeUInt32BE(0, 8); // Longitude
        locationData.writeUInt16BE(0, 12); // Altitude
        locationData.writeUInt16BE(0, 14); // Speed
        locationData.writeUInt16BE(0, 16); // Direction
        locationData.writeUInt16BE(0, 18); // Status
        locationData.writeUInt8(0, 20); // Alarm
        locationData.writeUInt8(0, 21); // Reserved
        locationData.writeUInt8(0, 22); // Reserved
        locationData.writeUInt8(0, 23); // Reserved
        locationData.writeUInt8(0, 24); // Reserved
        locationData.writeUInt8(0, 25); // Reserved
        locationData.writeUInt8(0, 26); // Reserved
        locationData.writeUInt8(0, 27); // Reserved

        // Mock image data (JPEG header + some data)
        const imageData = Buffer.from([
            0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
            0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
            0x00, 0xFF, 0xC0, 0x00, 0x0B, 0x08, 0x00, 0x01, 0x00, 0x01, 0x01, 0x11,
            0x00, 0xFF, 0xC4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0xFF,
            0xDA, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3F, 0x00, 0x37, 0xFF, 0xD9
        ]);

        const body = Buffer.concat([
            multimediaDataId,
            multimediaType,
            multimediaFormat,
            eventCode,
            channelId,
            locationData,
            imageData
        ]);

        const header = Buffer.concat([
            messageId,
            properties,
            protocolVersion,
            bcdPhone,
            messageSerialNumber
        ]);

        const dataWithoutChecksum = Buffer.concat([header, body]);
        const checksum = this.calculateChecksum(dataWithoutChecksum);

        const completeMessage = Buffer.concat([
            Buffer.from([0x7E]), // Start marker
            dataWithoutChecksum,
            Buffer.from([checksum]),
            Buffer.from([0x7E])  // End marker
        ]);

        this.client.write(completeMessage);
        console.log(`📤 Multimedia data upload sent`);
    }

    calculateChecksum(data) {
        let checksum = 0;
        for (let i = 0; i < data.length; i++) {
            checksum ^= data[i];
        }
        return checksum;
    }

    disconnect() {
        if (this.isConnected) {
            this.client.destroy();
            console.log(`🔌 Disconnected from server`);
        }
    }
}

// Run the simulator
if (require.main === module) {
    const terminal = new JT808TerminalSimulator();
    
    terminal.connect();
    
    // Keep the process running
    process.on('SIGINT', () => {
        console.log(`\n🛑 Shutting down terminal simulator...`);
        terminal.disconnect();
        process.exit(0);
    });
    
    console.log(`📱 Terminal simulator running. Press Ctrl+C to stop.`);
}

module.exports = JT808TerminalSimulator;
