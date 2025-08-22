const net = require("net");

/**
 * Create ULV Shutdown Command (0x8105 with command word 0x72)
 * ULV Protocol: 0x72 = Disconnect the circuit
 */
function createULVShutdownCommand(terminalId, sequenceNumber) {
  const headerLength = 17;
  const bodyLength = 1;
  const checksumLength = 1;
  const totalLength = headerLength + bodyLength + checksumLength;
  const messageBuffer = Buffer.alloc(totalLength);
  let offset = 0;

  // Message ID: 0x8105 (Terminal Control)
  messageBuffer.writeUInt16BE(0x8105, offset);
  offset += 2;

  // Message Properties (body length in bits 0-9)
  const properties = bodyLength & 0x3ff;
  messageBuffer.writeUInt16BE(properties, offset);
  offset += 2;

  // Protocol Version
  messageBuffer.writeUInt8(1, offset);
  offset += 1;

  // Terminal Phone Number (BCD encoded)
  const phoneNumber = terminalId.padStart(12, "0"); // Ensure 12 digits
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

  // Message Body - ULV Command Word: 0x72 (Disconnect the circuit)
  messageBuffer.writeUInt8(0x72, offset);
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
 * Wrap JT808 message with start/end markers
 */
function wrapWithJT808Markers(messageData) {
  const wrappedMessage = Buffer.alloc(messageData.length + 2);
  wrappedMessage[0] = 0x7e; // Start marker
  messageData.copy(wrappedMessage, 1);
  wrappedMessage[wrappedMessage.length - 1] = 0x7e; // End marker
  return wrappedMessage;
}

/**
 * Send ULV Shutdown Command
 */
function sendULVShutdownCommand() {
  const terminalId = "628076842334";
  const sequenceNumber = Math.floor(Math.random() * 65536);

  console.log("🔌 Sending ULV Shutdown Command (Disconnect Circuit)...");
  console.log("=====================================================");
  console.log(`📱 Terminal ID: ${terminalId}`);
  console.log(`🔢 Sequence Number: ${sequenceNumber}`);
  console.log(`⚡ Command: 0x8105 with ULV command word 0x72`);
  console.log(`📋 ULV Description: Disconnect the circuit`);
  console.log("");

  const client = new net.Socket();

  client.connect(8080, "127.0.0.1", () => {
    console.log("✅ Connected to local JT808 server");
    console.log("🔌 Sending ULV shutdown command...");
    console.log("");

    const jt808Message = createULVShutdownCommand(terminalId, sequenceNumber);
    const completeMessage = wrapWithJT808Markers(jt808Message);

    console.log("📤 Sending message:");
    console.log(`   Raw: ${jt808Message.toString("hex")}`);
    console.log(`   Wrapped: ${completeMessage.toString("hex")}`);
    console.log(`   Length: ${completeMessage.length} bytes`);
    console.log("");

    client.write(completeMessage, () => {
      console.log("📤 ULV shutdown command sent successfully!");
      console.log("🔍 Monitor server logs for response...");
      console.log("📱 Watch for ULV 0x900 messages with status updates");
      console.log("");
    });
  });

  client.on("data", (data) => {
    console.log("📥 Received response from server:");
    console.log(`   Hex: ${data.toString("hex")}`);
    console.log(`   Length: ${data.length} bytes`);
    console.log("");
  });

  client.on("error", (err) => {
    console.error("❌ Connection error:", err.message);
  });

  client.on("close", () => {
    console.log("🔌 Connection closed");
    console.log("");
    console.log("🔍 Next steps:");
    console.log("   1. Check server logs for command reception");
    console.log("   2. Monitor for ULV 0x900 response messages");
    console.log("   3. Look for circuit disconnect status updates");
    console.log("   4. Check if device reports shutdown progress");
  });

  // Close connection after 5 seconds
  setTimeout(() => {
    client.destroy();
  }, 5000);
}

// Execute the shutdown command
sendULVShutdownCommand();
