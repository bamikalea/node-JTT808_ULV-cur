/**
 * JT808 Server Configuration
 */
module.exports = {
  // Server settings
  server: {
    host: process.env.HOST || "0.0.0.0",
    port: parseInt(process.env.PORT) || 8080,
    maxConnections: parseInt(process.env.MAX_CONNECTIONS) || 1000,
    connectionTimeout: parseInt(process.env.CONNECTION_TIMEOUT) || 30000, // 30 seconds
    heartbeatTimeout: parseInt(process.env.HEARTBEAT_TIMEOUT) || 60000, // 60 seconds
    cleanupInterval: parseInt(process.env.CLEANUP_INTERVAL) || 30000, // 30 seconds
  },

  // Protocol settings
  protocol: {
    // Message start/end markers
    startMarker: 0x7e,
    endMarker: 0x7e,

    // Escape characters
    escapeChar: 0x7d,
    escapeStart: 0x01,
    escapeEnd: 0x02,

    // Header lengths
    headerLength: 10,
    minMessageLength: 12, // Start marker + header + end marker

    // Supported message types
    supportedMessages: [
      0x0001, // Terminal Registration
      0x0002, // Terminal Registration Response
      0x0003, // Terminal Logout
      0x0004, // Terminal Heartbeat
      0x0100, // Terminal Authentication
      0x0200, // Location Report
      0x0201, // Location Query
      0x8001, // Platform General Response
      0x8100, // Terminal Registration Response
      0x8201, // Location Query
      0x8202, // Location Query Response
    ],
  },

  // Authentication settings
  auth: {
    enabled: process.env.AUTH_ENABLED !== "false",
    requireRegistration: process.env.REQUIRE_REGISTRATION !== "false",
    requireAuthentication: process.env.REQUIRE_AUTHENTICATION !== "false",
    maxRetries: parseInt(process.env.MAX_AUTH_RETRIES) || 3,
    sessionTimeout: parseInt(process.env.SESSION_TIMEOUT) || 3600000, // 1 hour
    allowedTerminals: process.env.ALLOWED_TERMINALS
      ? process.env.ALLOWED_TERMINALS.split(",").map((id) => parseInt(id))
      : [12345678, 87654321, 11111111, 22222222, 628076842334, 98765432109],
    authSecret: process.env.AUTH_SECRET || "JT808_SECRET",
  },

  // Location data settings
  location: {
    // Coordinate precision (decimal places)
    coordinatePrecision: 6,

    // Speed units (0: km/h, 1: mph)
    speedUnit: 0,

    // Altitude units (0: meters, 1: feet)
    altitudeUnit: 0,

    // Time format (0: UTC, 1: Local)
    timeFormat: 0,
  },

  // Logging settings
  logging: {
    level: process.env.LOG_LEVEL || "info",
    file: {
      enabled: process.env.LOG_FILE_ENABLED !== "false",
      maxSize: parseInt(process.env.LOG_MAX_SIZE) || 5242880, // 5MB
      maxFiles: parseInt(process.env.LOG_MAX_FILES) || 5,
      directory: process.env.LOG_DIRECTORY || "logs",
    },
    console: {
      enabled: process.env.LOG_CONSOLE_ENABLED !== "false",
      colors: process.env.LOG_COLORS !== "false",
    },
  },

  // Database settings (for future use)
  database: {
    enabled: process.env.DB_ENABLED === "true",
    type: process.env.DB_TYPE || "sqlite",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT) || 3306,
    name: process.env.DB_NAME || "jt808_server",
    username: process.env.DB_USERNAME || "",
    password: process.env.DB_PASSWORD || "",
  },

  // Security settings
  security: {
    // Enable message encryption
    encryption: process.env.ENCRYPTION_ENABLED === "true",

    // Enable message signing
    signing: process.env.SIGNING_ENABLED === "true",

    // Allowed IP addresses (empty array means all IPs allowed)
    allowedIPs: process.env.ALLOWED_IPS
      ? process.env.ALLOWED_IPS.split(",")
      : [],

    // Rate limiting
    rateLimit: {
      enabled: process.env.RATE_LIMIT_ENABLED === "true",
      maxMessagesPerSecond:
        parseInt(process.env.MAX_MESSAGES_PER_SECOND) || 100,
      maxConnectionsPerIP: parseInt(process.env.MAX_CONNECTIONS_PER_IP) || 10,
    },
  },

  // Performance settings
  performance: {
    // Enable connection pooling
    connectionPooling: process.env.CONNECTION_POOLING !== "false",

    // Buffer sizes
    readBufferSize: parseInt(process.env.READ_BUFFER_SIZE) || 8192,
    writeBufferSize: parseInt(process.env.WRITE_BUFFER_SIZE) || 8192,

    // Message processing
    maxConcurrentMessages: parseInt(process.env.MAX_CONCURRENT_MESSAGES) || 100,
    messageQueueSize: parseInt(process.env.MESSAGE_QUEUE_SIZE) || 1000,
  },
};
