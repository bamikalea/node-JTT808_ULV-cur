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
      // ULV Protocol V2.0.0-2019 Message Types (Corrected)
      
      // Section 3.1 - General Response
      0x0001: 'General Response (Device)',           // Table 3.1.1
      0x8001: 'General Response (Platform)',        // Table 3.1.2
      
      // Section 3.2 - Heartbeat
      0x0002: 'Heartbeat Message',                  // Section 3.2
      
      // Section 3.3 - Device Registration
      0x0100: 'Device Registration Message',        // Table 3.3.1
      0x8100: 'Device Registration Response',       // Table 3.3.2
      
      // Section 3.4 - Device Authentication
      0x0102: 'Device Authentication',              // Table 3.4
      
      // Section 3.5 - Location Information Report
      0x0200: 'Location Information Report',        // Table 3.5.1
      
      // Section 3.6 - Bulk Location Information
      0x0704: 'Bulk Location Information Report',   // Table 3.6.1
      
      // Section 3.7 - Multimedia Event Upload
      0x0800: 'Multimedia Event Upload',           // Table 3.7.1
      
      // Section 3.8 - Multimedia Data Upload
      0x0801: 'Multimedia Data Upload',            // Table 3.8.1
      0x8800: 'Multimedia Platform Response',      // Table 3.8.2
      
      // Section 3.9 - Driver Identity Information
      0x0702: 'Driver Identity Information Report', // Table 3.9.1
      
      // Section 3.10 - Data Transparent Transmission
      0x0900: 'Data Transparent Transmission (Device)', // Table 3.10.1
      0x8900: 'Data Transparent Transmission (Platform)', // Table 3.10.1
      
      // Section 3.11 - Real-time Audio/Video Preview
      0x9101: 'Real-time Audio/Video Preview Request', // Table 3.11.1
      
      // Section 3.12 - Real-time Audio/Video Transmission Control
      0x9102: 'Real-time Audio/Video Transmission Control', // Table 3.12.1
      
      // Section 3.13 - Audio/Video Data Transmission
      0x9103: 'Audio and Video Data Transmission',  // Section 3.13
      
      // Section 3.14 - Query Audio/Video Resources
      0x9205: 'Query Audio/Video Resources',        // Table 3.14.1
      0x1205: 'Audio/Video Resource Response',      // Table 3.14.2
      
      // Section 3.15 - Audio/Video Playback Request
      0x9201: 'Audio/Video Playback Request',       // Table 3.15.1
      
      // Section 3.16 - Audio/Video Playback Control
      0x9202: 'Audio/Video Playback Control',       // Table 3.16.1
      
      // Section 3.17 - ULV Parameter Configuration
      0xB050: 'ULV Parameter Configuration (Get/Set)', // Table 3.17.1
      0xB051: 'ULV Parameter Response',             // Table 3.17.2
      
      // Section 3.18 - MDVR Upload Passenger Count
      0x1005: 'MDVR Upload Passenger Count',        // Section 3.18
      
      // Section 3.19 - Server Query Vehicle Information
      0xB040: 'Server Query Vehicle Information',   // Section 3.19
      0x4040: 'Vehicle Information Response',       // Section 3.19
      
      // Section 3.20 - Terminal Control
      0x8105: 'Terminal Control',                   // Section 3.20
      
      // Section 3.21 - File Upload Instructions
      0x9206: 'File Upload Instructions',           // Section 3.21
      
      // Section 3.22 - File Upload Completion Notice
      0x1206: 'File Upload Completion Notice',      // Section 3.22
      
      // Section 3.23 - File Upload Control
      0x9207: 'File Upload Control',                // Section 3.23
      
      // Section 3.24 - MDVR Upload Passenger Data
      0x0D03: 'MDVR Upload Passenger Data',         // Section 3.24
      
      // Section 3.25 - Text Information Distribution
      0x8300: 'Text Information Distribution',      // Section 3.25
      
      // Chapter 4 - Alarm Attachment Upload
      0x9208: 'Alarm Attachment Upload Command',    // Table 4.1
      0x1210: 'Alarm Attachment Information Message', // Table 4.3
      0x1211: 'File Information Upload',            // Table 4.4
      0x1212: 'File Upload Completion Message',     // Table 4.6
      0x9212: 'File Upload Completion Response',    // Table 4.7
      
      // Legacy/Alternative formats (for backward compatibility)
      0x800: 'Multimedia Event Upload (Alt)',      // Alternative format
      0x801: 'Multimedia Data Upload (Alt)',       // Alternative format
      0x900: 'Device Data Report (Legacy)',        // Legacy format
      
      // Platform query messages
      0x8201: 'Platform Location Query',
      0x0201: 'Location Query Response'
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

