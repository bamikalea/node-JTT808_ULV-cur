const net = require("net");

/**
 * ULV Protocol Command Words
 * Based on ULV Network Protocol V2.0.0-2019
 */
const ULV_COMMANDS = {
  RESTART: 0x74, // Restart the device
  SHUTDOWN: 0x72, // Disconnect the circuit
  DISCONNECT_OIL: 0x70, // Disconnect the oil
  RECOVERY_OIL: 0x71, // Recovery oil
  RECOVERY_CIRCUIT: 0x73, // Recovery circuit
};

/**
 * Create ULV Command (0x8105 with specified command word)
 */
function createULVCommand(terminalId, sequenceNumber, commandWord) {
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

  // Message Body - ULV Command Word
  messageBuffer.writeUInt8(commandWord, offset);
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
 * Get command description
 */
function getCommandDescription(commandWord) {
  switch (commandWord) {
    case ULV_COMMANDS.RESTART:
      return "Restart the device";
    case ULV_COMMANDS.SHUTDOWN:
      return "Disconnect the circuit";
    case ULV_COMMANDS.DISCONNECT_OIL:
      return "Disconnect the oil";
    case ULV_COMMANDS.RECOVERY_OIL:
      return "Recovery oil";
    case ULV_COMMANDS.RECOVERY_CIRCUIT:
      return "Recovery circuit";
    default:
      return "Unknown command";
  }
}

/**
 * Send ULV Command
 */
function sendULVCommand(commandWord, terminalId = "628076842334") {
  const sequenceNumber = Math.floor(Math.random() * 65536);
  const commandDesc = getCommandDescription(commandWord);

  console.log(
    `🚀 Sending ULV Command: 0x${commandWord.toString(16).padStart(2, "0")}`
  );
  console.log("=".repeat(50));
  console.log(`📱 Terminal ID: ${terminalId}`);
  console.log(`🔢 Sequence Number: ${sequenceNumber}`);
  console.log(
    `⚡ Command: 0x8105 with ULV command word 0x${commandWord
      .toString(16)
      .padStart(2, "0")}`
  );
  console.log(`📋 ULV Description: ${commandDesc}`);
  console.log("");

  const client = new net.Socket();

  client.connect(8080, "127.0.0.1", () => {
    console.log("✅ Connected to local JT808 server");
    console.log(`🚀 Sending ULV ${commandDesc.toLowerCase()} command...`);
    console.log("");

    const jt808Message = createULVCommand(
      terminalId,
      sequenceNumber,
      commandWord
    );
    const completeMessage = wrapWithJT808Markers(jt808Message);

    console.log("📤 Sending message:");
    console.log(`   Raw: ${jt808Message.toString("hex")}`);
    console.log(`   Wrapped: ${completeMessage.toString("hex")}`);
    console.log(`   Length: ${completeMessage.length} bytes`);
    console.log("");

    client.write(completeMessage, () => {
      console.log(
        `📤 ULV ${commandDesc.toLowerCase()} command sent successfully!`
      );
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
    console.log("   3. Look for status updates related to the command");
    console.log("   4. Check if device reports command execution progress");
    console.log("");
  });

  // Close connection after 5 seconds
  setTimeout(() => {
    client.destroy();
  }, 5000);
}

/**
 * Main execution - send both restart and shutdown commands
 */
function main() {
  console.log("🎯 ULV Protocol Command Sender");
  console.log("==============================");
  console.log("");
  console.log("📋 Available ULV Commands:");
  console.log("   • 0x74: Restart the device");
  console.log("   • 0x72: Disconnect the circuit (shutdown-like)");
  console.log("   • 0x70: Disconnect the oil");
  console.log("   • 0x71: Recovery oil");
  console.log("   • 0x73: Recovery circuit");
  console.log("");

  // Send restart command first
  console.log("🔄 Sending ULV Restart Command (0x74)...");
  console.log("=========================================");
  sendULVCommand(ULV_COMMANDS.RESTART);

  // Wait 10 seconds, then send shutdown command
  setTimeout(() => {
    console.log("");
    console.log("🔌 Sending ULV Shutdown Command (0x72)...");
    console.log("=========================================");
    sendULVCommand(ULV_COMMANDS.SHUTDOWN);
  }, 10000);
}

// Execute the commands
main();
