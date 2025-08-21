/**
 * Set Terminal Parameters Command (0x8103)
 * ULV Protocol Section 3.18 - Terminal parameter setting
 */

const BaseCommand = require('./BaseCommand');

class SetParametersCommand extends BaseCommand {
  constructor(server) {
    super(server);
    this.messageId = 0x8103; // Terminal parameter setting
  }

  async executeCommand(connection, parameters = {}) {
    this.debug('COMMAND_EXECUTION', `Executing parameter setting command for terminal ${connection.terminalId}`);
    
    try {
      // Validate parameters
      if (!this.validateParameters(parameters)) {
        throw new Error('Invalid parameters');
      }
      
      // Create message body according to ULV protocol
      const body = this.createParameterBody(parameters);
      
      // Send message to terminal
      const sendResult = this.sendMessage(connection, this.messageId, body);
      
      if (!sendResult) {
        this.error('MESSAGE_TRANSMISSION', 'Failed to send parameter setting command');
        return false;
      }
      
      this.success('COMMAND_EXECUTION', `Parameter setting command sent successfully to terminal ${connection.terminalId}`);
      
      return {
        messageId: this.messageId,
        terminalId: connection.terminalId,
        parameters,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      this.error('COMMAND_EXECUTION', `Error executing parameter setting command: ${error.message}`, error);
      throw error;
    }
  }

  validateParameters(parameters) {
    if (!parameters || typeof parameters !== 'object') {
      this.error('PARAMETER_VALIDATION', 'Parameters must be an object');
      return false;
    }
    
    if (Object.keys(parameters).length === 0) {
      this.error('PARAMETER_VALIDATION', 'At least one parameter must be specified');
      return false;
    }
    
    return true;
  }

  createParameterBody(parameters) {
    const paramCount = Object.keys(parameters).length;
    let bodySize = 1; // Parameter count byte
    
    for (const [paramId, value] of Object.entries(parameters)) {
      bodySize += 4; // Parameter ID (4 bytes)
      bodySize += 1; // Parameter length (1 byte)
      bodySize += 4; // Parameter value (4 bytes)
    }
    
    const body = Buffer.alloc(bodySize);
    let offset = 0;
    
    // Write parameter count
    body.writeUInt8(paramCount, offset);
    offset += 1;
    
    // Write each parameter
    for (const [paramId, value] of Object.entries(parameters)) {
      const id = typeof paramId === 'string' ? parseInt(paramId, 16) : paramId;
      
      body.writeUInt32BE(id, offset);
      offset += 4;
      
      body.writeUInt8(4, offset); // Parameter length (4 bytes)
      offset += 1;
      
      body.writeUInt32BE(value, offset);
      offset += 4;
    }
    
    return body;
  }
}

module.exports = SetParametersCommand;
