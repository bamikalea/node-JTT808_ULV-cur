#!/usr/bin/env node

/**
 * RTP Streaming Monitor
 * Monitors multiple ports for RTP streaming data from ULV devices
 */

const dgram = require('dgram');
const fs = require('fs');

class RTPStreamingMonitor {
    constructor() {
        this.servers = new Map();
        this.packetCounts = new Map();
        this.startTime = Date.now();
        
        // Ports to monitor
        this.ports = [8000, 1935, 1936, 8001, 8002];
        
        this.setupServers();
        this.startMonitoring();
    }

    setupServers() {
        this.ports.forEach(port => {
            const server = dgram.createSocket('udp4');
            
            server.on('listening', () => {
                const address = server.address();
                console.log(`🎥 RTP Monitor listening on port ${address.port}`);
                this.packetCounts.set(port, 0);
            });

            server.on('message', (msg, rinfo) => {
                this.handleRTPPacket(msg, rinfo, port);
            });

            server.on('error', (err) => {
                console.error(`❌ Server error on port ${port}: ${err.message}`);
            });

            server.bind(port, '0.0.0.0');
            this.servers.set(port, server);
        });
    }

    handleRTPPacket(buffer, rinfo, port) {
        const count = this.packetCounts.get(port) + 1;
        this.packetCounts.set(port, count);
        
        const timestamp = new Date().toISOString();
        console.log(`\n📦 RTP Packet #${count} on port ${port} from ${rinfo.address}:${rinfo.port}`);
        console.log(`📏 Size: ${buffer.length} bytes`);
        console.log(`⏰ Time: ${timestamp}`);
        
        // Analyze packet format
        this.analyzeRTPPacket(buffer, port);
        
        // Log to file
        const logEntry = `${timestamp} - Port ${port} - Packet #${count} - ${buffer.length} bytes from ${rinfo.address}:${rinfo.port}\n`;
        fs.appendFileSync('rtp-streaming.log', logEntry);
        
        // Save first few packets for analysis
        if (count <= 3) {
            const filename = `rtp-packet-port${port}-${count}.bin`;
            fs.writeFileSync(filename, buffer);
            console.log(`💾 Saved packet to ${filename}`);
        }
    }

    analyzeRTPPacket(buffer, port) {
        if (buffer.length < 12) {
            console.log(`⚠️  Packet too short for RTP analysis: ${buffer.length} bytes`);
            return;
        }

        try {
            // Check for ULV RTP format (starts with 0x30316364)
            if (buffer.length >= 4) {
                const frameHeader = buffer.readUInt32BE(0);
                if (frameHeader === 0x30316364) {
                    console.log(`✅ ULV RTP Format Detected!`);
                    this.analyzeULVRTP(buffer);
                    return;
                }
            }

            // Standard RTP analysis
            const version = (buffer[0] >> 6) & 0x3;
            const padding = (buffer[0] >> 5) & 0x1;
            const extension = (buffer[0] >> 4) & 0x1;
            const csrcCount = buffer[0] & 0xF;
            const marker = (buffer[1] >> 7) & 0x1;
            const payloadType = buffer[1] & 0x7F;
            const sequenceNumber = buffer.readUInt16BE(2);
            const timestamp = buffer.readUInt32BE(4);
            const ssrc = buffer.readUInt32BE(8);

            console.log(`🔍 RTP Analysis:`);
            console.log(`  Version: ${version} ${version === 2 ? '✅' : '❌'}`);
            console.log(`  Padding: ${padding}, Extension: ${extension}, CSRC: ${csrcCount}`);
            console.log(`  Marker: ${marker}, Payload Type: ${payloadType}`);
            console.log(`  Sequence: ${sequenceNumber}, Timestamp: ${timestamp}`);
            console.log(`  SSRC: 0x${ssrc.toString(16)}`);
            
            if (version === 2) {
                console.log(`✅ Valid RTP packet detected!`);
            }

        } catch (error) {
            console.error(`❌ Error analyzing packet: ${error.message}`);
        }

        // Show hex dump of first 32 bytes
        const hexDump = buffer.slice(0, Math.min(32, buffer.length)).toString('hex');
        console.log(`📄 Hex dump (first 32 bytes): ${hexDump}`);
    }

    analyzeULVRTP(buffer) {
        try {
            const frameHeader = buffer.readUInt32BE(0);
            const rtpByte = buffer.readUInt8(4);
            const mptByte = buffer.readUInt8(5);
            const sequenceNumber = buffer.readUInt16BE(6);
            const simCard = buffer.slice(8, 14).toString('hex');
            const channelNumber = buffer.readUInt8(14);

            console.log(`🔍 ULV RTP Analysis:`);
            console.log(`  Frame Header: 0x${frameHeader.toString(16)} ✅`);
            console.log(`  RTP Version: ${(rtpByte >> 6) & 0x3}`);
            console.log(`  Payload Type: ${mptByte & 0x7F}`);
            console.log(`  Sequence: ${sequenceNumber}`);
            console.log(`  SIM Card: ${simCard}`);
            console.log(`  Channel: ${channelNumber}`);

        } catch (error) {
            console.error(`❌ Error analyzing ULV RTP: ${error.message}`);
        }
    }

    startMonitoring() {
        console.log(`🚀 RTP Streaming Monitor Started`);
        console.log(`📡 Monitoring ports: ${this.ports.join(', ')}`);
        console.log(`⏰ Started at: ${new Date().toISOString()}`);
        console.log(`📝 Logging to: rtp-streaming.log`);
        console.log(`\n🎯 Waiting for RTP packets...`);

        // Status updates every 30 seconds
        setInterval(() => {
            this.printStatus();
        }, 30000);
    }

    printStatus() {
        const elapsed = Math.round((Date.now() - this.startTime) / 1000);
        console.log(`\n📊 Status Update (${elapsed}s elapsed):`);
        
        let totalPackets = 0;
        this.ports.forEach(port => {
            const count = this.packetCounts.get(port) || 0;
            totalPackets += count;
            console.log(`  Port ${port}: ${count} packets`);
        });
        
        console.log(`  Total: ${totalPackets} packets received`);
        
        if (totalPackets === 0) {
            console.log(`\n💡 No RTP packets detected yet. Try:`);
            console.log(`   1. Check if device is streaming`);
            console.log(`   2. Verify network connectivity`);
            console.log(`   3. Check firewall settings`);
            console.log(`   4. Monitor server logs for streaming requests`);
        }
    }

    stop() {
        console.log(`\n🛑 Stopping RTP Monitor...`);
        this.servers.forEach((server, port) => {
            server.close();
            console.log(`   Closed port ${port}`);
        });
        
        this.printStatus();
        console.log(`📝 Check rtp-streaming.log for detailed logs`);
    }
}

// Start monitoring
const monitor = new RTPStreamingMonitor();

// Graceful shutdown
process.on('SIGINT', () => {
    monitor.stop();
    process.exit(0);
});

process.on('SIGTERM', () => {
    monitor.stop();
    process.exit(0);
});