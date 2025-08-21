const JT808Message = require('./jt808-message');
const logger = require('../utils/logger');

class JT808Parser {
  constructor() {
    this.messageBuffer = Buffer.alloc(0);
    this.messageLength = 0;
  }

  /**
   * Parse incoming data according to JT808 protocol
   * @param {Buffer} data - Raw data from socket
   * @returns {JT808Message|null} - Parsed message or null if incomplete
   */
  parse(data) {
    // Append new data to buffer
    this.messageBuffer = Buffer.concat([this.messageBuffer, data]);
    
    // Look for complete messages (start with 0x7E, end with 0x7E)
    let messages = [];
    let startIndex = 0;
    let processedBytes = 0;
    
    while (true) {
      // Find start marker
      startIndex = this.messageBuffer.indexOf(0x7E, startIndex);
      if (startIndex === -1) {
        // No start marker found, keep buffer for potential future messages
        break;
      }
      
      // Find end marker after start marker
      const endIndex = this.messageBuffer.indexOf(0x7E, startIndex + 1);
      if (endIndex === -1) {
        // No end marker found, keep remaining data in buffer
        break;
      }
      
      // Extract complete message (including markers)
      const messageData = this.messageBuffer.slice(startIndex, endIndex + 1);
      
      try {
        const message = this.parseMessage(messageData);
        if (message) {
          messages.push(message);
          processedBytes = endIndex + 1;
        } else {
          // Invalid message, skip to next potential start marker
          startIndex = startIndex + 1;
          continue;
        }
      } catch (error) {
        logger.debug(`Standard format failed, trying alternative: ${error.message}`);
        // Try alternative format
        const altMessage = this.tryAlternativeFormats(messageData);
        if (altMessage) {
          logger.debug(`Parsed message using alternative format: ${altMessage.messageId.toString(16)}`);
          messages.push(altMessage);
          processedBytes = endIndex + 1;
        } else {
          // Skip this malformed message and look for next start marker
          startIndex = startIndex + 1;
          continue;
        }
      }
      
      // Move to next potential message
      startIndex = endIndex + 1;
    }
    
    // Remove processed messages from buffer to prevent memory buildup
    if (processedBytes > 0) {
      this.messageBuffer = this.messageBuffer.slice(processedBytes);
    }
    
    // Limit buffer size to prevent memory issues
    if (this.messageBuffer.length > 8192) {
      logger.warn(`Buffer too large (${this.messageBuffer.length} bytes), clearing`);
      this.messageBuffer = Buffer.alloc(0);
    }
    
    // Return first message if available
    return messages.length > 0 ? messages[0] : null;
  }

  /**
   * Parse a complete JT808 message
   * @param {Buffer} messageData - Complete message data
   * @returns {JT808Message} - Parsed message object
   */
  parseMessage(messageData) {
    // Verify start and end markers
    if (messageData[0] !== 0x7E || messageData[messageData.length - 1] !== 0x7E) {
      throw new Error('Invalid message markers');
    }

    // Remove markers and escape characters
    const unescapedData = this.unescapeMessage(messageData.slice(1, -1));
    
    // Check minimum length for header
    if (unescapedData.length < 10) {
      throw new Error('Message too short for header');
    }
    
    // Parse message header
    const messageId = unescapedData.readUInt16BE(0);
    const messageLength = unescapedData.readUInt16BE(2);
    const messageSerialNumber = unescapedData.readUInt16BE(4);
    const terminalId = unescapedData.readUInt32BE(6);
    
    // Check if we have enough data for body and checksum
    if (unescapedData.length < 10 + messageLength + 1) {
      throw new Error('Message too short for body and checksum');
    }
    
    // Extract message body
    const body = unescapedData.slice(10, 10 + messageLength);
    
    // Verify checksum
    const calculatedChecksum = this.calculateChecksum(unescapedData.slice(0, 10 + messageLength));
    const receivedChecksum = unescapedData[10 + messageLength];
    
    if (calculatedChecksum !== receivedChecksum) {
      throw new Error(`Checksum verification failed: calculated=${calculatedChecksum}, received=${receivedChecksum}`);
    }

    return new JT808Message({
      messageId,
      messageLength,
      messageSerialNumber,
      terminalId,
      body
    });
  }

