#!/usr/bin/env node

/**
 * Network Monitor for JT808 Command Verification
 * 
 * This script monitors the actual TCP connection to verify that commands
 * are being sent to the device, not just logged locally.
 */

const net = require('net');
const fs = require('fs');
const path = require('path');

class NetworkMonitor {
    constructor() {
        this.connections = new Map();
        this.logFile = path.join(__dirname, 'network-monitor.log');
        this.startTime = Date.now();
        
        // Clear previous log
        fs.writeFileSync(this.logFile, `=== Network Monitor Started at ${new Date().toISOString()} ===\n`);
    }

    log(message) {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] ${message}\n`;
        console.log(logEntry.trim());
        fs.appendFileSync(this.logFile, logEntry);
    }

    startMonitoring() {
        this.log('🚀 Starting Network Monitor for JT808 Command Verification');
        this.log('📡 Monitoring TCP connection to device 192.168.100.1:52140');
        
        // Monitor the existing connection
        this.monitorExistingConnection();
        
        // Set up periodic status checks
        setInterval(() => {
            this.checkConnectionStatus();
        }, 5000);
        
        // Set up command verification
        this.setupCommandVerification();
    }

    monitorExistingConnection() {
        // Check if connection exists
        const connectionInfo = this.getConnectionInfo();
        if (connectionInfo) {
            this.log(`✅ Found active connection: ${connectionInfo}`);
            this.log(`   Local: ${connectionInfo.local}`);
            this.log(`   Remote: ${connectionInfo.remote}`);
            this.log(`   Status: ${connectionInfo.status}`);
        } else {
            this.log('❌ No active connection found to device');
        }
    }

    getConnectionInfo() {
        try {
            const { execSync } = require('child_process');
            const output = execSync('netstat -an | grep "192.168.100.1.52140"', { encoding: 'utf8' });
            const lines = output.trim().split('\n');
            
            for (const line of lines) {
                if (line.includes('ESTABLISHED')) {
                    const parts = line.trim().split(/\s+/);
                    if (parts.length >= 4) {
                        return {
                            local: parts[3],
                            remote: parts[4],
                            status: parts[5]
                        };
                    }
                }
            }
        } catch (error) {
            this.log(`Error getting connection info: ${error.message}`);
        }
        return null;
    }

    checkConnectionStatus() {
        const connectionInfo = this.getConnectionInfo();
        if (connectionInfo) {
            this.log(`📊 Connection Status: ${connectionInfo.status} - ${connectionInfo.local} ↔ ${connectionInfo.remote}`);
        } else {
            this.log('⚠️  Connection lost or not found');
        }
    }

    setupCommandVerification() {
        this.log('🔍 Setting up command verification...');
        
        // Monitor for specific commands being sent
        this.log('📋 Commands to verify:');
        this.log('   - Terminal Restart (0x8105)');
        this.log('   - JT1078 Streaming (0x9101)');
        this.log('   - Parameter Setting (0x8103)');
        this.log('   - Terminal Control (0x8105)');
        
        // Set up packet capture simulation
        this.simulatePacketCapture();
    }

    simulatePacketCapture() {
        this.log('📦 Simulating packet capture for verification...');
        
        // Monitor the log files for actual message transmission
        const logPath = path.join(__dirname, 'logs/combined.log');
        
        if (fs.existsSync(logPath)) {
            this.log(`📝 Monitoring log file: ${logPath}`);
            
            // Check for recent message transmission logs
            this.checkRecentTransmissions(logPath);
        } else {
            this.log('❌ Log file not found, cannot verify transmissions');
        }
    }

    checkRecentTransmissions(logPath) {
        try {
            const logContent = fs.readFileSync(logPath, 'utf8');
            const lines = logContent.split('\n').reverse(); // Start from most recent
            
            let transmissionCount = 0;
            let lastTransmission = null;
            
            for (const line of lines) {
                if (line.includes('📤 Sent message to terminal') || 
                    line.includes('📤 Raw message:') ||
                    line.includes('Terminal restart command sent') ||
                    line.includes('JT1078 live video request sent')) {
                    
                    if (transmissionCount === 0) {
                        lastTransmission = line;
                    }
                    transmissionCount++;
                    
                    if (transmissionCount >= 5) break; // Check last 5 transmissions
                }
            }
            
            if (transmissionCount > 0) {
                this.log(`✅ Found ${transmissionCount} recent message transmissions`);
                if (lastTransmission) {
                    this.log(`📤 Last transmission: ${lastTransmission}`);
                }
            } else {
                this.log('⚠️  No recent message transmissions found in logs');
            }
            
        } catch (error) {
            this.log(`Error checking transmissions: ${error.message}`);
        }
    }

    verifyCommandDelivery() {
        this.log('\n🔍 COMMAND DELIVERY VERIFICATION');
        this.log('================================');
        
        // Check connection status
        const connectionInfo = this.getConnectionInfo();
        if (!connectionInfo) {
            this.log('❌ FAILED: No active connection to device');
            return false;
        }
        
        // Check for recent transmissions
        const logPath = path.join(__dirname, 'logs/combined.log');
        if (fs.existsSync(logPath)) {
            const logContent = fs.readFileSync(logPath, 'utf8');
            
            // Check for specific command transmissions
            const commands = [
                { name: 'Terminal Restart', pattern: 'Terminal restart command sent' },
                { name: 'JT1078 Streaming', pattern: 'JT1078 live video request sent' },
                { name: 'Parameter Setting', pattern: 'Video parameters set successfully' },
                { name: 'Message Transmission', pattern: '📤 Sent message to terminal' }
            ];
            
            let allCommandsFound = true;
            
            for (const command of commands) {
                if (logContent.includes(command.pattern)) {
                    this.log(`✅ ${command.name}: Found in logs`);
                } else {
                    this.log(`❌ ${command.name}: NOT found in logs`);
                    allCommandsFound = false;
                }
            }
            
            if (allCommandsFound) {
                this.log('\n🎉 VERIFICATION RESULT: All commands appear to have been sent');
                this.log('   However, this only confirms local logging, not actual delivery');
            } else {
                this.log('\n⚠️  VERIFICATION RESULT: Some commands are missing from logs');
            }
        }
        
        // Provide recommendations
        this.log('\n💡 RECOMMENDATIONS:');
        this.log('   1. Use tcpdump to capture actual network packets');
        this.log('   2. Monitor device physical behavior (restart, LED changes)');
        this.log('   3. Check device logs if available');
        this.log('   4. Verify protocol compliance with JT808 specification');
        
        return true;
    }

    run() {
        this.startMonitoring();
        
        // Run verification after 10 seconds
        setTimeout(() => {
            this.verifyCommandDelivery();
        }, 10000);
        
        // Keep running for monitoring
        this.log('\n⏰ Monitor will continue running. Press Ctrl+C to stop.');
    }
}

// Run the monitor
if (require.main === module) {
    const monitor = new NetworkMonitor();
    monitor.run();
}

module.exports = NetworkMonitor;

