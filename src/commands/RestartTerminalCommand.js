/**
 * Restart Terminal Command (0x8105)
 * ULV Protocol V2.0.0-2019 Section 3.20 - Terminal Control
 * Command Word: 0x74 (Restart the device)
 * 
 * FIXED: Now follows ULV Protocol Table 3.20 exactly with JTT2019 time format
 */

const BaseCommand = require('./BaseCommand');

class RestartTerminalCommand extends BaseCommand {
  constructor(server) {
    super(server);
    this.messageId = 0x8105; // Terminal Control (ULV Protocol Table 3.20)
    this.commandWord = 0x74;  // Restart the device (ULV Protocol Table 3.20)
  }

  /**
   * Execute restart terminal command according to ULV Protocol V2.0.0-2019
   */
  async executeCommand(connection) {
    this.debug('COMMAND_EXECUTION', `Executing restart command for terminal ${connection.terminalId}`);
    
    try {
      // Step 1: Create command body according to ULV Protocol Table 3.20
      this.debug('BODY_CREATION', 'Creating restart command body with ULV Protocol V2.0.0-2019 command word 0x74');
      
      // ULV Protocol V2.0.0-2019 Table 3.20: Terminal Control with Parameter Length + Command Word
      const body = Buffer.alloc(2);
      let offset = 0;
      
      // Command Parameter Length (1 byte) - 0x00 for no additional parameters
      body.writeUInt8(0x00, offset);
      offset += 1;
      
      // Command Word (1 byte) - 0x74 for restart device
      body.writeUInt8(this.commandWord, offset);
      
      this.debug('BODY_CREATION', `Command body created: ${body.toString('hex')} (${body.length} bytes)`);
      this.debug('BODY_CREATION', `Parameter Length: 0x00, Command word: 0x${this.commandWord.toString(16).toUpperCase()} (Restart device - ULV Protocol Table 3.20)`);
      
      // Step 2: Send message to terminal using ULV Protocol V2.0.0-2019 format
      this.debug('MESSAGE_TRANSMISSION', `Sending restart command (0x${this.messageId.toString(16).toUpperCase()}) with command byte 0x${this.commandWord.toString(16).toUpperCase()}`);
      
      const sendResult = this.sendMessage(connection, this.messageId, body);
      
      if (!sendResult) {
        this.error('MESSAGE_TRANSMISSION', 'Failed to send restart command');
        return false;
      }
      
      // Step 3: Log success and return
      this.success('MESSAGE_TRANSMISSION', `Restart command sent successfully to terminal ${connection.terminalId}`);
      this.debug('PROTOCOL_COMPLIANCE', `Message follows ULV Protocol V2.0.0-2019: Message ID 0x${this.messageId.toString(16).toUpperCase()}, Command Word 0x${this.commandWord.toString(16).toUpperCase()}`);
      
      return {
        messageId: this.messageId,
        commandWord: this.commandWord,
        terminalId: connection.terminalId,
        timestamp: new Date().toISOString(),
        protocol: 'ULV V2.0.0-2019',
        section: '3.20 Terminal Control'
      };
      
    } catch (error) {
      this.error('COMMAND_EXECUTION', `Error executing restart command: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Get ULV Protocol V2.0.0-2019 specification details
   */
  getProtocolSpec() {
    return {
      protocol: 'ULV Protocol V2.0.0-2019',
      messageId: `0x${this.messageId.toString(16).toUpperCase()}`,
      messageName: 'Terminal Control',
      commandWord: `0x${this.commandWord.toString(16).toUpperCase()}`,
      commandName: 'Restart the device',
      section: '3.20 Terminal control',
      tableReference: 'Table 3.20',
      description: 'Sends restart command to device according to ULV Protocol V2.0.0-2019 specification',
      bodyFormat: '2 bytes: Parameter Length (0x00) + Command word (0x74 = Restart device)',
      headerFormat: '17 bytes: ULV Protocol V2.0.0-2019 header (Table 2.2.2)',
      timeFormat: 'JTT2019 (DWORD seconds since 2000-01-01 00:00:00 UTC)',
      expectedResponse: '0x0001 General Response or 0x0900 ULV Data Transparent Transmission with restart acknowledgment'
    };
  }
}

module.exports = RestartTerminalCommand;