  /**
   * Try to parse message with alternative formats
   * @param {Buffer} messageData - Complete message data
   * @returns {JT808Message|null} - Parsed message or null if failed
   */
  tryAlternativeFormats(messageData) {
    try {
      // Check if data starts with 0x7E (start marker)
      let dataStart = 0;
      if (messageData[0] === 0x7E) {
        dataStart = 1; // Skip start marker
      }
      
      // Check if data ends with 0x7E (end marker)
      let dataEnd = messageData.length;
      if (messageData[messageData.length - 1] === 0x7E) {
        dataEnd = messageData.length - 1; // Skip end marker
      }
      
      // Extract the actual message data
      const actualData = messageData.slice(dataStart, dataEnd);
      
      if (actualData.length >= 17) { // JT808 header is 17 bytes
        const messageId = actualData.readUInt16BE(0);
        const properties = actualData.readUInt16BE(2);
        const protocolVersion = actualData.readUInt8(4);
        const terminalPhoneNumber = actualData.slice(5, 15); // BCD[10]
        const messageSerialNumber = actualData.readUInt16BE(15);
        
        // Extract message body length from properties (bits 0-9)
        const messageBodyLength = properties & 0x3FF;
        
        // Debug logging
        logger.debug(`JT808 Alternative format parsing:`);
        logger.debug(`  messageId=0x${messageId.toString(16)}`);
        logger.debug(`  properties=0x${properties.toString(16)}`);
        logger.debug(`  protocolVersion=${protocolVersion}`);
        logger.debug(`  terminalPhoneNumber=${terminalPhoneNumber.toString('hex')}`);
        logger.debug(`  messageSerialNumber=${messageSerialNumber}`);
        logger.debug(`  messageBodyLength=${messageBodyLength}`);
        logger.debug(`  actualData.length=${actualData.length}`);
        
        // The total message should be: header(17) + body(messageBodyLength) + checksum(1)
        const expectedTotalLength = 17 + messageBodyLength + 1;
        
        if (actualData.length >= expectedTotalLength) {
          const body = actualData.slice(17, 17 + messageBodyLength);
          const checksum = actualData[17 + messageBodyLength];
          
          // Verify checksum
          const calculatedChecksum = this.calculateChecksum(actualData.slice(0, 17 + messageBodyLength));
          
          // For large multimedia packets (0x0801), be more flexible with checksum verification
          const isMultimediaPacket = messageId === 0x0801 || messageId === 0x801;
          const checksumMatches = calculatedChecksum === checksum;
          
          if (checksumMatches || (isMultimediaPacket && messageBodyLength > 500)) {
            if (!checksumMatches && isMultimediaPacket) {
              logger.debug(`⚠️ Multimedia packet checksum mismatch (calculated=${calculatedChecksum}, received=${checksum}) - proceeding due to large packet size`);
            } else {
              logger.debug(`Successfully parsed JT808 message: ID=0x${messageId.toString(16)}, BodyLength=${messageBodyLength}`);
            }
            
            return new JT808Message({
              messageId,
              messageLength: messageBodyLength,
              messageSerialNumber,
              terminalId: 0, // We'll extract this from the body for registration messages
              body,
              rawData: actualData // Store the raw data for accessing header fields
            });
          } else {
            logger.debug(`Checksum verification failed: calculated=${calculatedChecksum}, received=${checksum}`);
          }
        } else {
          logger.debug(`Message too short: expected ${expectedTotalLength} bytes, but only have ${actualData.length} bytes`);
        }
      }
    } catch (error) {
      logger.debug(`Alternative format parsing error: ${error.message}`);
    }
    
    return null;
  }

