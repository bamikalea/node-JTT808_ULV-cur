const net = require("net");

// JT808 Terminal Control Commands
const COMMANDS = {
  RESTART: 0x8105, // Terminal Restart
  RESET: 0x8105, // Terminal Reset (same ID, different parameter)
  SHUTDOWN: 0x8103, // Terminal Shutdown
  PARAMETER_SET: 0x8104, // Parameter Setting
};

function createTerminalCommand(
  commandType,
  terminalId,
  sequenceNumber,
  parameter = 0x00
) {
  const buffer = Buffer.alloc(28);

  // Message ID
  buffer.writeUInt16BE(commandType, 0);

  // Message Body Property (Length: 24 bytes)
  buffer.writeUInt16BE(24, 2);

  // Terminal Phone Number (6 bytes, BCD)
  const phoneBytes = Buffer.from(terminalId.toString(), "hex");
  phoneBytes.copy(buffer, 4, 0, 6);

  // Message Sequence Number
  buffer.writeUInt16BE(sequenceNumber, 10);

  // Message Body
  let offset = 12;

  if (commandType === 0x8105) {
    // Restart/Reset Command
    buffer.writeUInt8(parameter, offset); // 0x00: Restart, 0x01: Reset
    offset += 1;
  } else if (commandType === 0x8103) {
    // Shutdown Command
    buffer.writeUInt8(parameter, offset);
    offset += 1;
  }

  // Reserved bytes - Fill with zeros
  buffer.fill(0, offset);

  return buffer;
}

function sendTerminalCommand(commandType, parameter = 0x00) {
  const terminalId = "628076842334";
  const sequenceNumber = Math.floor(Math.random() * 65536);

  let commandName = "";
  switch (commandType) {
    case 0x8105:
      commandName = parameter === 0x00 ? "Restart" : "Reset";
      break;
    case 0x8103:
      commandName = "Shutdown";
      break;
    default:
      commandName = `Command 0x${commandType.toString(16)}`;
  }

  console.log(
    `🔄 Sending Terminal ${commandName} Command to Terminal ${terminalId}`
  );
  console.log(`Command Type: 0x${commandType.toString(16)}`);
  console.log(`Parameter: 0x${parameter.toString(16)}`);
  console.log(`Sequence Number: ${sequenceNumber}`);

  const client = new net.Socket();

  client.connect(8080, "155.138.175.43", () => {
    console.log("Connected to JT808 server");

    const command = createTerminalCommand(
      commandType,
      terminalId,
      sequenceNumber,
      parameter
    );
    console.log(`Command length: ${command.length}`);
    console.log(`Command hex: ${command.toString("hex")}`);

    client.write(command, () => {
      console.log(`${commandName} command sent successfully`);
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

// Try different commands
console.log("🚀 Testing Multiple Terminal Control Commands...\n");

// 1. Try Reset instead of Restart
console.log("=== Command 1: Terminal Reset ===");
sendTerminalCommand(0x8105, 0x01); // Reset parameter

setTimeout(() => {
  console.log("\n=== Command 2: Terminal Shutdown ===");
  sendTerminalCommand(0x8103, 0x00); // Shutdown
}, 2000);

setTimeout(() => {
  console.log("\n=== Command 3: Terminal Restart ===");
  sendTerminalCommand(0x8105, 0x00); // Restart parameter
}, 4000);
