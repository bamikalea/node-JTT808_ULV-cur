#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class MediaMonitor {
  constructor() {
    this.mediaDir = 'media';
    this.uploadsDir = path.join(this.mediaDir, 'uploads');
    this.terminalId = '628076842334'; // Current connected terminal
    this.terminalDir = path.join(this.uploadsDir, this.terminalId);
    
    this.ensureDirectories();
    this.startMonitoring();
  }

  ensureDirectories() {
    // Create main media directories
    const dirs = [
      this.mediaDir,
      this.uploadsDir,
      this.terminalDir,
      path.join(this.mediaDir, 'images'),
      path.join(this.mediaDir, 'audio'),
      path.join(this.mediaDir, 'video'),
      path.join(this.mediaDir, 'raw')
    ];

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✅ Created directory: ${dir}`);
      }
    });
  }

  startMonitoring() {
    console.log('🎥 Starting Media File Monitor...');
    console.log(`📁 Monitoring terminal: ${this.terminalId}`);
    console.log(`📂 Files will be saved to: ${this.terminalDir}`);
    console.log('⏳ Waiting for media file uploads...\n');

    // Monitor logs for media uploads
    const tailProcess = spawn('tail', ['-f', 'logs/combined.log']);
    
    let buffer = '';
    
    tailProcess.stdout.on('data', (data) => {
      buffer += data.toString();
      
      // Process complete lines
      const lines = buffer.split('\n');
      buffer = lines.pop(); // Keep incomplete line in buffer
      
      lines.forEach(line => {
        if (line.trim()) {
          this.processLogLine(line);
        }
      });
    });

    tailProcess.stderr.on('data', (data) => {
      console.error(`❌ Tail error: ${data}`);
    });

    tailProcess.on('close', (code) => {
      console.log(`🔄 Tail process closed with code ${code}`);
      // Restart monitoring after a delay
      setTimeout(() => this.startMonitoring(), 5000);
    });

    // Also monitor the media directory for new files
    this.monitorMediaDirectory();
  }

  processLogLine(line) {
    try {
      // Parse JSON log line
      const logEntry = JSON.parse(line);
      
      // Check for multimedia events
      if (logEntry.message && logEntry.message.includes('Multimedia event')) {
        this.handleMultimediaEvent(logEntry);
      }
      
      // Check for multimedia data uploads
      if (logEntry.message && logEntry.message.includes('Received message') && logEntry.message.includes('801')) {
        this.handleMultimediaDataUpload(logEntry);
      }
      
      // Check for file save confirmations
      if (logEntry.message && logEntry.message.includes('File saved successfully')) {
        this.handleFileSaved(logEntry);
      }
      
      // Check for ULV protocol violations
      if (logEntry.message && logEntry.message.includes('ULV Protocol Violation')) {
        this.handleProtocolViolation(logEntry);
      }
      
    } catch (error) {
      // Not a JSON line, ignore
    }
  }

  handleMultimediaEvent(logEntry) {
    const match = logEntry.message.match(/Multimedia event (\d+) registered/);
    if (match) {
      const eventId = match[1];
      console.log(`📸 Multimedia event ${eventId} registered - waiting for data upload`);
    }
  }

  handleMultimediaDataUpload(logEntry) {
    console.log(`📤 Multimedia data upload received (0x0801)`);
    console.log(`   Time: ${logEntry.timestamp}`);
    console.log(`   Service: ${logEntry.service}`);
  }

  handleFileSaved(logEntry) {
    console.log(`💾 Media file saved successfully!`);
    console.log(`   ${logEntry.message}`);
  }

  handleProtocolViolation(logEntry) {
    console.log(`⚠️  ULV Protocol Violation detected:`);
    console.log(`   ${logEntry.message}`);
  }

  monitorMediaDirectory() {
    console.log(`📂 Monitoring media directory: ${this.mediaDir}`);
    
    // Check for new files every 5 seconds
    setInterval(() => {
      this.checkForNewFiles();
    }, 5000);
  }

  checkForNewFiles() {
    try {
      // Check terminal-specific uploads
      if (fs.existsSync(this.terminalDir)) {
        const files = fs.readdirSync(this.terminalDir);
        if (files.length > 0) {
          console.log(`📁 Terminal ${this.terminalId} has ${files.length} media files`);
          
          files.forEach(file => {
            const filepath = path.join(this.terminalDir, file);
            const stats = fs.statSync(filepath);
            const sizeKB = (stats.size / 1024).toFixed(2);
            
            console.log(`   📄 ${file} (${sizeKB} KB)`);
          });
        }
      }

      // Check type-specific directories
      ['images', 'audio', 'video'].forEach(type => {
        const typeDir = path.join(this.mediaDir, type);
        if (fs.existsSync(typeDir)) {
          const files = fs.readdirSync(typeDir);
          if (files.length > 0) {
            console.log(`📁 ${type.charAt(0).toUpperCase() + type.slice(1)} directory: ${files.length} files`);
          }
        }
      });

    } catch (error) {
      console.error(`❌ Error checking media directory: ${error.message}`);
    }
  }

  // Utility function to analyze media files
  analyzeMediaFile(filepath) {
    try {
      const stats = fs.statSync(filepath);
      const buffer = fs.readFileSync(filepath);
      
      console.log(`🔍 Analyzing media file: ${path.basename(filepath)}`);
      console.log(`   Size: ${(stats.size / 1024).toFixed(2)} KB`);
      console.log(`   Created: ${stats.birthtime}`);
      
      // Analyze file header for format detection
      if (buffer.length >= 4) {
        const header = buffer.slice(0, 4);
        const headerHex = header.toString('hex').toUpperCase();
        
        console.log(`   Header: ${headerHex}`);
        
        if (header[0] === 0xFF && header[1] === 0xD8) {
          console.log(`   ✅ Detected: JPEG image`);
        } else if (header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4E && header[3] === 0x47) {
          console.log(`   ✅ Detected: PNG image`);
        } else if (header[0] === 0x52 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x46) {
          console.log(`   ✅ Detected: WAV audio`);
        } else if (header[0] === 0x00 && header[1] === 0x00 && header[2] === 0x00 && header[3] === 0x18) {
          console.log(`   ✅ Detected: MP4 video`);
        } else {
          console.log(`   ❓ Unknown format`);
        }
      }
      
      console.log(''); // Empty line for readability
      
    } catch (error) {
      console.error(`❌ Error analyzing file ${filepath}: ${error.message}`);
    }
  }
}

// Start the media monitor
const monitor = new MediaMonitor();

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Media Monitor...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down Media Monitor...');
  process.exit(0);
});