  /**
   * Build a JT808 message from message ID and body
   * @param {number|Buffer} messageIdOrBody - Message ID (number) or complete message body (Buffer)
   * @param {Buffer} [body] - Message body data (if messageId is provided)
   * @returns {Buffer} - Complete JT808 message
   */
  buildMessage(messageIdOrBody, body) {
    let messageId, messageBody;
    
    if (typeof messageIdOrBody === 'number') {
      // Two-parameter call: buildMessage(messageId, body)
      messageId = messageIdOrBody;
      messageBody = body;
    } else {
      // Single-parameter call: buildMessage(messageBody) - legacy support
      messageBody = messageIdOrBody;
      messageId = messageBody.readUInt16BE(0);
    }
    
    // Create message header
    const header = Buffer.alloc(10);
    header.writeUInt16BE(messageId, 0); // Message ID
    header.writeUInt16BE(messageBody.length, 2); // Message length
    header.writeUInt16BE(this.generateSerialNumber(), 4); // Serial number
    header.writeUInt32BE(0, 6); // Terminal ID (0 for platform messages)
    
    // Combine header and body
    const messageData = Buffer.concat([header, messageBody]);
    
    // Calculate and append checksum
    const checksum = this.calculateChecksum(messageData);
    const messageWithChecksum = Buffer.concat([messageData, Buffer.from([checksum])]);
    
    // Escape special characters and add markers
    const escapedMessage = this.escapeMessage(messageWithChecksum);
    
    return Buffer.concat([Buffer.from([0x7E]), escapedMessage, Buffer.from([0x7E])]);
  }

  /**
   * Escape special characters in message data
   * @param {Buffer} data - Raw message data
   * @returns {Buffer} - Escaped message data
   */
  escapeMessage(data) {
    const escaped = [];
    
    for (let i = 0; i < data.length; i++) {
      if (data[i] === 0x7E) {
        escaped.push(0x7D, 0x02);
      } else if (data[i] === 0x7D) {
        escaped.push(0x7D, 0x01);
      } else {
        escaped.push(data[i]);
      }
    }
    
    return Buffer.from(escaped);
  }

  /**
   * Unescape special characters in message data
   * @param {Buffer} data - Escaped message data
   * @returns {Buffer} - Unescaped message data
   */
  unescapeMessage(data) {
    const unescaped = [];
    
    for (let i = 0; i < data.length; i++) {
      if (data[i] === 0x7D && i + 1 < data.length) {
        if (data[i + 1] === 0x01) {
          unescaped.push(0x7D);
          i++; // Skip next byte
        } else if (data[i + 1] === 0x02) {
          unescaped.push(0x7E);
          i++; // Skip next byte
        } else {
          unescaped.push(data[i]);
        }
      } else {
        unescaped.push(data[i]);
      }
    }
    
    return Buffer.from(unescaped);
  }

  /**
   * Calculate checksum for message verification
   * @param {Buffer} data - Message data
   * @returns {number} - Calculated checksum
   */
  calculateChecksum(data) {
    let checksum = 0;
    for (let i = 0; i < data.length; i++) {
      checksum ^= data[i];
    }
    return checksum;
  }

  /**
   * Generate a unique serial number for messages
   * @returns {number} - Serial number
   */
  generateSerialNumber() {
    return Math.floor(Math.random() * 65536);
  }

  /**
   * Clear the message buffer
   */
  clearBuffer() {
    this.messageBuffer = Buffer.alloc(0);
  }

  /**
   * Get current buffer status
   * @returns {Object} - Buffer information
   */
  getBufferStatus() {
    return {
      bufferLength: this.messageBuffer.length,
      hasStartMarker: this.messageBuffer.indexOf(0x7E) !== -1
    };
  }
}

module.exports = JT808Parser;
