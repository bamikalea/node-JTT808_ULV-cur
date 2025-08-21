const net = require("net");

// Test multimedia message with proper JT808 format for debugging
function testMultimediaDebug() {
  const client = new net.Socket();

  client.connect(8080, "127.0.0.1", () => {
    console.log("✅ Connected to JT808 server");

    // Step 1: Send terminal authentication
    console.log("\n🔐 Step 1: Terminal Authentication");
    const authMessage = createTerminalAuthentication();
    client.write(authMessage);

    // Wait for authentication, then send multimedia data
    setTimeout(() => {
      console.log("\n📸 Step 2: Multimedia Data Upload (Debug Test)");
      const multimediaMessage = createMultimediaDataUpload();
      client.write(multimediaMessage);

      // Close after sending
      setTimeout(() => {
        client.destroy();
        console.log("\n✅ Test completed");
      }, 2000);
    }, 3000);
  });

  client.on("data", (data) => {
    console.log(`📥 Received: ${data.toString("hex")}`);
  });

  client.on("close", () => {
    console.log("❌ Connection closed");
  });

  client.on("error", (err) => {
    console.error("❌ Error:", err.message);
  });
}

function createTerminalAuthentication() {
  // Create proper 0x0100 message with 76-byte body
  const messageId = Buffer.alloc(2);
  messageId.writeUInt16BE(0x0100, 0);

  const properties = Buffer.alloc(2);
  properties.writeUInt16BE(76, 0); // Body length

  const protocolVersion = Buffer.alloc(1);
  protocolVersion.writeUInt8(0x01, 0);

  // Terminal phone number in BCD (6 bytes)
  const bcdPhone = Buffer.alloc(6);
  const phoneNumber = "628076842334";
  for (let i = 0; i < 6; i++) {
    bcdPhone[i] = parseInt(phoneNumber.substr(i * 2, 2), 16);
  }

  const messageSerialNumber = Buffer.alloc(2);
  messageSerialNumber.writeUInt16BE(1, 0);

  // Registration body (76 bytes exactly) - using the exact format from working examples
  const registrationBody = Buffer.concat([
    Buffer.from([0x01, 0x01]), // Province ID (2 bytes)
    Buffer.from([0x01, 0x01]), // County ID (2 bytes)
    Buffer.from("MFGID123456789012345678901234567890", "ascii").slice(0, 11), // Manufacturer ID (11 bytes)
    Buffer.from("TERMINALMODEL123456789012345678901234567890", "ascii").slice(
      0,
      30
    ), // Terminal Model (30 bytes)
    Buffer.concat([
      Buffer.from(phoneNumber, "ascii"),
      Buffer.alloc(30 - phoneNumber.length, 0),
    ]), // Terminal ID (30 bytes)
    Buffer.from([0x01]), // License Plate Color (1 byte)
  ]);

  console.log(`📊 Created authentication message:`);
  console.log(`  Message ID: 0x${messageId.readUInt16BE(0).toString(16)}`);
  console.log(`  Body length: ${registrationBody.length} bytes`);
  console.log(
    `  Registration body (first 16 bytes): ${registrationBody
      .slice(0, 16)
      .toString("hex")}`
  );

  const header = Buffer.concat([
    messageId,
    properties,
    protocolVersion,
    bcdPhone,
    messageSerialNumber,
  ]);

  const dataWithoutChecksum = Buffer.concat([header, registrationBody]);
  const checksum = calculateChecksum(dataWithoutChecksum);

  const completeMessage = Buffer.concat([
    Buffer.from([0x7e]), // Start marker
    dataWithoutChecksum,
    Buffer.from([checksum]),
    Buffer.from([0x7e]), // End marker
  ]);

  return completeMessage;
}

