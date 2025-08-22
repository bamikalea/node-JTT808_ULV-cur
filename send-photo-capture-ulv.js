const net = require("net");

/**
 * Send ULV Protocol Photo Capture Command (0x8801)
 * Based on JT808-2019 standard with ULV enhancements
 */
function createPhotoCaptureCommand(terminalId, sequenceNumber) {
  const headerLength = 17;
  const bodyLength = 8; // Photo capture command body
  const checksumLength = 1;
  const totalLength = headerLength + bodyLength + checksumLength;

  const messageBuffer = Buffer.alloc(totalLength);
  let offset = 0;

  // Message ID: 0x8801 (Photo Capture Command)
  messageBuffer.writeUInt16BE(0x8801, offset);
  offset += 2;

  // Message Properties (body length in bits 0-9)
  const properties = bodyLength & 0x3ff;
  messageBuffer.writeUInt16BE(properties, offset);
  offset += 2;

  // Protocol Version
  messageBuffer.writeUInt8(1, offset);
  offset += 1;

  // Terminal Phone Number (BCD encoded)
  const phoneNumber = terminalId.padStart(12, "0");
  const bcdBuffer = Buffer.alloc(10);
  for (let i = 0; i < 10; i++) {
    const digit1 = parseInt(phoneNumber[i * 2] || "0");
    const digit2 = parseInt(phoneNumber[i * 2 + 1] || "0");
    bcdBuffer[i] = (digit1 << 4) | digit2;
  }
  bcdBuffer.copy(messageBuffer, offset);
  offset += 10;

  // Message Serial Number
  messageBuffer.writeUInt16BE(sequenceNumber, offset);
  offset += 2;

  // Message Body - Photo Capture Command
  // Channel ID (1 byte)
  messageBuffer.writeUInt8(1, offset); // Channel 1
  offset += 1;

  // Event Code (1 byte) - 1 = Platform instruction
  messageBuffer.writeUInt8(1, offset);
  offset += 1;

  // Format (1 byte) - 0 = JPEG
  messageBuffer.writeUInt8(0, offset);
  offset += 1;

  // Resolution (1 byte) - 1 = 320x240
  messageBuffer.writeUInt8(1, offset);
  offset += 1;

  // Quality (1 byte) - 80 = 80% quality
  messageBuffer.writeUInt8(80, offset);
  offset += 1;

  // Brightness (1 byte) - 0 = normal
  messageBuffer.writeUInt8(0, offset);
  offset += 1;

  // Contrast (1 byte) - 0 = normal
  messageBuffer.writeUInt8(0, offset);
  offset += 1;

  // Saturation (1 byte) - 0 = normal
  messageBuffer.writeUInt8(0, offset);
  offset += 1;

  // Calculate checksum
  const checksum = calculateChecksum(messageBuffer.slice(0, offset));
  messageBuffer.writeUInt8(checksum, offset);

  return messageBuffer;
}

/**
 * Calculate JT808 message checksum
 */
function calculateChecksum(data) {
  let checksum = 0;
  for (let i = 0; i < data.length; i++) {
    checksum ^= data[i];
  }
  return checksum;
}

/**
 * Wrap message with JT808 markers and escape special characters
 */
function wrapWithJT808Markers(messageData) {
  const escaped = [];

  for (let i = 0; i < messageData.length; i++) {
    if (messageData[i] === 0x7e) {
      escaped.push(0x7d, 0x02);
    } else if (messageData[i] === 0x7d) {
      escaped.push(0x7d, 0x01);
    } else {
      escaped.push(messageData[i]);
    }
  }

  // Add start/end markers
  return Buffer.concat([
    Buffer.from([0x7e]),
    Buffer.from(escaped),
    Buffer.from([0x7e]),
  ]);
}

/**
 * Send photo capture command to JT808 server
 */
function sendPhotoCaptureCommand() {
  const terminalId = "098765432109";
  const sequenceNumber = Math.floor(Math.random() * 65536);

  console.log(`📸 Sending ULV Photo Capture Command to device ${terminalId}`);
  console.log(`🔢 Sequence Number: ${sequenceNumber}`);

  // Create the photo capture command
  const command = createPhotoCaptureCommand(terminalId, sequenceNumber);
  const wrappedCommand = wrapWithJT808Markers(command);

  console.log(`📡 Command length: ${wrappedCommand.length} bytes`);
  console.log(`🔍 Raw command: ${wrappedCommand.toString("hex")}`);

  // Connect to JT808 server
  const client = new net.Socket();

  client.connect(8080, "155.138.175.43", () => {
    console.log(`✅ Connected to JT808 server at 155.138.175.43:8080`);
    console.log(`📤 Sending photo capture command...`);

    client.write(wrappedCommand);
  });

  client.on("data", (data) => {
    console.log(`📥 Response received: ${data.toString("hex")}`);

    // Parse response
    if (data.length >= 2) {
      const messageId = data.readUInt16BE(0);
      console.log(
        `📋 Response Message ID: 0x${messageId.toString(16).padStart(4, "0")}`
      );

      if (messageId === 0x8001) {
        console.log(`✅ Photo capture command acknowledged by device!`);
      } else if (messageId === 0x8800) {
        console.log(`📸 Photo capture response received!`);
      } else {
        console.log(`ℹ️ Other response received`);
      }
    }

    client.destroy();
  });

  client.on("error", (err) => {
    console.error(`❌ Connection error: ${err.message}`);
  });

  client.on("close", () => {
    console.log(`🔌 Connection closed`);
  });

  // Set timeout
  setTimeout(() => {
    console.log(`⏰ Command timeout - closing connection`);
    client.destroy();
  }, 10000);
}

// Send the photo capture command
sendPhotoCaptureCommand();
