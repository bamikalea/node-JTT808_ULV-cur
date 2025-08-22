#!/usr/bin/env node

/**
 * Test script to verify ULV protocol parsing improvements
 * This simulates the ULV transparent data message (0x900 with 0xF3) that was showing "Unknown additional info ID"
 */

const net = require('net');

// ULV Protocol compliant message structure based on the protocol document
function createULVTransparentMessage() {
  // JT808 Message Header (0x900)
  const messageId = Buffer.alloc(2);
  messageId.writeUInt16BE(0x900, 0);
  
  const properties = Buffer.alloc(2);
  properties.writeUInt16BE(0x40bd, 0); // 0x40bd = 16573 (189 bytes body)
  
  const protocolVersion = Buffer.alloc(1);
  protocolVersion.writeUInt8(0x01, 0); // Protocol version 1
  
  // Convert phone number to BCD format (6 bytes for 12 digits: 628076842334)
  const phoneNumber = Buffer.alloc(6);
  phoneNumber[0] = 0x62; // 62
  phoneNumber[1] = 0x80; // 80
  phoneNumber[2] = 0x76; // 76
  phoneNumber[3] = 0x84; // 84
  phoneNumber[4] = 0x23; // 23
  phoneNumber[5] = 0x34; // 34
  
  const messageSerial = Buffer.alloc(2);
  messageSerial.writeUInt16BE(1, 0);
  
  // ULV Transparent Data Body (0xF3)
  const ulvMessageType = Buffer.alloc(1);
  ulvMessageType.writeUInt8(0xF3, 0);
  
  const dataType = Buffer.alloc(1);
  dataType.writeUInt8(0x00, 0); // Vehicle information
  
  const customerId = Buffer.alloc(1);
  customerId.writeUInt8(0x00, 0); // Standard universal
  
  // ULV Vehicle Information Data Structure (Table 3.10.10)
  const vehicleDataType = Buffer.alloc(1);
  vehicleDataType.writeUInt8(0x00, 0); // Real time upload of regular data
  
  const alarmFlag = Buffer.alloc(4);
  alarmFlag.writeUInt32BE(0x00000000, 0); // No alarms
  
  const status = Buffer.alloc(4);
  status.writeUInt32BE(0x00000300, 0); // Status bits
  
  const latitude = Buffer.alloc(4);
  latitude.writeUInt32BE(0x0651f260, 0); // Latitude * 10^6
  
  const longitude = Buffer.alloc(4);
  longitude.writeUInt32BE(0x031eeb74, 0); // Longitude * 10^6
  
  const latDirection = Buffer.alloc(1);
  latDirection.writeUInt8(0x4E, 0); // 'N' for North
  
  const lonDirection = Buffer.alloc(1);
  lonDirection.writeUInt8(0x45, 0); // 'E' for East
  
  const height = Buffer.alloc(2);
  height.writeUInt16BE(0x002D, 0); // Height in meters
  
  const speed = Buffer.alloc(2);
  speed.writeUInt16BE(0x0000, 0); // Speed * 0.1 km/h
  
  const direction = Buffer.alloc(2);
  direction.writeUInt16BE(0x0019, 0); // Direction in degrees
  
  const time = Buffer.alloc(6);
  time.writeUInt8(0x08, 0); // Year 2008
  time.writeUInt8(0x0F, 1); // Month 15
  time.writeUInt8(0x0A, 2); // Day 10
  time.writeUInt8(0x18, 3); // Hour 24
  time.writeUInt8(0x26, 4); // Minute 38
  time.writeUInt8(0x00, 5); // Second 00
  
  const mileage = Buffer.alloc(4);
  mileage.writeUInt32BE(0x00000000, 0); // Mileage * 0.1 km
  
  const numSatellites = Buffer.alloc(1);
  numSatellites.writeUInt8(0x00, 0); // Number of satellites
  
  // Additional Information Items (Table 3.10.11)
  // Item 1: Driver Information (ID 0x00)
  const driverInfoId = Buffer.alloc(1);
  driverInfoId.writeUInt8(0x00, 0);
  
  const driverInfoLength = Buffer.alloc(1);
  driverInfoLength.writeUInt8(0x08, 0); // 8 bytes
  
  const driverInfoData = Buffer.alloc(8);
  driverInfoData.write('Driver1', 0, 7, 'ascii');
  driverInfoData.writeUInt8(0x00, 7); // Null terminator
  
  // Item 2: Reserved Field (ID 0x3F) - often contains "None"
  const reservedId = Buffer.alloc(1);
  reservedId.writeUInt8(0x3F, 0);
  
  const reservedLength = Buffer.alloc(1);
  reservedLength.writeUInt8(0x4E, 0); // 78 bytes (matches the log)
  
  const reservedData = Buffer.alloc(78);
  reservedData.fill(0x00); // Fill with zeros
  
  // Item 3: Extended Vehicle Signal Status (ID 0x19)
  const extStatusId = Buffer.alloc(1);
  extStatusId.writeUInt8(0x19, 0);
  
  const extStatusLength = Buffer.alloc(1);
  extStatusLength.writeUInt8(0x04, 0); // 4 bytes
  
  const extStatusData = Buffer.alloc(4);
  extStatusData.writeUInt32BE(0x00000000, 0);
  
  // Item 4: IO Status (ID 0x2A)
  const ioStatusId = Buffer.alloc(1);
  ioStatusId.writeUInt8(0x2A, 0);
  
  const ioStatusLength = Buffer.alloc(1);
  ioStatusLength.writeUInt8(0x02, 0); // 2 bytes
  
  const ioStatusData = Buffer.alloc(2);
  ioStatusData.writeUInt16BE(0x0000, 0);
  
  // Item 5: Signal Strength (ID 0x30)
  const signalId = Buffer.alloc(1);
  signalId.writeUInt8(0x30, 0);
  
  const signalLength = Buffer.alloc(1);
  signalLength.writeUInt8(0x01, 0); // 1 byte
  
  const signalData = Buffer.alloc(1);
  signalData.writeUInt8(0x31, 0); // Signal strength value
  
  // Item 6: GNSS Stars (ID 0x31)
  const gnssId = Buffer.alloc(1);
  gnssId.writeUInt8(0x31, 0);
  
  const gnssLength = Buffer.alloc(1);
  gnssLength.writeUInt8(0x01, 0); // 1 byte
  
  const gnssData = Buffer.alloc(1);
  gnssData.writeUInt8(0x01, 0); // Number of GNSS stars
  
  // Item 7: Video Status (ID 0x05)
  const videoId = Buffer.alloc(1);
  videoId.writeUInt8(0x05, 0);
  
  const videoLength = Buffer.alloc(1);
  videoLength.writeUInt8(0x08, 0); // 8 bytes
  
  const videoData = Buffer.alloc(8);
  videoData.writeUInt32BE(0x00000000, 0); // Video loss status
  videoData.writeUInt32BE(0x00000000, 4); // Recording status
  
  // Item 8: Temperature and Humidity (ID 0x03)
  const tempId = Buffer.alloc(1);
  tempId.writeUInt8(0x03, 0);
  
  const tempLength = Buffer.alloc(1);
  tempLength.writeUInt8(0x10, 0); // 16 bytes
  
  const tempData = Buffer.alloc(16);
  // Temperature values (4 x WORD, each * 0.1°C)
  tempData.writeInt16BE(250, 0);   // 25.0°C
  tempData.writeInt16BE(260, 2);   // 26.0°C
  tempData.writeInt16BE(270, 4);   // 27.0°C
  tempData.writeInt16BE(280, 6);   // 28.0°C
  // Humidity values (4 x WORD)
  tempData.writeUInt16BE(600, 8);  // 60.0%
  tempData.writeUInt16BE(650, 10); // 65.0%
  tempData.writeUInt16BE(700, 12); // 70.0%
  tempData.writeUInt16BE(750, 14); // 75.0%
  
  // Item 9: Network Information (ID 0x04)
  const networkId = Buffer.alloc(1);
  networkId.writeUInt8(0x04, 0);
  
  const networkLength = Buffer.alloc(1);
  networkLength.writeUInt8(0x02, 0); // 2 bytes
  
  const networkData = Buffer.alloc(2);
  networkData.writeUInt8(0x01, 0); // WiFi connection
  networkData.writeUInt8(0x75, 1); // Signal strength 75%
  
  // Item 10: Disk Status (ID 0x07)
  const diskId = Buffer.alloc(1);
  diskId.writeUInt8(0x07, 0);
  
  const diskLength = Buffer.alloc(1);
  diskLength.writeUInt8(0x22, 0); // 34 bytes
  
  const diskData = Buffer.alloc(34);
  diskData.writeUInt8(0x01, 0); // 1 hard drive
  // HDD total capacities (2 x DWORD, MB)
  diskData.writeUInt32BE(1000000, 1);  // 1TB in MB
  diskData.writeUInt32BE(0, 5);        // Second HDD not present
  // HDD remaining capacities (2 x DWORD, MB)
  diskData.writeUInt32BE(500000, 9);   // 500GB remaining
  diskData.writeUInt32BE(0, 13);       // Second HDD not present
  diskData.writeUInt8(0x01, 17);       // 1 SD card
  // SD total capacities (2 x DWORD, MB)
  diskData.writeUInt32BE(32000, 18);   // 32GB in MB
  diskData.writeUInt32BE(0, 22);       // Second SD not present
  // SD remaining capacities (2 x DWORD, MB)
  diskData.writeUInt32BE(16000, 26);   // 16GB remaining
  diskData.writeUInt32BE(0, 30);       // Second SD not present
  
  // Build the complete message body
  const messageBody = Buffer.concat([
    ulvMessageType, dataType, customerId,
    vehicleDataType, alarmFlag, status, latitude, longitude,
    latDirection, lonDirection, height, speed, direction, time,
    mileage, numSatellites,
    driverInfoId, driverInfoLength, driverInfoData,
    reservedId, reservedLength, reservedData,
    extStatusId, extStatusLength, extStatusData,
    ioStatusId, ioStatusLength, ioStatusData,
    signalId, signalLength, signalData,
    gnssId, gnssLength, gnssData,
    videoId, videoLength, videoData,
    tempId, tempLength, tempData,
    networkId, networkLength, networkData,
    diskId, diskLength, diskData
  ]);
  
  // JT808 Message with ULV transparent data
  const message = Buffer.concat([
    messageId, properties, protocolVersion, phoneNumber, messageSerial, messageBody
  ]);
  
  return message;
}

