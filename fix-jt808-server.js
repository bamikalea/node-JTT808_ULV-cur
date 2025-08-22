#!/usr/bin/env node

/**
 * Fixed JT808 Server - Addresses Critical Issues
 * 
 * This script fixes the buffer overflow in parameter setting and adds
 * proper logging to verify message transmission.
 */

const JT808Server = require('./src/jt808-server');

class FixedJT808Server extends JT808Server {
    constructor() {
        super();
        this.fixParameterSetting();
        this.addSocketWriteLogging();
    }

    /**
     * Fix the buffer overflow in parameter setting
     */
    fixParameterSetting() {
        const originalMethod = this.setVideoStreamingParameters;
        
        this.setVideoStreamingParameters = (terminalId, parameters = {}) => {
            const connection = this.findConnectionByTerminalId(terminalId);
            if (!connection) {
                this.logger.error(`Cannot set parameters: Terminal ${terminalId} not connected`);
                return false;
            }

            try {
                // Default parameters for video streaming
                const defaultParams = {
                    0x0070: 1,    // Enable video upload
                    0x0064: 2,    // Set 720P resolution
                    0x0065: 5     // Set medium quality
                };

                const params = { ...defaultParams, ...parameters };
                
                // Create parameter setting message body
                const paramCount = Object.keys(params).length;
                let bodySize = 1; // Parameter count byte
                
                // Calculate body size correctly
                for (const [paramId, value] of Object.entries(params)) {
                    bodySize += 4; // Parameter ID (4 bytes)
                    bodySize += 1; // Parameter length (1 byte)
                    bodySize += 4; // Parameter value (4 bytes for uint32)
                }

                console.log(`🔧 Fixed parameter setting: ${paramCount} parameters, body size: ${bodySize} bytes`);
                
                const body = Buffer.alloc(bodySize);
                let offset = 0;

                // Write parameter count
                body.writeUInt8(paramCount, offset);
                offset += 1;

                // Write each parameter
                for (const [paramId, value] of Object.entries(params)) {
                    if (offset >= body.length) {
                        throw new Error(`Buffer overflow: offset ${offset} >= buffer length ${body.length}`);
                    }

                    // Parameter ID (4 bytes) - FIX: Parse as hex
                    const id = parseInt(paramId, 16);
                    body.writeUInt32BE(id, offset);
                    offset += 4;

                    // Parameter length (1 byte)
                    body.writeUInt8(4, offset);
                    offset += 1;

                    // Parameter value (4 bytes)
                    body.writeUInt32BE(value, offset);
                    offset += 4;
                }

                const message = this.createJT808Message(0x8103, body, connection.terminalId);
                
                // Log the message before sending
                console.log(`📤 Sending parameter message: ${message.toString('hex')}`);
                
                // Send with error handling
                const writeResult = connection.socket.write(message);
                console.log(`📤 Socket write result: ${writeResult}`);
                
                if (writeResult) {
                    this.logger.info(`✅ Video parameters set successfully for terminal ${terminalId}`);
                    return true;
                } else {
                    this.logger.error(`❌ Socket write failed for terminal ${terminalId}`);
                    return false;
                }

            } catch (error) {
                this.logger.error(`Error setting video parameters: ${error.message}`);
                return false;
            }
        };
    }

