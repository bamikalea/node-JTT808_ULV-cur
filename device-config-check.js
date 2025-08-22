#!/usr/bin/env node

/**
 * Device Configuration Verification for ULV Streaming
 * Checks device parameters that might affect streaming capability
 */

class DeviceConfigChecker {
    constructor() {
        this.terminalId = '628076842334';
        this.requiredParams = {
            // Video-related parameters
            '0x0064': 'Video recording resolution',
            '0x0065': 'Video recording quality',
            '0x0066': 'Video recording length',
            '0x0067': 'Video recording save flag',
            '0x0070': 'Image/video upload setting',
            '0x0071': 'Image/video upload quality',
            '0x0072': 'Image/video upload size',
            '0x0073': 'Image/video upload format',
            
            // Network parameters
            '0x0013': 'Main server APN',
            '0x0014': 'Main server username',
            '0x0015': 'Main server password',
            '0x0016': 'Main server address',
            '0x0017': 'Backup server APN',
            '0x0018': 'Backup server username',
            '0x0019': 'Backup server password',
            '0x001A': 'Backup server address',
            
            // Device capabilities
            '0x0001': 'Heartbeat interval',
            '0x0002': 'TCP timeout',
            '0x0003': 'TCP retransmission times',
            '0x0004': 'UDP timeout',
            '0x0005': 'UDP retransmission times'
        };
    }

    // Query specific terminal parameters
    async queryTerminalParams() {
        console.log('🔍 Querying Device Configuration Parameters...');
        console.log('=' .repeat(60));
        
        // Create parameter query message (0x8104)
        const paramIds = Object.keys(this.requiredParams).map(id => parseInt(id, 16));
        
        try {
            // This would need to be implemented in the JT808 server
            console.log('📤 Sending parameter query (0x8104)...');
            console.log(`   Terminal ID: ${this.terminalId}`);
            console.log(`   Parameters: ${paramIds.length} items`);
            
            // For now, simulate the query
            console.log('⚠️  Parameter query API not implemented yet');
            console.log('   Need to add 0x8104 message handler to JT808 server');
            
            return this.simulateParameterResponse();
            
        } catch (error) {
            console.error('❌ Error querying parameters:', error.message);
            return null;
        }
    }

    // Simulate parameter response for demonstration
    simulateParameterResponse() {
        return {
            '0x0001': 30,      // Heartbeat interval: 30 seconds
            '0x0002': 120,     // TCP timeout: 120 seconds
            '0x0016': '192.168.100.100:8808',  // Main server address
            '0x0064': 2,       // Video resolution: 720P
            '0x0065': 5,       // Video quality: Medium
            '0x0070': 1        // Video upload enabled
        };
    }

    // Check device streaming prerequisites
    checkStreamingPrerequisites(params) {
        console.log('\n🔍 Checking Streaming Prerequisites...');
        console.log('=' .repeat(60));
        
        const checks = [];
        
        // Check 1: Video recording enabled
        if (params['0x0070']) {
            checks.push({ name: 'Video Upload Enabled', status: true, value: params['0x0070'] });
        } else {
            checks.push({ name: 'Video Upload Enabled', status: false, value: 'Not set' });
        }
        
        // Check 2: Video resolution configured
        if (params['0x0064']) {
            const resolutions = { 1: '480P', 2: '720P', 3: '1080P' };
            checks.push({ 
                name: 'Video Resolution', 
                status: true, 
                value: resolutions[params['0x0064']] || params['0x0064'] 
            });
        } else {
            checks.push({ name: 'Video Resolution', status: false, value: 'Not configured' });
        }
        
        // Check 3: Server address configured
        if (params['0x0016']) {
            checks.push({ name: 'Server Address', status: true, value: params['0x0016'] });
        } else {
            checks.push({ name: 'Server Address', status: false, value: 'Not configured' });
        }
        
        // Check 4: Network connectivity parameters
        if (params['0x0001'] && params['0x0002']) {
            checks.push({ name: 'Network Parameters', status: true, value: 'Configured' });
        } else {
            checks.push({ name: 'Network Parameters', status: false, value: 'Missing' });
        }
        
        // Display results
        checks.forEach(check => {
            const status = check.status ? '✅' : '❌';
            console.log(`${status} ${check.name}: ${check.value}`);
        });
        
        return checks.every(check => check.status);
    }

    // Generate configuration recommendations
    generateRecommendations(allChecksPassed) {
        console.log('\n🎯 CONFIGURATION RECOMMENDATIONS:');
        console.log('=' .repeat(60));
        
        if (allChecksPassed) {
            console.log('✅ Device configuration appears correct for streaming');
            console.log('\n📋 Next steps:');
            console.log('   1. Verify device firmware supports ULV streaming');
            console.log('   2. Check device hardware (camera, video encoder)');
            console.log('   3. Monitor device logs during streaming attempt');
            console.log('   4. Test with vendor-provided streaming client');
        } else {
            console.log('❌ Device configuration issues detected');
            console.log('\n🔧 Required actions:');
            console.log('   1. Configure missing video parameters');
            console.log('   2. Enable video upload functionality');
            console.log('   3. Set appropriate video resolution/quality');
            console.log('   4. Verify network connectivity settings');
            
            console.log('\n📤 Parameter configuration commands:');
            console.log('   • Set video upload: 0x8103 (param 0x0070 = 1)');
            console.log('   • Set video resolution: 0x8103 (param 0x0064 = 2)');
            console.log('   • Set video quality: 0x8103 (param 0x0065 = 5)');
        }
    }

    // Main execution
    async run() {
        console.log('🚀 Device Configuration Check for ULV Streaming');
        console.log('=' .repeat(60));
        
        const params = await this.queryTerminalParams();
        
        if (params) {
            const allChecksPassed = this.checkStreamingPrerequisites(params);
            this.generateRecommendations(allChecksPassed);
        } else {
            console.log('❌ Could not retrieve device parameters');
            console.log('   Ensure device is connected and responsive');
        }
    }
}

// Run the configuration check
const checker = new DeviceConfigChecker();
checker.run().catch(console.error);