const net = require("net");

/**
 * Resend ULV Restart Command (0x8105 with command word 0x74)
 * ULV Protocol: 0x74 = Restart the device
 */
function resendULVRestartCommand() {
  const terminalId = "628076842334";
  const sequenceNumber = Math.floor(Math.random() * 65536);

  console.log("🔄 Resending ULV Restart Command (0x74)...");
  console.log("=========================================");
  console.log(`📱 Terminal ID: ${terminalId}`);
  console.log(`🔢 Sequence Number: ${sequenceNumber}`);
  console.log(`⚡ Command: 0x8105 with ULV command word 0x74`);
  console.log(`📋 ULV Description: Restart the device`);
  console.log("");

  const client = new net.Socket();

  client.connect(8080, "127.0.0.1", () => {
    console.log("✅ Connected to local JT808 server");
    console.log("🔄 Resending ULV restart command...");
    console.log("");

    // Create ULV restart command
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

    // Message Body - ULV Command Word: 0x74 (Restart the device)
    messageBuffer.writeUInt8(0x74, offset);
    offset += 1;

    // Calculate checksum
    let checksum = 0;
    for (let i = 0; i < offset; i++) {
      checksum ^= messageBuffer[i];
    }
    messageBuffer.writeUInt8(checksum, offset);

    // Wrap with JT808 markers
    const completeMessage = Buffer.alloc(messageBuffer.length + 2);
    completeMessage[0] = 0x7e; // Start marker
    messageBuffer.copy(completeMessage, 1);
    completeMessage[completeMessage.length - 1] = 0x7e; // End marker

    console.log("📤 Sending message:");
    console.log(`   Raw: ${messageBuffer.toString("hex")}`);
    console.log(`   Wrapped: ${completeMessage.toString("hex")}`);
    console.log(`   Length: ${completeMessage.length} bytes`);
    console.log("");

    client.write(completeMessage, () => {
      console.log("📤 ULV restart command resent successfully!");
      console.log("🔍 Monitor server logs for response...");
      console.log("📱 Watch for ULV 0x900 messages with restart status");
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
    console.log("   3. Look for restart acknowledgment (0x74) in responses");
    console.log("   4. Check if device reports restart progress");
    console.log("");
  });

  // Close connection after 5 seconds
  setTimeout(() => {
    client.destroy();
  }, 5000);
}

// Execute the restart command
resendULVRestartCommand();
