const { exec } = require("child_process");

console.log("🔍 Checking JT808 Server Logs for Restart Command Response...");
console.log("📍 Server: 155.138.175.43");
console.log("");

// Check server status
exec("curl -s http://155.138.175.43:3000/status", (error, stdout, stderr) => {
  if (error) {
    console.error("❌ Error checking server status:", error.message);
    return;
  }

  try {
    const status = JSON.parse(stdout);
    console.log("📊 Current Server Status:");
    console.log(`   Server: ${status.server}`);
    console.log(`   Timestamp: ${status.timestamp}`);
    console.log(`   Connections: ${status.connections}`);
    console.log(`   Terminals: ${status.terminals.length}`);

    status.terminals.forEach((terminal) => {
      console.log(
        `   - Terminal ${terminal.terminalId}: ${
          terminal.isAuthenticated ? "Authenticated" : "Not Authenticated"
        }`
      );
    });

    console.log("");
    console.log("💡 To check detailed logs for restart response:");
    console.log(
      '   ssh root@155.138.175.43 "pm2 logs jt808-server --lines 50"'
    );
    console.log("");
    console.log("🔍 To verify JTT2019 time format in logs:");
    console.log('   Look for timestamp patterns like: "2008-15-14 31:30:00"');
    console.log("   (This indicates JTT2019 format: seconds since 2000-01-01)");
  } catch (parseError) {
    console.error("❌ Error parsing server response:", parseError.message);
    console.log("Raw response:", stdout);
  }
});
