const net = require("net");

// JT808 Terminal Restart Command (0x8105)
function createRestartCommand(terminalId, sequenceNumber) {
  const buffer = Buffer.alloc(28);

  // Message ID: 0x8105 (Terminal Restart Command)
  buffer.writeUInt16BE(0x8105, 0);

  // Message Body Property (Length: 24 bytes)
  buffer.writeUInt16BE(24, 2);

  // Terminal Phone Number (6 bytes, BCD)
  const phoneBytes = Buffer.from(terminalId.toString(), "hex");
  phoneBytes.copy(buffer, 4, 0, 6);

  // Message Sequence Number
  buffer.writeUInt16BE(sequenceNumber, 10);

  // Message Body
  let offset = 12;

  // Restart Type (1 byte) - 0x00: Restart, 0x01: Reset
  buffer.writeUInt8(0x00, offset);
  offset += 1;

  // Reserved (23 bytes) - Fill with zeros
  buffer.fill(0, offset);

  return buffer;
}

// Send restart command
function sendRestartCommand() {
  const terminalId = "628076842334";
  const sequenceNumber = Math.floor(Math.random() * 65536);

  console.log(`🔄 Sending Terminal Restart Command to Terminal ${terminalId}`);
  console.log(`Sequence Number: ${sequenceNumber}`);

  const client = new net.Socket();

  client.connect(8080, "155.138.175.43", () => {
    console.log("Connected to JT808 server");

    const restartCommand = createRestartCommand(terminalId, sequenceNumber);
    console.log(`Restart command length: ${restartCommand.length}`);
    console.log(`Command hex: ${restartCommand.toString("hex")}`);

    client.write(restartCommand, () => {
      console.log("Restart command sent successfully");
      client.end();
    });
  });

  client.on("data", (data) => {
    console.log(`Received response: ${data.toString("hex")}`);
  });

  client.on("close", () => {
    console.log("Connection closed");
  });

  client.on("error", (err) => {
    console.error("Connection error:", err.message);
  });
}

// Execute
sendRestartCommand();
