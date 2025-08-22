#!/usr/bin/env node

/**
 * Test Reset Command Implementation
 * Tests the new modular command structure
 */

console.log('🧪 Testing Reset Command Implementation');
console.log('=====================================');

// Mock server for testing
class MockServer {
  constructor() {
    this.connections = new Map();
    this.serialNumber = 1;
  }

  findConnectionByTerminalId(terminalId) {
    return this.connections.get(terminalId) || null;
  }

  generateSerialNumber() {
    return this.serialNumber++;
  }

  sendMessageToTerminal(connection, messageId, body) {
    console.log(`📤 [MockServer] Sending message 0x${messageId.toString(16).toUpperCase()} to terminal ${connection.terminalId}`);
    console.log(`   Body: ${body.toString('hex')} (${body.length} bytes)`);
    console.log(`   Message would be sent via socket.write()`);
    return true;
  }
}

// Create mock connection
const mockConnection = {
  terminalId: '628076842334',
  socket: { write: () => true }
};

// Create mock server and add connection
const mockServer = new MockServer();
mockServer.connections.set('628076842334', mockConnection);

console.log('\n📋 Setting up test environment...');
console.log(`   Mock server created`);
console.log(`   Mock connection created for terminal: 628076842334`);

// Test the reset command
async function testResetCommand() {
  try {
    console.log('\n🧪 Testing RestartTerminalCommand...');
    
    const RestartTerminalCommand = require('./src/commands/RestartTerminalCommand');
    const restartCommand = new RestartTerminalCommand(mockServer);
    
    console.log('\n📋 Command details:');
    console.log(`   Message ID: 0x${restartCommand.messageId.toString(16).toUpperCase()}`);
    console.log(`   Command Word: 0x${restartCommand.commandWord.toString(16).toUpperCase()}`);
    
    console.log('\n📋 Protocol specification:');
    const spec = restartCommand.getProtocolSpec();
    console.log(`   Section: ${spec.section}`);
    console.log(`   Description: ${spec.description}`);
    console.log(`   Body Format: ${spec.bodyFormat}`);
    console.log(`   Example: ${spec.example}`);
    
    console.log('\n🚀 Executing restart command...');
    const result = await restartCommand.execute('628076842334');
    
    console.log('\n📊 Test Results:');
    console.log(`   Success: ${result.success}`);
    if (result.success) {
      console.log(`   Result:`, result.result);
    } else {
      console.log(`   Error: ${result.error}`);
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testResetCommand();

console.log('\n✅ Test completed');
