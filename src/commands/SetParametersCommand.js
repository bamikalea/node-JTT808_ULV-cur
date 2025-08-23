/**
 * Set Terminal Parameters Command (0x8103)
 * ULV Protocol V2.0.0-2019 Section 3.17 - ULV parameter configuration
 * 
 * FIXED: Now follows ULV Protocol Table 3.17.1 exactly with JTT2019 time format
 */

const BaseCommand = require('./BaseCommand');

class SetParametersCommand extends BaseCommand {
  constructor(server) {
    super(server);
    this.messageId = 0x8103; // Terminal parameter setting (JT808 standard)
    // Note: ULV Protocol also uses 0xB050 for ULV-specific parameters
  }

  async executeCommand(connection, parameters = {}) {
    this.debug('COMMAND_EXECUTION', `Executing parameter setting command for terminal ${connection.terminalId}`);
    
    try {
      // Validate parameters according to ULV Protocol
      if (!this.validateParameters(parameters)) {
        throw new Error('Invalid parameters');
      }
      
      // Create message body according to ULV Protocol format
      const body = this.createParameterBody(parameters);
      
      // Send message to terminal using ULV Protocol V2.0.0-2019 format
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
        parameterCount: Object.keys(parameters).length,
        timestamp: new Date().toISOString(),
        protocol: 'ULV V2.0.0-2019',
        section: '3.17 ULV parameter configuration'
      };
      
    } catch (error) {
      this.error('COMMAND_EXECUTION', `Error executing parameter setting command: ${error.message}`, error);
      throw error;
    }
  }

  validateParameters(parameters) {
    if (!parameters || typeof parameters !== 'object') {
      this.error('PARAMETER_VALIDATION', 'Parameters must be an object (ULV Protocol Table 3.17.1)');
      return false;
    }
    
    if (Object.keys(parameters).length === 0) {
      this.error('PARAMETER_VALIDATION', 'At least one parameter must be specified (ULV Protocol Table 3.17.1)');
      return false;
    }

    // Validate parameter IDs according to ULV Protocol Table 3.17.1
    for (const [paramId, value] of Object.entries(parameters)) {
      const id = typeof paramId === 'string' ? parseInt(paramId, 16) : paramId;
      
      if (isNaN(id) || id < 0 || id > 0xFFFFFFFF) {
        this.error('PARAMETER_VALIDATION', `Invalid parameter ID: ${paramId}. Must be valid DWORD (ULV Protocol Table 3.17.1)`);
        return false;
      }
      
      if (typeof value !== 'number' && typeof value !== 'string') {
        this.error('PARAMETER_VALIDATION', `Invalid parameter value for ${paramId}: ${value}. Must be number or string (ULV Protocol Table 3.17.1)`);
        return false;
      }
    }
    
    this.success('PARAMETER_VALIDATION', `Parameters validated successfully according to ULV Protocol Table 3.17.1`);
    return true;
  }

  createParameterBody(parameters) {
    // Create message body according to ULV Protocol Table 3.17.1
    // Structure: Parameter count (1 byte) + [Parameter ID (4 bytes) + Parameter length (1 byte) + Parameter value (variable)]
    
    const paramCount = Object.keys(parameters).length;
    let bodySize = 1; // Parameter count byte
    
    // Calculate total body size
    for (const [paramId, value] of Object.entries(parameters)) {
      bodySize += 4; // Parameter ID (DWORD - 4 bytes)
      bodySize += 1; // Parameter length (BYTE - 1 byte)
      
      // Calculate parameter value size
      if (typeof value === 'string') {
        bodySize += Buffer.byteLength(value, 'utf8');
      } else {
        bodySize += 4; // DWORD for numeric values
      }
    }
    
    const body = Buffer.alloc(bodySize);
    let offset = 0;
    
    // Write parameter count (1 byte) - ULV Protocol Table 3.17.1
    body.writeUInt8(paramCount, offset);
    offset += 1;
    
    this.debug('BODY_CREATION', `Creating parameter body with ${paramCount} parameters according to ULV Protocol Table 3.17.1`);
    
    // Write each parameter according to ULV Protocol format
    for (const [paramId, value] of Object.entries(parameters)) {
      const id = typeof paramId === 'string' ? parseInt(paramId, 16) : paramId;
      
      // Parameter ID (4 bytes DWORD) - ULV Protocol Table 3.17.1
      body.writeUInt32BE(id, offset);
      offset += 4;
      
      // Parameter value and length
      if (typeof value === 'string') {
        const valueBuffer = Buffer.from(value, 'utf8');
        
        // Parameter length (1 byte) - ULV Protocol Table 3.17.1
        body.writeUInt8(valueBuffer.length, offset);
        offset += 1;
        
        // Parameter value (variable length string)
        valueBuffer.copy(body, offset);
        offset += valueBuffer.length;
        
        this.debug('BODY_CREATION', `  Parameter 0x${id.toString(16).toUpperCase()}: "${value}" (${valueBuffer.length} bytes string)`);
      } else {
        // Parameter length (1 byte) - 4 bytes for DWORD
        body.writeUInt8(4, offset);
        offset += 1;
        
        // Parameter value (4 bytes DWORD)
        body.writeUInt32BE(value, offset);
        offset += 4;
        
        this.debug('BODY_CREATION', `  Parameter 0x${id.toString(16).toUpperCase()}: ${value} (4 bytes DWORD)`);
      }
    }
    
    this.debug('BODY_CREATION', `Parameter body created: ${body.toString('hex')} (${body.length} bytes total)`);
    
    return body;
  }

  /**
   * Get ULV Protocol V2.0.0-2019 specification details
   */
  getProtocolSpec() {
    return {
      protocol: 'ULV Protocol V2.0.0-2019',
      messageId: `0x${this.messageId.toString(16).toUpperCase()}`,
      messageName: 'Terminal parameter setting',
      alternativeMessageId: '0xB050 (ULV-specific parameters)',
      section: '3.17 ULV parameter configuration',
      tableReference: 'Table 3.17.1',
      description: 'Sets terminal parameters according to ULV Protocol V2.0.0-2019 specification',
      bodyFormat: 'Parameter count (1) + [Parameter ID (4) + Parameter length (1) + Parameter value (variable)]',
      headerFormat: '17 bytes: ULV Protocol V2.0.0-2019 header (Table 2.2.2)',
      timeFormat: 'JTT2019 (DWORD seconds since 2000-01-01 00:00:00 UTC)',
      parameterTypes: {
        'DWORD': 'Numeric parameters (4 bytes)',
        'STRING': 'Text parameters (variable length)',
        'BYTE': 'Single byte parameters',
        'WORD': 'Two byte parameters'
      },
      expectedResponse: '0x0104 Parameter setting response or 0x0001 General Response'
    };
  }
}

module.exports = SetParametersCommand;