    /**
     * Add comprehensive socket write logging
     */
    addSocketWriteLogging() {
        // Override the sendMessageToTerminal method to add logging
        const originalMethod = this.sendMessageToTerminal;
        
        this.sendMessageToTerminal = (connection, messageId, body) => {
            try {
                console.log(`🔍 SEND MESSAGE DEBUG:`);
                console.log(`   Message ID: 0x${messageId.toString(16).toUpperCase()}`);
                console.log(`   Body length: ${body.length} bytes`);
                console.log(`   Terminal ID: ${connection.terminalId}`);
                console.log(`   Socket valid: ${connection.socket && !connection.socket.destroyed}`);
                
                // Build message header according to JT808-2019 standard
                const messageIdBuffer = Buffer.alloc(2);
                messageIdBuffer.writeUInt16BE(messageId, 0);

                // Properties: Version ID (bit 14) = 1, body length
                const properties = Buffer.alloc(2);
                properties.writeUInt16BE(0x4000 | body.length, 0);

                const protocolVersion = Buffer.alloc(1);
                protocolVersion.writeUInt8(1, 0);

                // Terminal phone number in BCD format (6 bytes)
                const bcdPhone = Buffer.alloc(6);
                if (connection.terminalId) {
                    const phoneNumber = connection.terminalId.padStart(12, '0');
                    for (let i = 0; i < 6; i++) {
                        const digit1 = parseInt(phoneNumber[i * 2], 10);
                        const digit2 = parseInt(phoneNumber[i * 2 + 1], 10);
                        bcdPhone[i] = (digit1 << 4) | digit2;
                    }
                }

                const messageSerialNumber = Buffer.alloc(2);
                messageSerialNumber.writeUInt16BE(this.generateSerialNumber(), 0);

                // Build header (15 bytes total for JT808-2019)
                const header = Buffer.concat([
                    messageIdBuffer,    // 2 bytes
                    properties,         // 2 bytes  
                    protocolVersion,    // 1 byte
                    bcdPhone,          // 6 bytes
                    messageSerialNumber // 2 bytes
                ]);

                // Build complete message
                const message = Buffer.concat([header, body]);

                // Calculate checksum
                let checksum = 0;
                for (let i = 0; i < message.length; i++) {
                    checksum ^= message[i];
                }

                const checksumBuffer = Buffer.alloc(1);
                checksumBuffer.writeUInt8(checksum, 0);

                const completeMessage = Buffer.concat([message, checksumBuffer]);
                
                // Wrap with 0x7E markers and apply escape processing
                const wrappedMessage = Buffer.alloc(completeMessage.length + 2);
                wrappedMessage.writeUInt8(0x7E, 0);
                completeMessage.copy(wrappedMessage, 1);
                wrappedMessage.writeUInt8(0x7E, wrappedMessage.length - 1);

                // Apply escape processing for 0x7E and 0x7D in message content
                const escapedMessage = this.applyEscapeProcessing(wrappedMessage);

                console.log(`📤 Final message to send:`);
                console.log(`   Length: ${escapedMessage.length} bytes`);
                console.log(`   Hex: ${escapedMessage.toString('hex')}`);
                console.log(`   Expected pattern: 7e${messageId.toString(16).padStart(4, '0')}...7e`);

                // Send to terminal with error handling
                const writeResult = connection.socket.write(escapedMessage);
                console.log(`📤 Socket write result: ${writeResult}`);
                
                if (writeResult) {
                    console.log(`✅ Message sent successfully`);
                    this.logger.debug(`📤 Sent message to terminal ${connection.terminalId || 'unknown'}: 0x${messageId.toString(16)}, ${body.length} bytes`);
                    this.logger.debug(`📤 Raw message: ${escapedMessage.toString('hex')}`);
                    return true;
                } else {
                    console.log(`❌ Socket write failed - buffer full or socket closed`);
                    this.logger.error(`Socket write failed for terminal ${connection.terminalId}`);
                    return false;
                }
                
            } catch (error) {
                console.log(`❌ Error in sendMessageToTerminal: ${error.message}`);
                this.logger.error(`Error sending message to terminal: ${error.message}`);
                return false;
            }
        };
    }

    /**
     * Test all commands with proper logging
     */
    async testAllCommands(terminalId) {
        console.log(`\n🧪 Testing All Commands for Terminal ${terminalId}`);
        console.log('==============================================');
        
        // Test 1: Parameter Setting
        console.log('\n📤 Test 1: Parameter Setting (0x8103)');
        const paramResult = this.setVideoStreamingParameters(terminalId, {
            0x0070: 1,    // Enable video upload
            0x0064: 2,    // Set 720P resolution
            0x0065: 5     // Set medium quality
        });
        console.log(`   Result: ${paramResult ? '✅ Success' : '❌ Failed'}`);
        
        // Test 2: Restart Command
        console.log('\n📤 Test 2: Restart Command (0x8105)');
        const restartResult = this.restartTerminal(terminalId);
        console.log(`   Result: ${restartResult ? '✅ Success' : '❌ Failed'}`);
        
        // Test 3: JT1078 Streaming
        console.log('\n📤 Test 3: JT1078 Streaming (0x9101)');
        const streamingResult = this.requestJT1078LiveVideo(terminalId, 1, 0);
        console.log(`   Result: ${streamingResult ? '✅ Success' : '❌ Failed'}`);
        
        console.log('\n✅ All command tests completed');
        return { paramResult, restartResult, streamingResult };
    }
}

// Export the fixed server
module.exports = FixedJT808Server;

// If run directly, test the fixes
if (require.main === module) {
    console.log('🔧 Testing Fixed JT808 Server...');
    
    const fixedServer = new FixedJT808Server();
    
    // Test message construction
    console.log('\n🧪 Testing Message Construction...');
    try {
        const testBody = Buffer.alloc(0);
        const testMessage = fixedServer.createJT808Message(0x8105, testBody, '628076842334');
        console.log(`✅ Restart message constructed: ${testMessage.toString('hex')}`);
    } catch (error) {
        console.log(`❌ Message construction failed: ${error.message}`);
    }
    
    console.log('\n💡 To test with live server, replace the server instance with FixedJT808Server');
}

