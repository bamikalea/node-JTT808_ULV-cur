const net = require('net');

// Simple working terminal simulator
const client = new net.Socket();

client.connect(8080, '127.0.0.1', () => {
    console.log('✅ Connected to JT808 server');
    
    // Send simple authentication
    setTimeout(() => {
        console.log('🔐 Sending authentication...');
        
        // Simple 0x0100 message
        const message = Buffer.from([
            0x7E, // Start marker
            0x01, 0x00, // Message ID (0x0100)
            0x00, 0x00, // Properties (0 body length)
            0x01, // Protocol version
            0x62, 0x80, 0x76, 0x84, 0x23, 0x34, // Phone number in BCD
            0x00, 0x01, // Serial number
            0x00, // Checksum (dummy)
            0x7E  // End marker
        ]);
        
        client.write(message);
        console.log('📤 Authentication sent');
    }, 1000);
});

client.on('data', (data) => {
    console.log(`📥 Received: ${data.toString('hex')}`);
    
    // If we get an authentication challenge, respond
    if (data.includes(0x81) && data.includes(0x00)) {
        console.log('🔑 Authentication challenge received');
        
        setTimeout(() => {
            const response = Buffer.from([
                0x7E, // Start marker
                0x01, 0x02, // Message ID (0x0102)
                0x00, 0x00, // Properties (0 body length)
                0x01, // Protocol version
                0x62, 0x80, 0x76, 0x84, 0x23, 0x34, // Phone number in BCD
                0x00, 0x02, // Serial number
                0x00, // Checksum (dummy)
                0x7E  // End marker
            ]);
            
            client.write(response);
            console.log('📤 Authentication response sent');
        }, 1000);
    }
});

client.on('close', () => {
    console.log('❌ Connection closed');
});

client.on('error', (err) => {
    console.error('❌ Error:', err.message);
});

console.log('📱 Simple terminal simulator running. Press Ctrl+C to stop.');

process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down...');
    client.destroy();
    process.exit(0);
});
