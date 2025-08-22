#!/usr/bin/env node

const net = require('net');
const fs = require('fs');
const path = require('path');

/**
 * JT808 Streaming Command Trigger and Handshake Monitor
 * Sends 0x9101 streaming request and monitors for device handshake
 */

class StreamingHandshakeMonitor {
  constructor() {
    this.config = {
      serverHost: '127.0.0.1',
      serverPort: 8080,
      terminalId: 628076842334,
      logFile: path.join(__dirname, 'logs/combined.log'),
      monitorInterval: 1000 // Check logs every second
    };
    
    this.isMonitoring = false;
    this.lastLogPosition = 0;
    this.handshakePatterns = [
      /0x9101.*Response.*Result.*0x0/i,
      /Response to message.*0x9101.*Result.*0x0/i,
      /ULV.*streaming.*data/i,
      /0x9103.*ULV.*streaming/i
    ];
  }

  /**
   * Create JT808 message with 0x9101 streaming command
   */
  createStreamingMessage() {
    // JT808 Message Structure:
    // Start Marker (1) + Header (10) + Body + End Marker (1)
    
    const startMarker = Buffer.from([0x7E]);
    const endMarker = Buffer.from([0x7E]);
    
    // Message ID: 0x9101 (ULV Real-time audio/video preview request)
    const messageId = Buffer.alloc(2);
    messageId.writeUInt16BE(0x9101, 0);
    
    // Message body properties (ULV Protocol)
    const body = Buffer.alloc(23);
    let offset = 0;
    
    // Channel number (1 byte)
    body.writeUInt8(1, offset); offset += 1;
    
    // Stream type (1 byte) - 0: Main stream, 1: Sub stream
    body.writeUInt8(0, offset); offset += 1;
    
    // Quality (1 byte) - 0: High, 1: Medium, 2: Low
    body.writeUInt8(1, offset); offset += 1;
    
    // Frame rate (1 byte)
    body.writeUInt8(25, offset); offset += 1;
    
    // Bitrate (4 bytes) - 0 for auto
    body.writeUInt32BE(0, offset); offset += 4;
    
    // Audio enabled (1 byte) - 0: Disabled, 1: Enabled
    body.writeUInt8(1, offset); offset += 1;
    
    // Reserved bytes (14 bytes)
    body.fill(0, offset);
    
    // Calculate message length
    const messageLength = body.length;
    const totalLength = messageLength + 12; // Header + body + markers
    
    // Create header
    const header = Buffer.alloc(10);
    offset = 0;
    
    // Message ID (2 bytes)
    header.writeUInt16BE(0x9101, offset); offset += 2;
    
    // Message body properties (2 bytes)
    header.writeUInt16BE(0x0001, offset); offset += 2;
    
    // Phone number (6 bytes) - Terminal ID
    const phoneBytes = this.config.terminalId.toString().padStart(12, '0');
    for (let i = 0; i < 6; i++) {
      header.writeUInt8(parseInt(phoneBytes.substr(i * 2, 2), 16), offset + i);
    }
    
    // Message body length (2 bytes)
    header.writeUInt16BE(messageLength, 8);
    
    // Escape special characters
    const escapedBody = this.escapeMessage(body);
    const escapedHeader = this.escapeMessage(header);
    
    // Combine all parts
    const message = Buffer.concat([
      startMarker,
      escapedHeader,
      escapedBody,
      endMarker
    ]);
    
    return message;
  }

  /**
   * Escape JT808 message according to protocol
   */
  escapeMessage(buffer) {
    const escaped = [];
    for (let i = 0; i < buffer.length; i++) {
      const byte = buffer[i];
      if (byte === 0x7E) {
        escaped.push(0x7D, 0x02);
      } else if (byte === 0x7D) {
        escaped.push(0x7D, 0x01);
      } else {
        escaped.push(byte);
      }
    }
    return Buffer.from(escaped);
  }

  /**
   * Send streaming command to JT808 server
   */
  async sendStreamingCommand() {
    return new Promise((resolve, reject) => {
      const client = new net.Socket();
      
      client.connect(this.config.serverPort, this.config.serverHost, () => {
        console.log(`🔌 Connected to JT808 server ${this.config.serverHost}:${this.config.serverPort}`);
        
        // Create and send streaming message
        const message = this.createStreamingMessage();
        console.log(`📤 Sending 0x9101 streaming command:`);
        console.log(`   Message ID: 0x9101`);
        console.log(`   Terminal ID: ${this.config.terminalId}`);
        console.log(`   Body Length: ${message.length - 12} bytes`);
        console.log(`   Total Length: ${message.length} bytes`);
        console.log(`   HEX: ${message.toString('hex').toUpperCase()}`);
        
        client.write(message);
        
        // Close connection after sending
        setTimeout(() => {
          client.destroy();
          resolve();
        }, 1000);
      });
      
      client.on('data', (data) => {
        console.log(`📥 Received response: ${data.toString('hex').toUpperCase()}`);
      });
      
      client.on('error', (error) => {
        console.error(`❌ Connection error: ${error.message}`);
        reject(error);
      });
      
      client.on('close', () => {
        console.log(`🔌 Connection closed`);
      });
    });
  }

