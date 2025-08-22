#!/usr/bin/env node

/**
 * Audio/Video Streaming Test Script
 * Tests the ULV Protocol streaming implementation
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const TERMINAL_ID = '628076842334';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testStreaming() {
  log('\n🎥 Audio/Video Streaming Test (ULV Protocol)', 'cyan');
  log('=' .repeat(60), 'cyan');

  try {
    // Test 1: Start Streaming
    log('\n1️⃣ Starting Audio/Video Streaming...', 'yellow');
    const startResponse = await axios.post(`${BASE_URL}/api/streaming/start`, {
      terminalId: TERMINAL_ID,
      channelNumber: 1,
      streamType: 0, // All streams
      quality: 1,    // High quality
      frameRate: 25, // 25 FPS
      bitrate: 0,    // Auto bitrate
      audioEnabled: true,
      videoEnabled: true
    });

    if (startResponse.data.success) {
      const sessionId = startResponse.data.sessionId;
      log(`✅ Streaming started successfully!`, 'green');
      log(`   Session ID: ${sessionId}`, 'green');
      log(`   Channel: ${startResponse.data.details.channelNumber}`, 'green');
      log(`   Quality: ${startResponse.data.details.quality}`, 'green');
      log(`   Frame Rate: ${startResponse.data.details.frameRate}`, 'green');

      // Test 2: Get Streaming Status
      log('\n2️⃣ Getting Streaming Status...', 'yellow');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      
      const statusResponse = await axios.get(`${BASE_URL}/api/streaming/status/${TERMINAL_ID}?sessionId=${sessionId}`);
      
      if (statusResponse.data.success) {
        const status = statusResponse.data.status;
        log(`✅ Streaming Status Retrieved:`, 'green');
        log(`   Status: ${status.status}`, 'green');
        log(`   Start Time: ${status.startTime}`, 'green');
        log(`   Total Bytes: ${status.totalBytes || 0}`, 'green');
        log(`   Total Packets: ${status.totalPackets || 0}`, 'green');
      }

      // Test 3: Get Streaming Statistics
      log('\n3️⃣ Getting Streaming Statistics...', 'yellow');
      const statsResponse = await axios.get(`${BASE_URL}/api/streaming/stats/${TERMINAL_ID}/${sessionId}`);
      
      if (statsResponse.data.success) {
        const stats = statsResponse.data.stats;
        log(`✅ Streaming Statistics Retrieved:`, 'green');
        log(`   Duration: ${Math.round(stats.duration / 1000)}s`, 'green');
        log(`   Average Packet Size: ${stats.averagePacketSize} bytes`, 'green');
        log(`   Bitrate: ${stats.bitrate}`, 'green');
        log(`   Frame Rate: ${stats.frameRate}`, 'green');
      }

      // Test 4: List All Streaming Sessions
      log('\n4️⃣ Listing All Streaming Sessions...', 'yellow');
      const sessionsResponse = await axios.get(`${BASE_URL}/api/streaming/sessions`);
      
      if (sessionsResponse.data.success) {
        const sessions = sessionsResponse.data.sessions;
        log(`✅ Found ${sessions.length} streaming session(s):`, 'green');
        sessions.forEach((session, index) => {
          log(`   ${index + 1}. Session: ${session.sessionId}`, 'green');
          log(`      Status: ${session.status}`, 'green');
          log(`      Channel: ${session.channelNumber}`, 'green');
          log(`      Bytes: ${session.totalBytes}`, 'green');
        });
      }

      // Test 5: Stop Streaming
      log('\n5️⃣ Stopping Streaming...', 'yellow');
      await new Promise(resolve => setTimeout(resolve, 3000)); // Let it run for 3 seconds
      
      const stopResponse = await axios.post(`${BASE_URL}/api/streaming/stop`, {
        terminalId: TERMINAL_ID,
        sessionId: sessionId
      });

      if (stopResponse.data.success) {
        log(`✅ Streaming stopped successfully!`, 'green');
        log(`   Session: ${stopResponse.data.sessionId}`, 'green');
      }

      // Test 6: Final Status Check
      log('\n6️⃣ Final Status Check...', 'yellow');
      const finalStatusResponse = await axios.get(`${BASE_URL}/api/streaming/status/${TERMINAL_ID}?sessionId=${sessionId}`);
      
      if (finalStatusResponse.data.success) {
        const finalStatus = finalStatusResponse.data.status;
        log(`✅ Final Status:`, 'green');
        log(`   Status: ${finalStatus.status}`, 'green');
        log(`   Duration: ${Math.round(finalStatus.duration / 1000)}s`, 'green');
        log(`   Total Bytes: ${finalStatus.totalBytes}`, 'green');
        log(`   Total Packets: ${finalStatus.totalPackets}`, 'green');
      }

    } else {
      log(`❌ Failed to start streaming: ${startResponse.data.error}`, 'red');
    }

  } catch (error) {
    if (error.response) {
      log(`❌ HTTP Error: ${error.response.status} - ${error.response.data.error || error.message}`, 'red');
    } else {
      log(`❌ Network Error: ${error.message}`, 'red');
    }
  }

  log('\n🎬 Streaming Test Completed!', 'cyan');
  log('=' .repeat(60), 'cyan');
}

// Test different streaming configurations
async function testStreamingConfigurations() {
  log('\n🔧 Testing Different Streaming Configurations', 'magenta');
  log('=' .repeat(60), 'magenta');

  const configs = [
    {
      name: 'High Quality Video + Audio',
      config: { quality: 1, frameRate: 30, audioEnabled: true, videoEnabled: true }
    },
    {
      name: 'Medium Quality Video Only',
      config: { quality: 2, frameRate: 25, audioEnabled: false, videoEnabled: true }
    },
    {
      name: 'Low Quality Audio Only',
      config: { quality: 3, frameRate: 15, audioEnabled: true, videoEnabled: false }
    },
    {
      name: 'Auto Quality All Streams',
      config: { quality: 0, streamType: 0, audioEnabled: true, videoEnabled: true }
    }
  ];

  for (const testConfig of configs) {
    try {
      log(`\n🎥 Testing: ${testConfig.name}`, 'yellow');
      
      const startResponse = await axios.post(`${BASE_URL}/api/streaming/start`, {
        terminalId: TERMINAL_ID,
        channelNumber: 1,
        ...testConfig.config
      });

      if (startResponse.data.success) {
        const sessionId = startResponse.data.sessionId;
        log(`✅ Started: ${testConfig.name}`, 'green');
        log(`   Session: ${sessionId}`, 'green');
        
        // Let it run for a bit
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Stop it
        await axios.post(`${BASE_URL}/api/streaming/stop`, {
          terminalId: TERMINAL_ID,
          sessionId: sessionId
        });
        
        log(`🛑 Stopped: ${testConfig.name}`, 'green');
      }
      
    } catch (error) {
      log(`❌ Failed: ${testConfig.name} - ${error.message}`, 'red');
    }
  }
}

// Main test execution
async function main() {
  log('🚀 Starting ULV Protocol Streaming Tests...', 'bright');
  
  try {
    // Test basic streaming functionality
    await testStreaming();
    
    // Test different configurations
    await testStreamingConfigurations();
    
  } catch (error) {
    log(`💥 Test execution failed: ${error.message}`, 'red');
  }
  
  log('\n✨ All tests completed!', 'bright');
}

// Run tests if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testStreaming, testStreamingConfigurations };