// Test the ULV message creation
const ulvMessage = createULVTransparentMessage();
console.log('ULV Transparent Message created:');
console.log(`  Total length: ${ulvMessage.length} bytes`);
console.log(`  Message ID: 0x${ulvMessage.readUInt16BE(0).toString(16)}`);
console.log(`  Properties: 0x${ulvMessage.readUInt16BE(2).toString(16)}`);
console.log(`  Protocol Version: 0x${ulvMessage.readUInt8(4).toString(16)}`);
console.log(`  Phone: ${ulvMessage.slice(5, 11).toString('ascii')}`);
console.log(`  Serial: ${ulvMessage.readUInt16BE(11)}`);
console.log(`  ULV Type: 0x${ulvMessage.readUInt8(13).toString(16)}`);
console.log(`  Data Type: ${ulvMessage.readUInt8(14)}`);
console.log(`  Customer ID: ${ulvMessage.readUInt8(15)}`);
console.log(`  Vehicle Data Type: ${ulvMessage.readUInt8(16)}`);
console.log(`  Latitude: ${ulvMessage.readUInt32BE(17) / 1000000}`);
console.log(`  Longitude: ${ulvMessage.readUInt32BE(21) / 1000000}`);
console.log(`  Height: ${ulvMessage.readUInt16BE(25)}m`);
console.log(`  Speed: ${ulvMessage.readUInt16BE(27) / 10} km/h`);
console.log(`  Direction: ${ulvMessage.readUInt16BE(29)}°`);
console.log(`  Time: 20${ulvMessage.readUInt8(31)}-${ulvMessage.readUInt8(32)}-${ulvMessage.readUInt8(33)} ${ulvMessage.readUInt8(34)}:${ulvMessage.readUInt8(35)}:${ulvMessage.readUInt8(36)}`);
console.log(`  Mileage: ${ulvMessage.readUInt32BE(37) / 10} km`);
console.log(`  Satellites: ${ulvMessage.readUInt8(41)}`);

console.log('\nAdditional Info Items:');
let offset = 42;
let itemCount = 0;
while (offset < ulvMessage.length - 2) {
  const infoId = ulvMessage.readUInt8(offset);
  const infoLength = ulvMessage.readUInt8(offset + 1);
  
  console.log(`  Item ${++itemCount}: ID=0x${infoId.toString(16)}, Length=${infoLength}`);
  
  if (offset + 2 + infoLength > ulvMessage.length) {
    console.log(`    Warning: Item extends beyond message boundary`);
    break;
  }
  
  offset += 2 + infoLength;
}

console.log('\nMessage ready for testing with JT808 server!');
console.log('Send this message to test the improved ULV parsing.');
