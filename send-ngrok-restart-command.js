const net = require("net");

// ULV Protocol Terminal Restart Command via ngrok to Real Device
// This will test the restart command on the ACTUAL device connected through ngrok

function createULVRestartCommand(terminalId, sequenceNumber) {
  // JT808 Message Structure:
  // 7e + [Header(17) + Body(1) + Checksum(1)] + 7e

  const headerLength = 17;
  const bodyLength = 1;
  const checksumLength = 1;
  const totalLength = headerLength + bodyLength + checksumLength;

  // Create the complete message buffer
  const messageBuffer = Buffer.alloc(totalLength);

  let offset = 0;

  // 1. Message ID (2 bytes) - 0x8105 (Terminal Control)
  messageBuffer.writeUInt16BE(0x8105, offset);
  offset += 2;

  // 2. Message Properties (2 bytes) - Body length in bits 0-9
  const properties = bodyLength & 0x3ff; // Only use bits 0-9 for length
  messageBuffer.writeUInt16BE(properties, offset);
  offset += 2;

  // 3. Protocol Version (1 byte) - JT808 version
  messageBuffer.writeUInt8(1, offset); // Version 1
  offset += 1;

  // 4. Terminal Phone Number (10 bytes) - BCD encoded
  // Convert terminal ID to BCD format
  const phoneNumber = terminalId.padStart(12, "0"); // Ensure 12 digits
  const bcdBuffer = Buffer.alloc(10);
  for (let i = 0; i < 10; i++) {
    const digit1 = parseInt(phoneNumber[i * 2] || "0");
    const digit2 = parseInt(phoneNumber[i * 2 + 1] || "0");
    bcdBuffer[i] = (digit1 << 4) | digit2;
  }
  bcdBuffer.copy(messageBuffer, offset);
  offset += 10;

  // 5. Message Serial Number (2 bytes)
  messageBuffer.writeUInt16BE(sequenceNumber, offset);
  offset += 2;

  // 6. Message Body (1 byte) - ULV Command Word
  messageBuffer.writeUInt8(0x74, offset); // 0x74 = ULV Restart Device
  offset += 1;

  // 7. Calculate and add checksum
  const checksum = calculateChecksum(messageBuffer.slice(0, offset));
  messageBuffer.writeUInt8(checksum, offset);

  return messageBuffer;
}

function calculateChecksum(data) {
  let checksum = 0;
  for (let i = 0; i < data.length; i++) {
    checksum ^= data[i];
  }
  return checksum;
}

function wrapWithJT808Markers(messageData) {
  // Add start and end markers (0x7e)
  const wrappedMessage = Buffer.alloc(messageData.length + 2);
  wrappedMessage[0] = 0x7e; // Start marker
  messageData.copy(wrappedMessage, 1);
  wrappedMessage[wrappedMessage.length - 1] = 0x7e; // End marker

  return wrappedMessage;
}

// Send ULV restart command via ngrok to real device
function sendULVRestartCommandViaNgrok() {
  const terminalId = "628076842334";
  const sequenceNumber = Math.floor(Math.random() * 65536);

  // ngrok tunnel details
  const ngrokHost = "0.tcp.eu.ngrok.io";
  const ngrokPort = 11498;

  console.log("🔍 Testing Restart Command via ngrok to REAL Device!");
  console.log("=====================================================");
  console.log(`📱 Target Terminal: ${terminalId}`);
  console.log(`🔢 Sequence Number: ${sequenceNumber}`);
  console.log(`🌐 ngrok Tunnel: ${ngrokHost}:${ngrokPort}`);
  console.log("");

  console.log("📋 ULV Protocol Details:");
  console.log("   Message ID: 0x8105 (Terminal Control)");
  console.log("   Command Word: 0x74 (Restart the device)");
  console.log("   Parameter: None (ULV doesn't use parameters)");
  console.log("   Body Length: 1 byte (command word only)");
  console.log("");

  const client = new net.Socket();

  client.connect(ngrokPort, ngrokHost, () => {
    console.log("✅ Connected to ngrok tunnel");
    console.log("🌐 This will reach the REAL device connected to your server!");

    // Create the JT808 message
    const jt808Message = createULVRestartCommand(terminalId, sequenceNumber);

    // Wrap with JT808 markers
    const completeMessage = wrapWithJT808Markers(jt808Message);

    console.log("📡 Command Details:");
    console.log(`   JT808 Message Length: ${jt808Message.length} bytes`);
    console.log(`   Complete Message Length: ${completeMessage.length} bytes`);
    console.log(`   JT808 Message Hex: ${jt808Message.toString("hex")}`);
    console.log(`   Complete Message Hex: ${completeMessage.toString("hex")}`);
    console.log("");

    console.log("🔍 Command Structure Analysis:");
    console.log(`   Start Flag: 7e`);
    console.log(`   Message ID: 8105 (Terminal Control)`);
    console.log(
      `   Properties: ${(1 & 0x3ff)
        .toString(16)
        .padStart(4, "0")} (1 byte body)`
    );
    console.log(`   Protocol Version: 01`);
    console.log(`   Terminal ID: ${terminalId} (BCD encoded)`);
    console.log(`   Sequence: ${sequenceNumber.toString(16).padStart(4, "0")}`);
    console.log(`   Command Word: 74 (ULV Restart Device)`);
    console.log(
      `   Checksum: ${jt808Message[jt808Message.length - 1]
        .toString(16)
        .padStart(2, "0")}`
    );
    console.log(`   End Flag: 7e`);
    console.log("");

    console.log("🚀 Sending ULV Restart Command to REAL device via ngrok...");
    client.write(completeMessage, () => {
      console.log("✅ ULV Restart Command sent successfully!");
      console.log("");
      console.log("📊 Expected Response from Real Device:");
      console.log("   Message ID: 0x0900 (Device Data Report)");
      console.log("   Contains: Embedded command acknowledgment");
      console.log("   Format: Status updates with processed commands");
      console.log("   This should trigger PHYSICAL device restart!");
      console.log("");
      console.log("⏳ Waiting for real device response...");
      console.log("🔍 Monitor your server logs for the response...");

      // Keep connection open briefly to receive response
      setTimeout(() => {
        client.end();
      }, 5000);
    });
  });

  client.on("data", (data) => {
    console.log(
      `📥 Received response from REAL device: ${data.toString("hex")}`
    );

    // Check if it's a 0x0900 ULV response
    if (data.toString("hex").includes("0900")) {
      console.log("🎉 Received ULV 0x0900 response from REAL device!");
      console.log("✅ Command processed by actual device!");
    }
  });

  client.on("close", () => {
    console.log("🔌 Connection closed");
    console.log("");
    console.log("🎯 Test Complete!");
    console.log("================");
    console.log("1. Command sent to REAL device via ngrok");
    console.log("2. Check if device physically restarts");
    console.log("3. Monitor server logs for ULV responses");
    console.log("4. This was a REAL test, not local simulation!");
  });

  client.on("error", (error) => {
    console.error(`❌ Connection error: ${error.message}`);
    console.log("💡 Make sure ngrok is running and device is connected");
  });
}

// Run the function
sendULVRestartCommandViaNgrok();
