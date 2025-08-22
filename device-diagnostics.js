#!/usr/bin/env node

const dgram = require('dgram');
const net = require('net');

class ULVDeviceDiagnostics {
    constructor() {
        this.results = {
            networkConnectivity: false,
            jt808Connection: false,
            streamingHandshake: false,
            rtpConnection: false,
            deviceCapabilities: {}
        };
    }

    // Test 1: Network connectivity
    async testNetworkConnectivity() {
        console.log('\n🔍 Test 1: Network Connectivity');
        console.log('=' .repeat(50));
        
        const { exec } = require('child_process');
        
        return new Promise((resolve) => {
            exec('ping -c 3 192.168.100.1', (error, stdout, stderr) => {
                if (error) {
                    console.log('❌ Device not reachable via ping');
                    this.results.networkConnectivity = false;
                } else {
                    console.log('✅ Device is reachable via ping');
                    this.results.networkConnectivity = true;
                    console.log(stdout.split('\n').slice(-3).join('\n'));
                }
                resolve();
            });
        });
    }

    // Test 2: JT808 connection status
    async testJT808Connection() {
        console.log('\n🔍 Test 2: JT808 Connection Status');
        console.log('=' .repeat(50));
        
        try {
            const { exec } = require('child_process');
            
            return new Promise((resolve) => {
                exec('netstat -an | grep 8808', (error, stdout, stderr) => {
                    if (stdout.includes('192.168.100.1')) {
                        console.log('✅ Device has active JT808 connection');
                        console.log(stdout);
                        this.results.jt808Connection = true;
                    } else {
                        console.log('❌ No active JT808 connection found');
                        this.results.jt808Connection = false;
                    }
                    resolve();
                });
            });
        } catch (error) {
            console.log('❌ Error checking JT808 connection:', error.message);
            resolve();
        }
    }

    // Test 3: Device capabilities query
    async queryDeviceCapabilities() {
        console.log('\n🔍 Test 3: Device Capabilities Query');
        console.log('=' .repeat(50));
        
        // Send terminal parameter query (0x8104) to check device capabilities
        console.log('📤 Sending terminal parameter query...');
        
        try {
            const response = await fetch('http://localhost:3000/api/terminal/query-params', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ terminalId: '628076842334' })
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Device parameters retrieved');
                this.results.deviceCapabilities = data;
            } else {
                console.log('❌ Failed to query device parameters');
            }
        } catch (error) {
            console.log('❌ Error querying device capabilities:', error.message);
        }
    }

    // Test 4: Enhanced RTP monitoring
    async testRTPConnection() {
        console.log('\n🔍 Test 4: Enhanced RTP Connection Test');
        console.log('=' .repeat(50));
        
        return new Promise((resolve) => {
            const server = dgram.createSocket('udp4');
            let packetCount = 0;
            const timeout = 60000; // 60 seconds
            
            server.on('listening', () => {
                console.log('🎥 RTP server listening on 0.0.0.0:8000');
                console.log('⏱️  Monitoring for 60 seconds...');
                
                // Send streaming request
                this.sendStreamingRequest();
                
                // Set timeout
                setTimeout(() => {
                    server.close();
                    if (packetCount === 0) {
                        console.log('❌ No RTP packets received within 60 seconds');
                        this.results.rtpConnection = false;
                    }
                    resolve();
                }, timeout);
            });
            
            server.on('message', (msg, rinfo) => {
                packetCount++;
                console.log(`\n📦 RTP Packet #${packetCount} received!`);
                console.log(`   From: ${rinfo.address}:${rinfo.port}`);
                console.log(`   Size: ${msg.length} bytes`);
                console.log(`   First 16 bytes: ${msg.slice(0, 16).toString('hex')}`);
                
                // Check for ULV frame header
                if (msg.length >= 4) {
                    const frameHeader = msg.readUInt32BE(0);
                    if (frameHeader === 0x30316364) {
                        console.log('✅ Valid ULV RTP packet detected!');
                        this.results.rtpConnection = true;
                        this.parseULVRTP(msg);
                    } else {
                        console.log(`⚠️  Non-ULV packet (header: 0x${frameHeader.toString(16)})`);
                    }
                }
            });
            
            server.on('error', (err) => {
                console.log('❌ RTP server error:', err.message);
                resolve();
            });
            
            server.bind(8000, '0.0.0.0');
        });
    }

    // Send streaming request
    async sendStreamingRequest() {
        console.log('📤 Sending streaming request...');
        
        try {
            const response = await fetch('http://localhost:3000/api/ulv/streaming/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    terminalId: '628076842334',
                    serverIp: '192.168.100.100',
                    serverPort: 8000,
                    dataType: 0,
                    streamType: 0,
                    codeType: 1,
                    memoryType: 0,
                    taskExecuteCondition: 0
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Streaming request sent successfully');
                console.log(`   Session ID: ${data.sessionId}`);
            } else {
                console.log('❌ Failed to send streaming request');
            }
        } catch (error) {
            console.log('❌ Error sending streaming request:', error.message);
        }
    }

    // Parse ULV RTP packet
    parseULVRTP(buffer) {
        try {
            const frameHeader = buffer.readUInt32BE(0);
            const rtpByte = buffer.readUInt8(4);
            const mptByte = buffer.readUInt8(5);
            const sequenceNumber = buffer.readUInt16BE(6);
            
            console.log('🔍 ULV RTP Analysis:');
            console.log(`   Frame Header: 0x${frameHeader.toString(16)}`);
            console.log(`   RTP Version: ${(rtpByte >> 6) & 0x3}`);
            console.log(`   Sequence: ${sequenceNumber}`);
            
            if (buffer.length >= 15) {
                const simCard = buffer.slice(8, 14).toString('hex');
                const channel = buffer.readUInt8(14);
                console.log(`   SIM Card: ${simCard}`);
                console.log(`   Channel: ${channel}`);
            }
        } catch (error) {
            console.log('❌ Error parsing ULV RTP:', error.message);
        }
    }

    // Generate diagnostic report
    generateReport() {
        console.log('\n📋 DIAGNOSTIC REPORT');
        console.log('=' .repeat(50));
        
        console.log(`Network Connectivity: ${this.results.networkConnectivity ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`JT808 Connection: ${this.results.jt808Connection ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`RTP Connection: ${this.results.rtpConnection ? '✅ PASS' : '❌ FAIL'}`);
        
        console.log('\n🎯 RECOMMENDATIONS:');
        
        if (!this.results.networkConnectivity) {
            console.log('❌ Fix network connectivity first');
        } else if (!this.results.jt808Connection) {
            console.log('❌ Establish JT808 connection first');
        } else if (!this.results.rtpConnection) {
            console.log('❌ Device not sending RTP data - check:');
            console.log('   • Device firmware version');
            console.log('   • Device streaming configuration');
            console.log('   • Camera/video hardware status');
            console.log('   • Device logs/debug output');
        } else {
            console.log('✅ All tests passed - streaming should work!');
        }
    }

    // Run all diagnostics
    async runDiagnostics() {
        console.log('🚀 ULV Device Diagnostics Starting...');
        
        await this.testNetworkConnectivity();
        await this.testJT808Connection();
        await this.queryDeviceCapabilities();
        await this.testRTPConnection();
        
        this.generateReport();
    }
}

// Run diagnostics
const diagnostics = new ULVDeviceDiagnostics();
diagnostics.runDiagnostics().catch(console.error);