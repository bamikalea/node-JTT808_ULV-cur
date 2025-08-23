/**
 * JT1078 Live Video Streaming Command (0x9101)
 * ULV Protocol V2.0.0-2019 Section 3.11 - Real-time audio/video preview request
 * 
 * FIXED: Now follows ULV Protocol Table 3.11.1 exactly with JTT2019 time format
 */

const BaseCommand = require('./BaseCommand');

class JT1078StreamingCommand extends BaseCommand {
  constructor(server) {
    super(server);
    this.messageId = 0x9101; // Real-time audio/video preview request (ULV Protocol Table 3.11.1)
  }

  async executeCommand(connection, channelId = 1, dataType = 0) {
    this.debug('COMMAND_EXECUTION', `Executing JT1078 streaming command for terminal ${connection.terminalId}`);
    
    try {
      // Validate parameters according to ULV Protocol
      if (!this.validateStreamingParameters(channelId, dataType)) {
        throw new Error('Invalid streaming parameters');
      }
      
      // Create message body according to ULV Protocol Table 3.11.1
      const body = this.createStreamingBody(channelId, dataType);
      
      // Send message to terminal using ULV Protocol V2.0.0-2019 format
      const sendResult = this.sendMessage(connection, this.messageId, body);
      
      if (!sendResult) {
        this.error('MESSAGE_TRANSMISSION', 'Failed to send JT1078 streaming command');
        return false;
      }
      
      this.success('COMMAND_EXECUTION', `JT1078 streaming command sent successfully to terminal ${connection.terminalId}`);
      
      return {
        messageId: this.messageId,
        terminalId: connection.terminalId,
        channelId,
        dataType,
        serverIP: '192.168.100.100',
        tcpPort: 1935,
        udpPort: 1935,
        timestamp: new Date().toISOString(),
        protocol: 'ULV V2.0.0-2019',
        section: '3.11 Real-time audio/video preview request'
      };
      
    } catch (error) {
      this.error('COMMAND_EXECUTION', `Error executing JT1078 streaming command: ${error.message}`, error);
      throw error;
    }
  }

  validateStreamingParameters(channelId, dataType) {
    // Validate channel ID according to ULV Protocol Table 3.11.1
    if (typeof channelId !== 'number' || channelId < 1 || channelId > 255) {
      this.error('PARAMETER_VALIDATION', `Invalid channel ID: ${channelId}. Must be 1-255 (ULV Protocol Table 3.11.1)`);
      return false;
    }
    
    // Validate data type according to ULV Protocol Table 3.11.1
    // 0: Audio and video, 1: Video, 2: Two-way audio, 3: Audio monitoring
    const validDataTypes = [0, 1, 2, 3];
    if (!validDataTypes.includes(dataType)) {
      this.error('PARAMETER_VALIDATION', `Invalid data type: ${dataType}. Must be 0 (Audio+Video), 1 (Video), 2 (Two-way audio), or 3 (Audio monitoring) - ULV Protocol Table 3.11.1`);
      return false;
    }
    
    this.success('PARAMETER_VALIDATION', `Streaming parameters validated successfully according to ULV Protocol Table 3.11.1`);
    return true;
  }

  createStreamingBody(channelId, dataType) {
    // Create message body according to ULV Protocol Table 3.11.1
    // Structure: Server IP (4) + TCP Port (2) + UDP Port (2) + Channel (1) + Data Type (1) + Stream Type (1) + Reserved (5)
    const body = Buffer.alloc(16);
    let offset = 0;
    
    // Server IP address (4 bytes) - ULV Protocol Table 3.11.1
    const serverIP = Buffer.from([192, 168, 100, 100]);
    serverIP.copy(body, offset);
    offset += 4;
    
    // TCP port (2 bytes WORD) - ULV Protocol Table 3.11.1
    body.writeUInt16BE(1935, offset);
    offset += 2;
    
    // UDP port (2 bytes WORD) - ULV Protocol Table 3.11.1
    body.writeUInt16BE(1935, offset);
    offset += 2;
    
    // Channel number (1 byte) - ULV Protocol Table 3.11.1
    body.writeUInt8(channelId, offset);
    offset += 1;
    
    // Data type (1 byte) - ULV Protocol Table 3.11.1
    // 0: Audio and video, 1: Video, 2: Two-way audio, 3: Audio monitoring
    body.writeUInt8(dataType, offset);
    offset += 1;
    
    // Stream type (1 byte) - ULV Protocol Table 3.11.1
    // 0: Main stream, 1: Sub stream
    body.writeUInt8(0, offset);
    offset += 1;
    
    // Reserved (5 bytes) - ULV Protocol Table 3.11.1
    body.fill(0, offset, offset + 5);
    
    this.debug('BODY_CREATION', `JT1078 streaming body created according to ULV Protocol Table 3.11.1: ${body.toString('hex')}`);
    this.debug('BODY_CREATION', `  Server IP: 192.168.100.100, TCP/UDP Port: 1935`);
    this.debug('BODY_CREATION', `  Channel: ${channelId}, Data Type: ${dataType}, Stream Type: 0 (main)`);
    
    return body;
  }

  /**
   * Get ULV Protocol V2.0.0-2019 specification details
   */
  getProtocolSpec() {
    return {
      protocol: 'ULV Protocol V2.0.0-2019',
      messageId: `0x${this.messageId.toString(16).toUpperCase()}`,
      messageName: 'Real-time audio/video preview request',
      section: '3.11 Real-time audio/video preview request',
      tableReference: 'Table 3.11.1',
      description: 'Requests real-time audio/video streaming from device according to ULV Protocol V2.0.0-2019',
      bodyFormat: '16 bytes: Server IP (4) + TCP Port (2) + UDP Port (2) + Channel (1) + Data Type (1) + Stream Type (1) + Reserved (5)',
      headerFormat: '17 bytes: ULV Protocol V2.0.0-2019 header (Table 2.2.2)',
      timeFormat: 'JTT2019 (DWORD seconds since 2000-01-01 00:00:00 UTC)',
      dataTypes: {
        0: 'Audio and video',
        1: 'Video only',
        2: 'Two-way audio',
        3: 'Audio monitoring'
      },
      expectedResponse: '0x1101 Real-time audio/video preview response or 0x0001 General Response'
    };
  }
}

module.exports = JT1078StreamingCommand;
