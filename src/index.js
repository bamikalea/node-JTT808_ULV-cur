const net = require("net");
const JT808Server = require("./jt808-server");
const HTTPAPIServer = require("./http-api-server");
const logger = require("./utils/logger");

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || "0.0.0.0";
const HTTP_PORT = process.env.HTTP_PORT || 3000;

const jt808Server = new JT808Server();
const httpApiServer = new HTTPAPIServer(jt808Server);

// Set up periodic connection cleanup
setInterval(() => {
  jt808Server.cleanupConnections();
}, 30000); // Run every 30 seconds

const tcpServer = net.createServer((socket) => {
  const clientAddress = socket.remoteAddress;
  const clientPort = socket.remotePort;

  logger.info(`Client connected: ${clientAddress}:${clientPort}`);

  jt808Server.handleConnection(socket);

  socket.on("close", () => {
    logger.info(`Client disconnected: ${clientAddress}:${clientPort}`);
  });

  socket.on("error", (err) => {
    logger.error(
      `Socket error: ${clientAddress}:${clientPort} - ${err.message}`
    );
  });
});

tcpServer.listen(PORT, HOST, () => {
  logger.info(`JT808 Server listening on ${HOST}:${PORT}`);

  // Start HTTP API server
  httpApiServer.start();
  logger.info(`HTTP API Server started on port ${HTTP_PORT}`);
});

tcpServer.on("error", (err) => {
  logger.error(`Server error: ${err.message}`);
});

process.on("SIGINT", () => {
  logger.info("Shutting down server...");

  // Stop HTTP API server
  httpApiServer.stop();

  tcpServer.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });
});
