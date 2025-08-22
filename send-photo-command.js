const net = require("net");

// JT808 Photo Capture Command (0x8801)
function createPhotoCaptureCommand(terminalId, sequenceNumber) {
  const buffer = Buffer.alloc(28);

  // Message ID: 0x8801 (Photo Capture Command)
  buffer.writeUInt16BE(0x8801, 0);

  // Message Body Property (Length: 24 bytes)
  buffer.writeUInt16BE(24, 2);

  // Terminal Phone Number (6 bytes, BCD)
  const phoneBytes = Buffer.from(terminalId.toString(), "hex");
  phoneBytes.copy(buffer, 4, 0, 6);

  // Message Sequence Number
  buffer.writeUInt16BE(sequenceNumber, 10);

  // Message Body
  let offset = 12;

  // Channel Number (1 byte) - Channel 1
  buffer.writeUInt8(1, offset);
  offset += 1;

  // Photo Command (1 byte) - 0x00: Take photo, 0x01: Upload photo
  buffer.writeUInt8(0x00, offset);
  offset += 1;

  // Photo Size (1 byte) - 0x00: 640x480, 0x01: 320x240, 0x02: 160x120
  buffer.writeUInt8(0x00, offset);
  offset += 1;

  // Quality (1 byte) - 0x01: Low, 0x02: Medium, 0x03: High
  buffer.writeUInt8(0x03, offset);
  offset += 1;

  // Brightness (1 byte) - 0x00: Low, 0x01: Medium, 0x02: High
  buffer.writeUInt8(0x01, offset);
  offset += 1;

  // Contrast (1 byte) - 0x00: Low, 0x01: Medium, 0x02: High
  buffer.writeUInt8(0x01, offset);
  offset += 1;

  // Saturation (1 byte) - 0x00: Low, 0x01: Medium, 0x02: High
  buffer.writeUInt8(0x01, offset);
  offset += 1;

  // Chroma (1 byte) - 0x00: Low, 0x01: Medium, 0x02: High
  buffer.writeUInt8(0x01, offset);
  offset += 1;

  // Reserved (16 bytes)
  buffer.fill(0x00, offset);

  return buffer;
}

// Send command to server
function sendPhotoCommand() {
  const client = new net.Socket();

  client.connect(8080, "155.138.175.43", () => {
    console.log("Connected to JT808 server");

    // Create photo capture command
    const terminalId = 0x628076842334;
    const sequenceNumber = Math.floor(Math.random() * 65536);
    const command = createPhotoCaptureCommand(terminalId, sequenceNumber);

    console.log("Sending photo capture command...");
    console.log("Terminal ID:", terminalId.toString(16));
    console.log("Sequence:", sequenceNumber);
    console.log("Command length:", command.length);
    console.log("Command hex:", command.toString("hex"));

    // Send command
    client.write(command);

    // Wait for response
    setTimeout(() => {
      console.log("Command sent successfully");
      client.destroy();
    }, 2000);
  });

  client.on("data", (data) => {
    console.log("Received response:", data.toString("hex"));
  });

  client.on("error", (err) => {
    console.error("Connection error:", err.message);
  });

  client.on("close", () => {
    console.log("Connection closed");
  });
}

// Execute
console.log("🚀 Sending Photo Capture Command to Terminal 628076842334");
sendPhotoCommand();
