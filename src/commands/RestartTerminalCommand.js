/**
 * Restart Terminal Command (0x8105)
 * ULV Protocol Section 3.20 - Terminal Control
 * Command Word: 0x74 (Restart the device)
 */

const BaseCommand = require('./BaseCommand');

class RestartTerminalCommand extends BaseCommand {
  constructor(server) {
    super(server);
    this.messageId = 0x8105; // Terminal Control
    this.commandWord = 0x74;  // Restart the device
  }

  /**
   * Execute restart terminal command according to ULV protocol
   */
  async executeCommand(connection) {
    this.debug('COMMAND_EXECUTION', `Executing restart command for terminal ${connection.terminalId}`);
    
    try {
      // Step 1: Create command body according to ULV protocol
      this.debug('BODY_CREATION', 'Creating restart command body with ULV protocol command word 0x74');
      
      const body = Buffer.alloc(1);
      body.writeUInt8(this.commandWord, 0);
      
      this.debug('BODY_CREATION', `Command body created: ${body.toString('hex')} (${body.length} bytes)`);
      this.debug('BODY_CREATION', `Command word: 0x${this.commandWord.toString(16).toUpperCase()} (Restart device)`);
      
      // Step 2: Send message to terminal
      this.debug('MESSAGE_TRANSMISSION', `Sending restart command 0x${this.messageId.toString(16).toUpperCase()} to terminal ${connection.terminalId}`);
      
      const sendResult = this.sendMessage(connection, this.messageId, body);
      
      if (!sendResult) {
        this.error('MESSAGE_TRANSMISSION', 'Failed to send restart command');
        return false;
      }
      
      // Step 3: Log success and return
      this.success('COMMAND_EXECUTION', `Restart command sent successfully to terminal ${connection.terminalId}`);
      this.debug('PROTOCOL_COMPLIANCE', `Message follows ULV protocol: 0x${this.messageId.toString(16).toUpperCase()} with command word 0x${this.commandWord.toString(16).toUpperCase()}`);
      
      return {
        messageId: this.messageId,
        commandWord: this.commandWord,
        terminalId: connection.terminalId,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      this.error('COMMAND_EXECUTION', `Error executing restart command: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Get ULV protocol specification details
   */
  getProtocolSpec() {
    return {
      messageId: `0x${this.messageId.toString(16).toUpperCase()}`,
      messageName: 'Terminal Control',
      commandWord: `0x${this.commandWord.toString(16).toUpperCase()}`,
      commandName: 'Restart the device',
      section: '3.20 Terminal control',
      description: 'Sends restart command to device according to ULV protocol specification',
      bodyFormat: '1 byte: Command word (0x74)',
      example: '7e 81 05 40 01 01 00 00 00 00 90 12 34 56 78 98 00 04 74 b4 7e'
    };
  }
}

module.exports = RestartTerminalCommand;
