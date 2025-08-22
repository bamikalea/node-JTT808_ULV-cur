#!/usr/bin/env node

const dgram = require('dgram');
const { spawn } = require('child_process');

/**
 * Advanced Network Monitoring for ULV Streaming
 * Monitors all network traffic between device and server
 */

class NetworkMonitor {
    constructor() {
        this.deviceIP = '192.168.100.1';
        this.serverIP = '192.168.100.100';
        this.jt808Port = 8808;
        this.rtpPort = 8000;
        this.monitoring = false;
    }

    // Monitor JT808 control messages
    monitorJT808Traffic() {
        console.log('🔍 Monitoring JT808 Control Traffic...');
        
        // Use tcpdump to monitor JT808 port
        const tcpdump = spawn('tcpdump', [
            '-i', 'any',
            '-n',
            '-X',
            `host ${this.deviceIP} and port ${this.jt808Port}`
        ]);

        tcpdump.stdout.on('data', (data) => {
            const output = data.toString();
            if (output.includes('9101') || output.includes('0001')) {
                console.log('📨 JT808 Streaming Message Detected:');
                console.log(output);
            }
        });

        return tcpdump;
    }

    // Monitor RTP port for incoming connections
    monitorRTPTraffic() {
        console.log('🎥 Monitoring RTP Traffic on Port 8000...');
        
        const server = dgram.createSocket('udp4');
        
        server.on('listening', () => {
            console.log(`✅ RTP monitor listening on ${this.serverIP}:${this.rtpPort}`);
        });

        server.on('message', (msg, rinfo) => {
            console.log(`\n📦 UDP Packet Received:`);
            console.log(`   From: ${rinfo.address}:${rinfo.port}`);
            console.log(`   Size: ${msg.length} bytes`);
            console.log(`   Time: ${new Date().toISOString()}`);
            
            // Check if it's from our device
            if (rinfo.address === this.deviceIP) {
                console.log('🎯 Packet from ULV device!');
                this.analyzePacket(msg);
            } else {
                console.log('⚠️  Packet from unknown source');
            }
        });

        server.on('error', (err) => {
            console.error('❌ RTP monitor error:', err.message);
        });

        server.bind(this.rtpPort, this.serverIP);
        return server;
    }

    // Analyze received packet
    analyzePacket(buffer) {
        console.log('🔍 Packet Analysis:');
        console.log(`   Hex: ${buffer.toString('hex')}`);
        
        if (buffer.length >= 4) {
            const firstDword = buffer.readUInt32BE(0);
            console.log(`   First DWORD: 0x${firstDword.toString(16)}`);
            
            if (firstDword === 0x30316364) {
                console.log('✅ ULV RTP Frame Header Detected!');
                this.parseULVRTP(buffer);
            } else {
                console.log('❓ Unknown packet format');
            }
        }
    }

    // Parse ULV RTP packet
    parseULVRTP(buffer) {
        try {
            if (buffer.length < 15) {
                console.log('⚠️  Packet too short for ULV RTP');
                return;
            }

            const frameHeader = buffer.readUInt32BE(0);
            const rtpByte = buffer.readUInt8(4);
            const mptByte = buffer.readUInt8(5);
            const sequence = buffer.readUInt16BE(6);
            const simCard = buffer.slice(8, 14).toString('hex');
            const channel = buffer.readUInt8(14);

            console.log('📋 ULV RTP Packet Details:');
            console.log(`   Frame Header: 0x${frameHeader.toString(16)} ✅`);
            console.log(`   RTP Version: ${(rtpByte >> 6) & 0x3}`);
            console.log(`   Padding: ${(rtpByte >> 5) & 0x1}`);
            console.log(`   Extension: ${(rtpByte >> 4) & 0x1}`);
            console.log(`   CSRC Count: ${rtpByte & 0xF}`);
            console.log(`   Marker: ${(mptByte >> 7) & 0x1}`);
            console.log(`   Payload Type: ${mptByte & 0x7F}`);
            console.log(`   Sequence: ${sequence}`);
            console.log(`   SIM Card: ${simCard}`);
            console.log(`   Channel: ${channel}`);
            console.log(`   Payload Size: ${buffer.length - 15} bytes`);

        } catch (error) {
            console.error('❌ Error parsing ULV RTP:', error.message);
        }
    }

    // Monitor all network interfaces
    monitorAllInterfaces() {
        console.log('🌐 Monitoring All Network Interfaces...');
        
        const tcpdump = spawn('tcpdump', [
            '-i', 'any',
            '-n',
            `host ${this.deviceIP}`
        ]);

        tcpdump.stdout.on('data', (data) => {
            const output = data.toString();
            console.log('📡 Network Activity:', output.trim());
        });

        return tcpdump;
    }

    // Send streaming request and monitor response
    async sendStreamingRequestAndMonitor() {
        console.log('📤 Sending Streaming Request...');
        
        try {
            const response = await fetch('http://localhost:3000/api/ulv/streaming/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    terminalId: '628076842334',
                    serverIp: this.serverIP,
                    serverPort: this.rtpPort,
                    dataType: 0,
                    streamType: 0,
                    codeType: 1,
                    memoryType: 0,
                    taskExecuteCondition: 0
                })
            });

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Streaming request sent');
                console.log(`   Session ID: ${data.sessionId}`);
                return data.sessionId;
            } else {
                console.log('❌ Failed to send streaming request');
                return null;
            }
        } catch (error) {
            console.error('❌ Error sending request:', error.message);
            return null;
        }
    }

    // Start comprehensive monitoring
    async startMonitoring() {
        console.log('🚀 Starting Comprehensive Network Monitoring');
        console.log('=' .repeat(60));
        console.log(`Device IP: ${this.deviceIP}`);
        console.log(`Server IP: ${this.serverIP}`);
        console.log(`JT808 Port: ${this.jt808Port}`);
        console.log(`RTP Port: ${this.rtpPort}`);
        console.log('=' .repeat(60));

        this.monitoring = true;

        // Start RTP monitoring
        const rtpServer = this.monitorRTPTraffic();

        // Wait a moment for server to start
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Send streaming request
        const sessionId = await this.sendStreamingRequestAndMonitor();

        if (sessionId) {
            console.log('\n⏱️  Monitoring for 120 seconds...');
            console.log('   Press Ctrl+C to stop monitoring');

            // Monitor for 2 minutes
            setTimeout(() => {
                console.log('\n⏰ Monitoring timeout reached');
                this.stopMonitoring(rtpServer);
            }, 120000);
        } else {
            console.log('❌ Could not send streaming request');
            this.stopMonitoring(rtpServer);
        }
    }

    // Stop monitoring
    stopMonitoring(rtpServer) {
        console.log('\n🛑 Stopping network monitoring...');
        this.monitoring = false;
        
        if (rtpServer) {
            rtpServer.close();
        }
        
        console.log('✅ Monitoring stopped');
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Received interrupt signal');
    process.exit(0);
});

// Start monitoring
const monitor = new NetworkMonitor();
monitor.startMonitoring().catch(console.error);