  /**
   * Start monitoring logs for handshake responses
   */
  startLogMonitoring() {
    if (this.isMonitoring) {
      console.log('⚠️  Already monitoring logs');
      return;
    }
    
    console.log(`📊 Starting log monitoring for handshake responses...`);
    console.log(`   Log file: ${this.config.logFile}`);
    console.log(`   Monitoring patterns: ${this.handshakePatterns.length}`);
    
    this.isMonitoring = true;
    this.lastLogPosition = this.getLogFileSize();
    
    this.monitorInterval = setInterval(() => {
      this.checkLogs();
    }, this.config.monitorInterval);
  }

  /**
   * Stop log monitoring
   */
  stopLogMonitoring() {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
    this.isMonitoring = false;
    console.log('🛑 Log monitoring stopped');
  }

  /**
   * Check logs for new handshake messages
   */
  checkLogs() {
    try {
      if (!fs.existsSync(this.config.logFile)) {
        console.log('⚠️  Log file not found, waiting...');
        return;
      }
      
      const currentSize = this.getLogFileSize();
      if (currentSize < this.lastLogPosition) {
        // Log file was rotated
        this.lastLogPosition = 0;
      }
      
      if (currentSize > this.lastLogPosition) {
        const newContent = this.readLogFile(this.lastLogPosition, currentSize);
        this.lastLogPosition = currentSize;
        
        // Check for handshake patterns
        this.analyzeLogContent(newContent);
      }
    } catch (error) {
      console.error(`❌ Error checking logs: ${error.message}`);
    }
  }

  /**
   * Get log file size
   */
  getLogFileSize() {
    try {
      const stats = fs.statSync(this.config.logFile);
      return stats.size;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Read log file from specific position
   */
  readLogFile(start, end) {
    try {
      const fd = fs.openSync(this.config.logFile, 'r');
      const buffer = Buffer.alloc(end - start);
      fs.readSync(fd, buffer, 0, end - start, start);
      fs.closeSync(fd);
      return buffer.toString();
    } catch (error) {
      return '';
    }
  }

  /**
   * Analyze log content for handshake patterns
   */
  analyzeLogContent(content) {
    const lines = content.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      for (const pattern of this.handshakePatterns) {
        if (pattern.test(line)) {
          this.handleHandshakeMessage(line);
        }
      }
    }
  }

  /**
   * Handle detected handshake message
   */
  handleHandshakeMessage(logLine) {
    const timestamp = new Date().toISOString();
    console.log(`\n🎯 HANDSHAKE DETECTED at ${timestamp}:`);
    console.log(`   ${logLine}`);
    
    // Parse JSON log if possible
    try {
      const logData = JSON.parse(logLine);
      if (logData.message) {
        console.log(`   Message: ${logData.message}`);
      }
      if (logData.timestamp) {
        console.log(`   Server Time: ${logData.timestamp}`);
      }
    } catch (e) {
      // Not JSON, just show the raw line
    }
    
    console.log(`   Pattern matched: Handshake response detected`);
    console.log(`   Status: ✅ Device handshake successful`);
  }

  /**
   * Run the complete streaming trigger and monitoring
   */
  async run() {
    try {
      console.log('🚀 Starting JT808 Streaming Command Trigger and Handshake Monitor');
      console.log('=' .repeat(60));
      
      // Start log monitoring first
      this.startLogMonitoring();
      
      // Wait a moment for monitoring to start
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Send streaming command
      console.log('\n📡 Triggering streaming command...');
      await this.sendStreamingCommand();
      
      console.log('\n⏳ Waiting for device handshake response...');
      console.log('   Monitoring logs for handshake patterns...');
      console.log('   Press Ctrl+C to stop monitoring');
      
      // Keep monitoring for 30 seconds
      setTimeout(() => {
        this.stopLogMonitoring();
        console.log('\n✅ Monitoring completed');
        process.exit(0);
      }, 30000);
      
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      this.stopLogMonitoring();
      process.exit(1);
    }
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  if (global.monitor) {
    global.monitor.stopLogMonitoring();
  }
  process.exit(0);
});

// Run the monitor
if (require.main === module) {
  const monitor = new StreamingHandshakeMonitor();
  global.monitor = monitor;
  monitor.run();
}

module.exports = StreamingHandshakeMonitor;

