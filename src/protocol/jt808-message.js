/**
 * JT808 Message Class
 * Represents a parsed JT808 protocol message
 */
class JT808Message {
  constructor(options = {}) {
    this.messageId = options.messageId || 0;
    this.messageLength = options.messageLength || 0;
    this.messageSerialNumber = options.messageSerialNumber || 0;
    this.terminalId = options.terminalId || 0;
    this.body = options.body || Buffer.alloc(0);
    this.rawData = options.rawData || null; // Store raw message data for header access
    this.timestamp = Date.now();
  }

  /**
   * Get message type name
   * @returns {string} - Human readable message type
   */
  getMessageTypeName() {
    const messageTypes = {
      0x0001: 'Terminal Registration',
      0x0002: 'Terminal Registration Response',
      0x0003: 'Terminal Logout',
      0x0004: 'Terminal Heartbeat',
      0x0100: 'Terminal Authentication',
      0x0102: 'Terminal Authentication Response',
      0x0200: 'Location Report',
      0x0201: 'Location Query',
      0x0704: 'Bulk Location Report',
      0x0800: 'Multimedia Event Upload',
      0x0801: 'Multimedia Data Upload',
      0x8800: 'Multimedia Platform Response',
      0x900: 'Device Data Report',
      0x0301: 'Event Report',
      0x8100: 'Terminal Registration Response',
      0x8001: 'Platform General Response',
      0x8003: 'Terminal Control',
      0x8201: 'Location Query',
      0x8900: 'Data Transparent Transmission Response',
      0x0900: 'Data Transparent Transmission'
    };

    return messageTypes[this.messageId] || `Unknown Message (0x${this.messageId.toString(16).toUpperCase()})`;
  }

  /**
   * Check if message is from terminal
   * @returns {boolean} - True if message is from terminal
   */
  isFromTerminal() {
    return this.messageId < 0x8000;
  }

  /**
   * Check if message is from platform
   * @returns {boolean} - True if message is from platform
   */
  isFromPlatform() {
    return this.messageId >= 0x8000;
  }

  /**
   * Check if message is a response
   * @returns {boolean} - True if message is a response
   */
  isResponse() {
    return this.messageId % 2 === 1;
  }

  /**
   * Check if message is a request
   * @returns {boolean} - True if message is a request
   */
  isRequest() {
    return this.messageId % 2 === 0;
  }

  /**
   * Get message size in bytes
   * @returns {number} - Message size in bytes
   */
  getSize() {
    return 10 + this.messageLength; // Header (10 bytes) + body length
  }

  /**
   * Convert message to string representation
   * @returns {string} - String representation of the message
   */
  toString() {
    return `JT808Message {
  messageId: 0x${this.messageId.toString(16).toUpperCase()} (${this.getMessageTypeName()})
  messageLength: ${this.messageLength}
  messageSerialNumber: ${this.messageSerialNumber}
  terminalId: ${this.terminalId}
  body: ${this.body.length} bytes
  timestamp: ${new Date(this.timestamp).toISOString()}
}`;
  }

  /**
   * Convert message to JSON object
   * @returns {Object} - JSON representation of the message
   */
  toJSON() {
    return {
      messageId: this.messageId,
      messageIdHex: `0x${this.messageId.toString(16).toUpperCase()}`,
      messageTypeName: this.getMessageTypeName(),
      messageLength: this.messageLength,
      messageSerialNumber: this.messageSerialNumber,
      terminalId: this.terminalId,
      bodyLength: this.body.length,
      body: this.body.toString('hex'),
      timestamp: this.timestamp,
      isFromTerminal: this.isFromTerminal(),
      isFromPlatform: this.isFromPlatform(),
      isRequest: this.isRequest(),
      isResponse: this.isResponse()
    };
  }

  /**
   * Clone the message
   * @returns {JT808Message} - New message instance with same data
   */
  clone() {
    return new JT808Message({
      messageId: this.messageId,
      messageLength: this.messageLength,
      messageSerialNumber: this.messageSerialNumber,
      terminalId: this.terminalId,
      body: Buffer.from(this.body)
    });
  }

  /**
   * Check if message is valid
   * @returns {boolean} - True if message is valid
   */
  isValid() {
    return this.messageId > 0 && 
           this.messageLength >= 0 && 
           this.body.length === this.messageLength &&
           this.terminalId > 0;
  }
}

module.exports = JT808Message;

