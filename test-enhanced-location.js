const net = require('net');

// Test enhanced location reporting (0x0200) with all additional information items
function createEnhancedLocationMessage() {
  // Message ID: 0x0200 (Location Report)
  const messageId = Buffer.alloc(2);
  messageId.writeUInt16BE(0x0200, 0);
  
  // Properties: Variable length due to additional info
  const properties = Buffer.alloc(2);
  properties.writeUInt16BE(0x0000, 0); // Will be updated
  
  // Protocol Version: 1
  const protocolVersion = Buffer.alloc(1);
  protocolVersion.writeUInt8(1, 0);
  
  // Terminal Phone Number: 628076842334 (6 bytes)
  const terminalPhone = Buffer.alloc(6);
  terminalPhone.writeUInt8(0x00, 0);
  terminalPhone.writeUInt8(0x00, 1);
  terminalPhone.writeUInt8(0x00, 2);
  terminalPhone.writeUInt8(0x00, 3);
  terminalPhone.writeUInt8(0x62, 4);
  terminalPhone.writeUInt8(0x80, 5);
  
  // Message Serial Number: 1
  const serialNumber = Buffer.alloc(2);
  serialNumber.writeUInt16BE(1, 0);
  
  // Basic Location Data (28 bytes according to Table 3.5.2)
  const basicLocation = Buffer.alloc(28);
  
  // Alarm sign (DWORD) - No alarms
  basicLocation.writeUInt32BE(0, 0);
  
  // Status (DWORD) - ACC ON, Located, North, East, GPS used
  basicLocation.writeUInt32BE(0x00040001, 4);
  
  // Latitude (DWORD) - 40.0 degrees * 10^6
  basicLocation.writeUInt32BE(40000000, 8);
  
  // Longitude (DWORD) - 116.0 degrees * 10^6
  basicLocation.writeUInt32BE(116000000, 12);
  
  // Altitude (WORD) - 100 meters
  basicLocation.writeUInt16BE(100, 16);
  
  // Speed (WORD) - 60 km/h * 0.1
  basicLocation.writeUInt16BE(600, 18);
  
  // Direction (WORD) - 90 degrees
  basicLocation.writeUInt16BE(90, 20);
  
  // Time (BCD[6]) - 2024-08-14 21:45:00
  basicLocation.writeUInt8(0x24, 22); // Year 2024
  basicLocation.writeUInt8(0x08, 23); // Month 08
  basicLocation.writeUInt8(0x14, 24); // Day 14
  basicLocation.writeUInt8(0x21, 25); // Hour 21
  basicLocation.writeUInt8(0x45, 26); // Minute 45
  basicLocation.writeUInt8(0x00, 27); // Second 00
  
  // Additional Information Items according to Table 3.5.6
  const additionalInfo = [];
  
  // 0x01: Mileage (4 bytes)
  const mileage = Buffer.alloc(6);
  mileage.writeUInt8(0x01, 0); // Item ID
  mileage.writeUInt8(0x04, 1); // Length
  mileage.writeUInt32BE(15000, 2); // 1500.0 km
  additionalInfo.push(mileage);
  
  // 0x02: Fuel quantity (2 bytes)
  const fuel = Buffer.alloc(4);
  fuel.writeUInt8(0x02, 0); // Item ID
  fuel.writeUInt8(0x02, 1); // Length
  fuel.writeUInt16BE(450, 2); // 45.0 L
  additionalInfo.push(fuel);
  
  // 0x03: Tachograph speed (2 bytes)
  const tachoSpeed = Buffer.alloc(4);
  tachoSpeed.writeUInt8(0x03, 0); // Item ID
  tachoSpeed.writeUInt8(0x02, 1); // Length
  tachoSpeed.writeUInt16BE(580, 2); // 58.0 km/h
  additionalInfo.push(tachoSpeed);
  
  // 0x14: Video related alarm (4 bytes)
  const videoAlarm = Buffer.alloc(6);
  videoAlarm.writeUInt8(0x14, 0); // Item ID
  videoAlarm.writeUInt8(0x04, 1); // Length
  videoAlarm.writeUInt32BE(0x00000011, 2); // Bit 0 and 4 set
  additionalInfo.push(videoAlarm);
  
  // 0x17: Memory fault alarm (2 bytes)
  const memoryFault = Buffer.alloc(4);
  memoryFault.writeUInt8(0x17, 0); // Item ID
  memoryFault.writeUInt8(0x02, 1); // Length
  memoryFault.writeUInt16BE(0x0003, 2); // Bits 0 and 1 set
  additionalInfo.push(memoryFault);
  
  // 0x25: Extended vehicle signal status (4 bytes)
  const extStatus = Buffer.alloc(6);
  extStatus.writeUInt8(0x25, 0); // Item ID
  extStatus.writeUInt8(0x04, 1); // Length
  extStatus.writeUInt32BE(0x00000200, 2); // Bit 9 set (AC ON)
  additionalInfo.push(extStatus);
  
  // 0x2A: IO Status bits (2 bytes)
  const ioStatus = Buffer.alloc(4);
  ioStatus.writeUInt8(0x2A, 0); // Item ID
  ioStatus.writeUInt8(0x02, 1); // Length
  ioStatus.writeUInt16BE(0x0100, 2); // Bit 8 set (IoInput1 HIGH)
  additionalInfo.push(ioStatus);
  
  // 0x30: Signal strength (1 byte)
  const signalStrength = Buffer.alloc(3);
  signalStrength.writeUInt8(0x30, 0); // Item ID
  signalStrength.writeUInt8(0x01, 1); // Length
  signalStrength.writeUInt8(85, 2); // 85% signal strength
  additionalInfo.push(signalStrength);
  
  // 0x31: GNSS satellites (1 byte)
  const gnssStars = Buffer.alloc(3);
  gnssStars.writeUInt8(0x31, 0); // Item ID
  gnssStars.writeUInt8(0x01, 1); // Length
  gnssStars.writeUInt8(12, 2); // 12 satellites
  additionalInfo.push(gnssStars);
  
  // 0xE4: Environmental data (16 bytes)
  const envData = Buffer.alloc(18);
  envData.writeUInt8(0xE4, 0); // Item ID
  envData.writeUInt8(0x10, 1); // Length (16 bytes)
  // Temperature 1: 25.0°C, Humidity 1: 60%
  envData.writeInt16BE(250, 2); // Temperature 1
  envData.writeUInt16BE(60, 4);  // Humidity 1
  // Temperature 2: 26.5°C, Humidity 2: 58%
  envData.writeInt16BE(265, 6); // Temperature 2
  envData.writeUInt16BE(58, 8);  // Humidity 2
  // Temperature 3: 24.8°C, Humidity 3: 62%
  envData.writeInt16BE(248, 10); // Temperature 3
  envData.writeUInt16BE(62, 12); // Humidity 3
  // Temperature 4: 25.2°C, Humidity 4: 59%
  envData.writeInt16BE(252, 14); // Temperature 4
  envData.writeUInt16BE(59, 16); // Humidity 4
  additionalInfo.push(envData);
  
  // Combine all additional info
  const additionalInfoBuffer = Buffer.concat(additionalInfo);
  
  // Combine basic location and additional info
  const messageBody = Buffer.concat([basicLocation, additionalInfoBuffer]);
  
  // Update properties with actual body length
  properties.writeUInt16BE(messageBody.length, 0);
  
  // Calculate checksum
  let checksum = 0;
  for (let i = 0; i < messageBody.length; i++) {
    checksum ^= messageBody[i];
  }
  
  // Build complete message
  const message = Buffer.concat([
    Buffer.from([0x7E]),           // Start marker
    messageId,                      // Message ID
    properties,                     // Properties
    protocolVersion,                // Protocol Version
    terminalPhone,                  // Terminal Phone
    serialNumber,                   // Serial Number
    messageBody,                    // Message Body
    Buffer.from([checksum]),        // Checksum
    Buffer.from([0x7E])            // End marker
  ]);
  
  return message;
}

// Test function
function testEnhancedLocationReporting() {
  console.log('Testing Enhanced JT808 Location Reporting...');
  console.log('This test includes all additional information items from Tables 3.5.6, 3.5.7, and 3.5.8');
  
  const client = new net.Socket();
  
  client.connect(8080, '127.0.0.1', () => {
    console.log('Connected to JT808 server');
    
    // Send enhanced location report
    const locationMsg = createEnhancedLocationMessage();
    console.log(`Sending enhanced location report: ${locationMsg.toString('hex')}`);
    console.log(`Message length: ${locationMsg.length} bytes`);
    console.log(`Body length: ${locationMsg.length - 4} bytes (excluding markers and checksum)`);
    
    client.write(locationMsg);
    
    // Close connection after sending
    setTimeout(() => {
      console.log('Test completed, closing connection');
      client.destroy();
    }, 3000);
  });
  
  client.on('data', (data) => {
    console.log(`Received response: ${data.toString('hex')}`);
  });
  
  client.on('error', (err) => {
    console.error('Connection error:', err.message);
  });
  
  client.on('close', () => {
    console.log('Connection closed');
  });
}

// Run test
testEnhancedLocationReporting();

