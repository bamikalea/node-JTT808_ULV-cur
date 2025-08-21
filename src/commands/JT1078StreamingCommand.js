/**
 * JT1078 Live Video Streaming Command (0x9101)
 * ULV Protocol Section 3.11.1 - Real-time audio/video preview request
 */

const BaseCommand = require('./BaseCommand');

class JT1078StreamingCommand extends BaseCommand {
  constructor(server) {
    super(server);
    this.messageId = 0x9101; // Real-time audio/video preview request
  }

  async executeCommand(connection, channelId = 1, dataType = 0) {
    this.debug('COMMAND_EXECUTION', `Executing JT1078 streaming command for terminal ${connection.terminalId}`);
    
    try {
      // Validate parameters
      if (!this.validateStreamingParameters(channelId, dataType)) {
        throw new Error('Invalid streaming parameters');
      }
      
      // Create message body according to ULV protocol
      const body = this.createStreamingBody(channelId, dataType);
      
      // Send message to terminal
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
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      this.error('COMMAND_EXECUTION', `Error executing JT1078 streaming command: ${error.message}`, error);
      throw error;
    }
  }

  validateStreamingParameters(channelId, dataType) {
    if (typeof channelId !== 'number' || channelId < 1 || channelId > 255) {
      this.error('PARAMETER_VALIDATION', `Invalid channel ID: ${channelId}. Must be 1-255`);
      return false;
    }
    
    const validDataTypes = [0, 1, 2, 3];
    if (!validDataTypes.includes(dataType)) {
      this.error('PARAMETER_VALIDATION', `Invalid data type: ${dataType}. Must be 0, 1, 2, or 3`);
      return false;
    }
    
    this.success('PARAMETER_VALIDATION', `Streaming parameters validated successfully`);
    return true;
  }

  createStreamingBody(channelId, dataType) {
    const body = Buffer.alloc(16);
    let offset = 0;
    
    // Server IP (4 bytes) - 192.168.100.100
    const serverIP = Buffer.from([192, 168, 100, 100]);
    serverIP.copy(body, offset);
    offset += 4;
    
    // TCP port (2 bytes) - port 1935
    body.writeUInt16BE(1935, offset);
    offset += 2;
    
    // UDP port (2 bytes) - port 1935
    body.writeUInt16BE(1935, offset);
    offset += 2;
    
    // Channel number (1 byte)
    body.writeUInt8(channelId, offset);
    offset += 1;
    
    // Data type (1 byte)
    body.writeUInt8(dataType, offset);
    offset += 1;
    
    // Stream type (1 byte): 0=main stream
    body.writeUInt8(0, offset);
    offset += 1;
    
    // Reserved (5 bytes) - fill with zeros
    body.fill(0, offset, offset + 5);
    
    return body;
  }
}

module.exports = JT1078StreamingCommand;
