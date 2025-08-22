#!/usr/bin/env node

/**
 * Analyze JT808 Packets from Capture
 * 
 * This script analyzes the captured packets to detect JT808 protocol patterns
 * in binary data, not just ASCII text.
 */

const fs = require('fs');
const { execSync } = require('child_process');

class JT808PacketAnalyzer {
    constructor() {
        this.captureFile = 'jt808_packets.pcap';
        this.logFile = 'packet_analysis.log';
    }

    log(message) {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] ${message}\n`;
        console.log(logEntry.trim());
        fs.appendFileSync(this.logFile, logEntry);
    }

    analyzePackets() {
        if (!fs.existsSync(this.captureFile)) {
            this.log('❌ Capture file not found. Run packet capture first.');
            return;
        }

        this.log('🔍 Analyzing JT808 Packets from Capture File');
        this.log('============================================');

        try {
            // Get packet count
            const packetCount = execSync(`sudo tcpdump -r ${this.captureFile} 2>/dev/null | wc -l`, { encoding: 'utf8' }).trim();
            this.log(`📦 Total packets captured: ${packetCount}`);

            // Analyze outgoing packets (server → device)
            this.log('\n📤 Analyzing Outgoing Packets (Server → Device):');
            const outgoingPackets = this.getOutgoingPackets();
            this.analyzeOutgoingPackets(outgoingPackets);

            // Analyze incoming packets (device → server)
            this.log('\n📥 Analyzing Incoming Packets (Device → Server):');
            const incomingPackets = this.getIncomingPackets();
            this.analyzeIncomingPackets(incomingPackets);

            // Look for JT808 patterns in binary data
            this.log('\n🔍 Looking for JT808 Protocol Patterns:');
            this.findJT808Patterns();

        } catch (error) {
            this.log(`❌ Error analyzing packets: ${error.message}`);
        }
    }

    getOutgoingPackets() {
        try {
            const output = execSync(`sudo tcpdump -r ${this.captureFile} "src 192.168.100.100 and dst 192.168.100.1" -n -l 2>/dev/null`, { encoding: 'utf8' });
            return output.trim().split('\n').filter(line => line.length > 0);
        } catch (error) {
            this.log(`Error getting outgoing packets: ${error.message}`);
            return [];
        }
    }

    getIncomingPackets() {
        try {
            const output = execSync(`sudo tcpdump -r ${this.captureFile} "src 192.168.100.1 and dst 192.168.100.100" -n -l 2>/dev/null`, { encoding: 'utf8' });
            return output.trim().split('\n').filter(line => line.length > 0);
        } catch (error) {
            this.log(`Error getting incoming packets: ${error.message}`);
            return [];
        }
    }

    analyzeOutgoingPackets(packets) {
        this.log(`   Found ${packets.length} outgoing packets`);
        
        packets.forEach((packet, index) => {
            const parts = packet.split(/\s+/);
            if (parts.length >= 6) {
                const length = parts[parts.length - 1];
                this.log(`   Packet ${index + 1}: ${length} bytes`);
            }
        });

        // Get detailed content of first few packets
        this.log('\n   📋 Detailed Content Analysis:');
        for (let i = 0; i < Math.min(3, packets.length); i++) {
            this.analyzePacketContent(i + 1, 'outgoing');
        }
    }

    analyzeIncomingPackets(packets) {
        this.log(`   Found ${packets.length} incoming packets`);
        
        packets.forEach((packet, index) => {
            const parts = packet.split(/\s+/);
            if (parts.length >= 6) {
                const length = parts[parts.length - 1];
                this.log(`   Packet ${index + 1}: ${length} bytes`);
            }
        });

        // Get detailed content of first few packets
        this.log('\n   📋 Detailed Content Analysis:');
        for (let i = 0; i < Math.min(3, packets.length); i++) {
            this.analyzePacketContent(i + 1, 'incoming');
        }
    }

    analyzePacketContent(packetNum, direction) {
        try {
            const filter = direction === 'outgoing' ? 
                "src 192.168.100.100 and dst 192.168.100.1" : 
                "src 192.168.100.1 and dst 192.168.100.100";
            
            const output = execSync(`sudo tcpdump -r ${this.captureFile} "${filter}" -A -n -c 1 -s 0 2>/dev/null`, { encoding: 'utf8' });
            
            this.log(`\n     📦 ${direction.toUpperCase()} Packet ${packetNum}:`);
            
            // Extract hex data
            const lines = output.split('\n');
            let hexData = '';
            let asciiData = '';
            
            lines.forEach(line => {
                if (line.includes('0x')) {
                    hexData = line.split('0x')[1];
                } else if (line.length > 0 && !line.includes('IP') && !line.includes('Flags')) {
                    asciiData += line;
                }
            });
            
            if (hexData) {
                this.log(`       Hex: ${hexData.substring(0, 100)}...`);
            }
            
            if (asciiData) {
                this.log(`       ASCII: ${asciiData.substring(0, 100)}...`);
            }
            
            // Look for JT808 markers
            if (asciiData.includes('~')) {
                this.log(`       ✅ Contains JT808 markers (~)`);
                this.analyzeJT808Content(asciiData);
            }
            
        } catch (error) {
            this.log(`       ❌ Error analyzing packet ${packetNum}: ${error.message}`);
        }
    }

    analyzeJT808Content(content) {
        // Look for JT808 message patterns
        const patterns = [
            { name: 'Start/End Markers', pattern: /~/g, expected: 2 },
            { name: 'Message ID 0x8105 (Restart)', pattern: /8105|81 05/g, expected: 1 },
            { name: 'Message ID 0x9101 (Streaming)', pattern: /9101|91 01/g, expected: 1 },
            { name: 'Message ID 0x8103 (Parameters)', pattern: /8103|81 03/g, expected: 1 },
            { name: 'Terminal ID Pattern', pattern: /b\.v\.#4|62 80 76 84 23 34/g, expected: 1 }
        ];
        
        patterns.forEach(({ name, pattern, expected }) => {
            const matches = content.match(pattern);
            if (matches) {
                this.log(`         ✅ ${name}: Found ${matches.length} occurrence(s)`);
            } else {
                this.log(`         ❌ ${name}: Not found`);
            }
        });
    }

    findJT808Patterns() {
        this.log('   🔍 Scanning for JT808 Protocol Patterns...');
        
        try {
            // Get all packet content
            const output = execSync(`sudo tcpdump -r ${this.captureFile} -A -n 2>/dev/null`, { encoding: 'utf8' });
            
            // Look for specific patterns
            const patterns = [
                { name: 'JT808 Start Marker (0x7E)', hex: '7e', ascii: '~' },
                { name: 'Restart Command (0x8105)', hex: '8105', ascii: '8105' },
                { name: 'Streaming Command (0x9101)', hex: '9101', ascii: '9101' },
                { name: 'Parameter Setting (0x8103)', hex: '8103', ascii: '8103' },
                { name: 'Terminal ID Pattern', hex: '628076842334', ascii: 'b.v.#4' }
            ];
            
            patterns.forEach(({ name, hex, ascii }) => {
                if (output.includes(hex) || output.includes(ascii)) {
                    this.log(`   ✅ ${name}: Found in packet data`);
                } else {
                    this.log(`   ❌ ${name}: NOT found in packet data`);
                }
            });
            
            // Count JT808 markers
            const markerCount = (output.match(/~/g) || []).length;
            this.log(`   📊 JT808 Markers (~): ${markerCount} found`);
            
            if (markerCount > 0) {
                this.log('   🎉 JT808 Protocol Messages Detected!');
                this.log('   💡 The device IS receiving commands, but may not be responding as expected.');
            } else {
                this.log('   ⚠️  No JT808 markers found. Commands may not be in correct format.');
            }
            
        } catch (error) {
            this.log(`   ❌ Error scanning patterns: ${error.message}`);
        }
    }

    generateReport() {
        this.log('\n📋 ANALYSIS REPORT');
        this.log('==================');
        
        if (fs.existsSync(this.captureFile)) {
            const stats = fs.statSync(this.captureFile);
            this.log(`   Capture file: ${this.captureFile}`);
            this.log(`   File size: ${(stats.size / 1024).toFixed(2)} KB`);
            this.log(`   Analysis time: ${new Date().toISOString()}`);
        }
        
        this.log('\n💡 RECOMMENDATIONS:');
        this.log('   1. If JT808 markers are found: Commands are being sent correctly');
        this.log('   2. If device not responding: Check device protocol compatibility');
        this.log('   3. If no markers found: Check message construction');
        this.log('   4. Monitor device physical behavior for command execution');
    }
}

// Run the analyzer
if (require.main === module) {
    const analyzer = new JT808PacketAnalyzer();
    analyzer.analyzePackets();
    analyzer.generateReport();
}

module.exports = JT808PacketAnalyzer;