function createMultimediaDataUpload() {
  // Create proper 0x0801 message according to JT808 specification
  const messageId = Buffer.alloc(2);
  messageId.writeUInt16BE(0x0801, 0);

  // Calculate body length: 8 (header) + 28 (location) + 256 (JPEG data) = 292 bytes
  // This should match exactly what we send
  let bodyLength = 8 + 28 + 256;

  // Verify the calculation matches our actual body
  console.log(`🔍 Body length verification:`);
  console.log(`  Calculated: ${bodyLength} bytes`);
  console.log(`  Multimedia header: 8 bytes`);
  console.log(`  Location data: 28 bytes`);
  console.log(`  JPEG data: 256 bytes`);
  console.log(`  Total: ${8 + 28 + 256} bytes`);
  const properties = Buffer.alloc(2);
  properties.writeUInt16BE(bodyLength, 0);

  const protocolVersion = Buffer.alloc(1);
  protocolVersion.writeUInt8(0x01, 0);

  // Terminal phone number in BCD (6 bytes)
  const bcdPhone = Buffer.alloc(6);
  const phoneNumber = "628076842334";
  for (let i = 0; i < 6; i++) {
    bcdPhone[i] = parseInt(phoneNumber.substr(i * 2, 2), 16);
  }

  const messageSerialNumber = Buffer.alloc(2);
  messageSerialNumber.writeUInt16BE(2, 0);

  // ULV Protocol Compliant Multimedia Header (8 bytes)
  // According to ULV spec: 0x0801 message body starts with multimedia header
  const multimediaHeader = Buffer.concat([
    Buffer.alloc(4).fill(0x12, 0, 4), // Data ID (0x12121212)
    Buffer.from([0x00]), // Type: 0 = Image (ULV compliant)
    Buffer.from([0x00]), // Format: 0 = JPEG (ULV compliant)
    Buffer.from([0x00]), // Event: 0 = Platform instruction (ULV compliant)
    Buffer.from([0x01]), // Channel: 1 (ULV compliant)
  ]);

  console.log(`📊 ULV Multimedia Header:`);
  console.log(
    `  Data ID: 0x${Buffer.alloc(4).fill(0x12, 0, 4).toString("hex")}`
  );
  console.log(`  Type: 0 (Image)`);
  console.log(`  Format: 0 (JPEG)`);
  console.log(`  Event: 0 (Platform instruction)`);
  console.log(`  Channel: 1`);

  // JTT2019 location data (28 bytes) - structured as 0x0200 message body
  const locationData = Buffer.alloc(28);

  // JTT2019 timestamp: seconds since 2000-01-01 00:00:00 UTC
  const jtt2019Epoch = new Date("2000-01-01T00:00:00Z").getTime();
  const jtt2019Timestamp = Math.floor((Date.now() - jtt2019Epoch) / 1000);
  locationData.writeUInt32BE(jtt2019Timestamp, 0); // JTT2019 timestamp

  locationData.writeUInt32BE(0, 4); // Latitude
  locationData.writeUInt32BE(0, 8); // Longitude
  locationData.writeUInt16BE(0, 12); // Altitude
  locationData.writeUInt16BE(0, 14); // Speed
  locationData.writeUInt16BE(0, 16); // Direction
  locationData.writeUInt16BE(0, 18); // Status
  locationData.writeUInt8(0, 20); // Alarm
  locationData.writeUInt8(0, 21); // Reserved
  locationData.writeUInt8(0, 22); // Reserved
  locationData.writeUInt8(0, 23); // Reserved
  locationData.writeUInt8(0, 24); // Reserved
  locationData.writeUInt8(0, 25); // Reserved
  locationData.writeUInt8(0, 26); // Reserved
  locationData.writeUInt8(0, 27); // Reserved

  // Create a realistic JPEG file (256 bytes) - starts with proper JPEG header
  const jpegHeader = Buffer.concat([
    Buffer.from([0xff, 0xd8, 0xff, 0xe0]), // JPEG SOI + APP0 marker
    Buffer.from([0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]), // JFIF identifier
    Buffer.from([0x01, 0x01, 0x00, 0x40, 0x00, 0x40, 0x00, 0x00]), // JFIF version + 64x64 resolution
    Buffer.from([
      0xff, 0xc0, 0x00, 0x11, 0x08, 0x00, 0x40, 0x00, 0x40, 0x01, 0x01, 0x11,
      0x00,
    ]), // SOF0 marker
    Buffer.from([
      0xff, 0xc4, 0x00, 0x1f, 0x00, 0x00, 0x01, 0x05, 0x01, 0x01, 0x01, 0x01,
      0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x02,
      0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b,
    ]), // DHT marker
    Buffer.from([
      0xff, 0xda, 0x00, 0x0c, 0x03, 0x01, 0x00, 0x02, 0x11, 0x03, 0x11, 0x00,
      0x3f, 0x00,
    ]), // SOS marker
  ]);

  // Fill with realistic JPEG data (256 bytes total)
  const jpegData = Buffer.concat([
    jpegHeader,
    Buffer.alloc(256 - jpegHeader.length, 0x00), // Fill to 256 bytes
  ]);

  console.log(`📸 JPEG Data Creation:`);
  console.log(`  JPEG header: ${jpegHeader.length} bytes`);
  console.log(`  Total JPEG data: ${jpegData.length} bytes (256 bytes)`);
  console.log(`  JPEG starts with: ${jpegData.slice(0, 8).toString("hex")}`);

  // Build complete body - ULV protocol compliant
  // According to ULV spec: multimedia header (8) + location (28) + media data (64)
  const body = Buffer.concat([
    multimediaHeader, // 8 bytes - starts at offset 0
    locationData, // 28 bytes - starts at offset 8
    jpegData, // 64 bytes - starts at offset 36
  ]);

  // CRITICAL FIX: Ensure body length matches exactly what we send
  const actualBodyLength = body.length;

  console.log(`📊 ULV Protocol Structure:`);
  console.log(`  Body total: ${body.length} bytes`);
  console.log(`  Multimedia header (0-7): ${multimediaHeader.toString("hex")}`);
  console.log(
    `  Location data (8-35): ${locationData.slice(0, 8).toString("hex")}...`
  );
  console.log(
    `  JPEG data (36-99): ${jpegData.slice(0, 8).toString("hex")}...`
  );

  // DEBUG: Verify the body structure
  console.log(`🔍 DEBUG: Body verification:`);
  console.log(`  Body length: ${body.length} bytes`);
  console.log(
    `  First 8 bytes (should be multimedia header): ${body
      .slice(0, 8)
      .toString("hex")}`
  );
  console.log(
    `  Bytes 8-15 (should be location start): ${body
      .slice(8, 16)
      .toString("hex")}`
  );
  console.log(
    `  Bytes 36-43 (should be JPEG start): ${body
      .slice(36, 44)
      .toString("hex")}`
  );

  // Update the body length to match exactly what we're sending
  bodyLength = actualBodyLength;
  properties.writeUInt16BE(bodyLength, 0);

  console.log(
    `🔧 FIXED: Body length updated to ${bodyLength} bytes to match actual body size`
  );

  // Build header - ULV protocol compliant (17 bytes exactly)
  const header = Buffer.concat([
    messageId, // 2 bytes
    properties, // 2 bytes
    protocolVersion, // 1 byte
    bcdPhone, // 6 bytes
    messageSerialNumber, // 2 bytes
    Buffer.alloc(4, 0), // 4 bytes reserved (ULV protocol requirement)
  ]);

  console.log(`🔧 ULV Header Construction:`);
  console.log(`  Message ID: ${messageId.length} bytes`);
  console.log(`  Properties: ${properties.length} bytes`);
  console.log(`  Protocol Version: ${protocolVersion.length} bytes`);
  console.log(`  Terminal Phone: ${bcdPhone.length} bytes`);
  console.log(`  Message Serial: ${messageSerialNumber.length} bytes`);
  console.log(`  Reserved: 4 bytes`);
  console.log(`  Total header: ${header.length} bytes (should be 17)`);

  // Build complete message
  const message = Buffer.concat([header, body]);

  // Calculate checksum
  const checksum = calculateChecksum(message);

  const completeMessage = Buffer.concat([
    Buffer.from([0x7e]), // Start marker
    message,
    Buffer.from([checksum]),
    Buffer.from([0x7e]), // End marker
  ]);

  // DEBUG: Verify complete message structure
  console.log(`🔍 COMPLETE MESSAGE DEBUG:`);
  console.log(`  Start marker: 0x7E`);
  console.log(`  Message header length: ${header.length} bytes`);
  console.log(`  Message body length: ${body.length} bytes`);
  console.log(`  Message total (header + body): ${message.length} bytes`);
  console.log(`  Checksum: 0x${checksum.toString(16)}`);
  console.log(`  End marker: 0x7E`);
  console.log(`  Complete message total: ${completeMessage.length} bytes`);
  console.log(`  Expected total: ${1 + message.length + 1 + 1} bytes`);

  console.log(`📊 Created multimedia message:`);
  console.log(`  Message ID: 0x${messageId.readUInt16BE(0).toString(16)}`);
  console.log(`  Body length: ${bodyLength} bytes`);
  console.log(`  Multimedia header: ${multimediaHeader.toString("hex")}`);
  console.log(
    `  Location data: ${locationData.slice(0, 8).toString("hex")}...`
  );
  console.log(`  JPEG data starts: ${jpegData.slice(0, 8).toString("hex")}...`);

  return completeMessage;
}

function calculateChecksum(data) {
  let checksum = 0;
  for (let i = 0; i < data.length; i++) {
    checksum ^= data[i];
  }
  return checksum;
}

// Run the test
if (require.main === module) {
  testMultimediaDebug();
}

module.exports = { testMultimediaDebug };
