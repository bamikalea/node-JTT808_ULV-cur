const express = require("express");
const cors = require("cors");
const logger = require("./utils/logger");

class HTTPAPIServer {
  constructor(jt808Server) {
    this.jt808Server = jt808Server;
    this.app = express();
    this.port = process.env.HTTP_PORT || 3000;

    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Logging middleware
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path} from ${req.ip}`);
      next();
    });
  }

  setupRoutes() {
    // Health check
    this.app.get("/health", (req, res) => {
      res.json({ status: "OK", timestamp: new Date().toISOString() });
    });

    // Server status
    this.app.get("/status", (req, res) => {
      const status = {
        server: "JT808_ULV Server",
        timestamp: new Date().toISOString(),
        connections: this.jt808Server.connections.size,
        terminals: Array.from(this.jt808Server.connections.values()).map(
          (conn) => ({
            terminalId: conn.terminalId,
            isAuthenticated: conn.isAuthenticated,
            isRegistered: conn.isRegistered,
            lastActivity: conn.lastActivity,
            remoteAddress: conn.remoteAddress,
          })
        ),
      };
      res.json(status);
    });

    // Get all connected terminals
    this.app.get("/api/terminals", (req, res) => {
      const terminals = Array.from(this.jt808Server.connections.values())
        .filter((conn) => conn.terminalId)
        .map((conn) => ({
          terminalId: conn.terminalId,
          isAuthenticated: conn.isAuthenticated,
          isRegistered: conn.isRegistered,
          lastActivity: conn.lastActivity,
          remoteAddress: conn.remoteAddress,
        }));
      res.json({ terminals, count: terminals.length });
    });

    // Get specific terminal info
    this.app.get("/api/terminals/:terminalId", (req, res) => {
      const { terminalId } = req.params;
      const connection =
        this.jt808Server.findConnectionByTerminalId(terminalId);

      if (!connection) {
        return res.status(404).json({ error: "Terminal not found" });
      }

      res.json({
        terminalId: connection.terminalId,
        isAuthenticated: connection.isAuthenticated,
        isRegistered: connection.isRegistered,
        lastActivity: connection.lastActivity,
        remoteAddress: connection.remoteAddress,
        multimediaEvents: connection.multimediaEvents
          ? Array.from(connection.multimediaEvents.values())
          : [],
      });
    });

    // Trigger media capture from platform
    this.app.post("/api/multimedia/trigger", (req, res) => {
      const { terminalId, action, channelId, multimediaDataId } = req.body;

      if (!terminalId || !action) {
        return res
          .status(400)
          .json({ error: "Missing required fields: terminalId, action" });
      }

      const connection =
        this.jt808Server.findConnectionByTerminalId(terminalId);
      if (!connection) {
        return res.status(404).json({ error: "Terminal not connected" });
      }

      if (!connection.isAuthenticated) {
        return res.status(403).json({ error: "Terminal not authenticated" });
      }

      try {
        // Send platform instruction to trigger media capture
        const success = this.jt808Server.sendPlatformInstruction(connection, {
          action,
          channelId: channelId || 1,
          multimediaDataId: multimediaDataId || Date.now(),
        });

        if (success) {
          res.json({
            success: true,
            message: `Media capture triggered for terminal ${terminalId}`,
            action,
            channelId: channelId || 1,
            multimediaDataId: multimediaDataId || Date.now(),
          });
        } else {
          res
            .status(500)
            .json({ error: "Failed to send platform instruction" });
        }
      } catch (error) {
        logger.error(`Error triggering media capture: ${error.message}`);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    // Request specific media upload
    this.app.post("/api/multimedia/request", (req, res) => {
      const { terminalId, type, format, event } = req.body;

      if (!terminalId || !type) {
        return res
          .status(400)
          .json({ error: "Missing required fields: terminalId, type" });
      }

      const connection =
        this.jt808Server.findConnectionByTerminalId(terminalId);
      if (!connection) {
        return res.status(404).json({ error: "Terminal not connected" });
      }

      if (!connection.isAuthenticated) {
        return res.status(403).json({ error: "Terminal not authenticated" });
      }

      try {
        // Send multimedia request to terminal
        const success = this.jt808Server.sendMultimediaRequest(connection, {
          type: type || "image",
          format: format || "jpeg",
          event: event || "platform_instruction",
          channelId: 1,
        });

        if (success) {
          res.json({
            success: true,
            message: `Multimedia request sent to terminal ${terminalId}`,
            type: type || "image",
            format: format || "jpeg",
            event: event || "platform_instruction",
          });
        } else {
          res.status(500).json({ error: "Failed to send multimedia request" });
        }
      } catch (error) {
        logger.error(`Error requesting multimedia: ${error.message}`);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    // Send platform response (0x8800)
    this.app.post("/api/multimedia/response", (req, res) => {
      const { terminalId, multimediaDataId, action, packetIds } = req.body;

      if (!terminalId || !multimediaDataId) {
        return res
          .status(400)
          .json({
            error: "Missing required fields: terminalId, multimediaDataId",
          });
      }

      const connection =
        this.jt808Server.findConnectionByTerminalId(terminalId);
      if (!connection) {
        return res.status(404).json({ error: "Terminal not connected" });
      }

      if (!connection.isAuthenticated) {
        return res.status(403).json({ error: "Terminal not authenticated" });
      }

      try {
        // Send platform response to terminal
        const success = this.jt808Server.sendPlatformResponse(connection, {
          multimediaDataId,
          action: action || "retransmit",
          packetIds: packetIds || [],
        });

        if (success) {
          res.json({
            success: true,
            message: `Platform response sent to terminal ${terminalId}`,
            multimediaDataId,
            action: action || "retransmit",
            packetIds: packetIds || [],
          });
        } else {
          res.status(500).json({ error: "Failed to send platform response" });
        }
      } catch (error) {
        logger.error(`Error sending platform response: ${error.message}`);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    // 🖼️ Photo Capture Endpoint (NEW)
    this.app.post("/api/photo/capture", (req, res) => {
      const { terminalId, channelId = 1, quality = "high" } = req.body;

      if (!terminalId) {
        return res
          .status(400)
          .json({ error: "Missing required field: terminalId" });
      }

      const connection =
        this.jt808Server.findConnectionByTerminalId(terminalId);
      if (!connection) {
        return res.status(404).json({ error: "Terminal not connected" });
      }

      if (!connection.isAuthenticated) {
        return res.status(403).json({ error: "Terminal not authenticated" });
      }

      try {
        logger.info(
          `📸 Photo capture requested for terminal ${terminalId}, channel ${channelId}`
        );

        // Send photo capture command using 0x0800/0x0801 system
        const success = this.jt808Server.sendPhotoCaptureCommand(connection, {
          terminalId,
          channelId,
          quality,
          timestamp: Date.now(),
        });

        if (success) {
          res.json({
            success: true,
            message: `Photo capture triggered for terminal ${terminalId}`,
            channelId,
            quality,
            timestamp: Date.now(),
            note: "Device will send 0x0800 (event) then 0x0801 (data)",
          });
        } else {
          res
            .status(500)
            .json({ error: "Failed to send photo capture command" });
        }
      } catch (error) {
        logger.error(`Error triggering photo capture: ${error.message}`);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    // Get recent media uploads
    this.app.get("/api/multimedia/uploads", (req, res) => {
      const { limit = 50, terminalId } = req.query;

      try {
        const uploads = this.jt808Server.getRecentMultimediaUploads(
          limit,
          terminalId
        );
        res.json({ uploads, count: uploads.length });
      } catch (error) {
        logger.error(`Error getting multimedia uploads: ${error.message}`);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    // Get media for specific terminal
    this.app.get("/api/multimedia/terminal/:terminalId", (req, res) => {
      const { terminalId } = req.params;
      const { limit = 50 } = req.query;

      try {
        const uploads = this.jt808Server.getRecentMultimediaUploads(
          limit,
          terminalId
        );
        res.json({ terminalId, uploads, count: uploads.length });
      } catch (error) {
        logger.error(`Error getting terminal multimedia: ${error.message}`);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    // ============================================================================
    // File Upload Protocol Endpoints
    // ============================================================================

    // Query device multimedia resources (0x9205)
    this.app.post("/api/multimedia/query", (req, res) => {
      const {
        terminalId,
        channelNumber = 1,
        resourceType = 0,
        streamType = 0,
        memoryType = 0,
        startTime,
        endTime,
        alarmSign = 0,
      } = req.body;

      if (!terminalId) {
        return res
          .status(400)
          .json({ error: "Missing required field: terminalId" });
      }

      const connection =
        this.jt808Server.findConnectionByTerminalId(terminalId);
      if (!connection) {
        return res.status(404).json({ error: "Terminal not connected" });
      }

      if (!connection.isAuthenticated) {
        return res.status(403).json({ error: "Terminal not authenticated" });
      }

      try {
        logger.info(`Resource query requested for terminal ${terminalId}`);
        logger.info(
          `Parameters: channelNumber=${channelNumber}, resourceType=${resourceType}, streamType=${streamType}, memoryType=${memoryType}, alarmSign=${alarmSign}`
        );

        // Set default time range if not provided (last 24 hours)
        const defaultStartTime =
          startTime || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const defaultEndTime = endTime || new Date().toISOString();
        logger.info(`Time range: ${defaultStartTime} to ${defaultEndTime}`);

        // Send resource query command using 0x9205
        const success = this.jt808Server.sendResourceQuery(
          terminalId,
          channelNumber,
          resourceType,
          streamType,
          memoryType,
          defaultStartTime,
          defaultEndTime,
          alarmSign
        );

        if (success) {
          res.json({
            success: true,
            message: `Resource query sent to terminal ${terminalId}`,
            query: {
              channelNumber,
              resourceType,
              streamType,
              memoryType,
              startTime: defaultStartTime,
              endTime: defaultEndTime,
              alarmSign,
            },
            note: "Device will respond with 0x1205 message containing resource list",
          });
        } else {
          res.status(500).json({ error: "Failed to send resource query" });
        }
      } catch (error) {
        logger.error(`Error sending resource query: ${error.message}`);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    /**
     * ULV Parameter Query (0xB050) - Get device configuration and file info
     */
    this.app.post("/api/ulv/parameters", (req, res) => {
      const { terminalId, cmdType, paramType } = req.body;

      if (!terminalId || !cmdType || !paramType) {
        return res.status(400).json({
          error: "Missing required fields: terminalId, cmdType, paramType",
        });
      }

      const connection =
        this.jt808Server.findConnectionByTerminalId(terminalId);
      if (!connection) {
        return res.status(404).json({ error: "Terminal not connected" });
      }

      if (!connection.isAuthenticated) {
        return res.status(403).json({ error: "Terminal not authenticated" });
      }

      try {
        logger.info(`ULV Parameter query requested for terminal ${terminalId}`);
        logger.info(`Parameters: cmdType=${cmdType}, paramType=${paramType}`);

        const success = this.jt808Server.sendULVParameterQuery(
          terminalId,
          cmdType,
          paramType
        );

        if (success) {
          res.json({
            success: true,
            message: `ULV parameter query sent to terminal ${terminalId}`,
            query: {
              cmdType,
              paramType,
            },
            note: "Device will respond with 0xB051 message containing parameter data",
          });
        } else {
          res.status(500).json({ error: "Failed to send ULV parameter query" });
        }
      } catch (error) {
        logger.error(`Error sending ULV parameter query: ${error.message}`);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    /**
     * Enhanced ULV Resource Query (0x9205) with ULV-specific parameters
     */
    this.app.post("/api/ulv/resources/query", (req, res) => {
      const {
        terminalId,
        ulvEnhanced = true,
        startTime,
        endTime,
        alarmSign = "0x0000000000000000",
        resourceType = 0,
        streamType = 0,
        memoryType = 0,
        fileType = null, // ULV file type: 00=Image, 01=Audio, 02=Video, 03=Text, 04=Other
        channelMask = 255, // Channel mask for ULV files
        alarmTypes = [], // ULV alarm types like ["6401", "6402"]
      } = req.body;

      if (!terminalId) {
        return res
          .status(400)
          .json({ error: "Missing required field: terminalId" });
      }

      const connection =
        this.jt808Server.findConnectionByTerminalId(terminalId);
      if (!connection) {
        return res.status(404).json({ error: "Terminal not connected" });
      }

      if (!connection.isAuthenticated) {
        return res.status(403).json({ error: "Terminal not authenticated" });
      }

      try {
        logger.info(
          `Enhanced ULV Resource Query requested for terminal ${terminalId}`
        );
        logger.info(
          `ULV Parameters: fileType=${fileType}, channelMask=${channelMask}, alarmTypes=${JSON.stringify(
            alarmTypes
          )}`
        );

        // Set default time range if not provided (last 24 hours)
        const defaultStartTime =
          startTime || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const defaultEndTime = endTime || new Date().toISOString();

        // Convert alarm sign to appropriate format
        let finalAlarmSign;
        if (typeof alarmSign === "string" && alarmSign.startsWith("0x")) {
          finalAlarmSign = BigInt(alarmSign);
        } else if (typeof alarmSign === "number") {
          finalAlarmSign = BigInt(alarmSign);
        } else {
          finalAlarmSign = BigInt(0);
        }

        const success = this.jt808Server.sendEnhancedResourceQuery(
          terminalId,
          resourceType,
          streamType,
          memoryType,
          defaultStartTime,
          defaultEndTime,
          finalAlarmSign,
          ulvEnhanced,
          fileType,
          channelMask,
          alarmTypes
        );

        if (success) {
          res.json({
            success: true,
            message: `Enhanced ULV Resource Query sent to terminal ${terminalId}`,
            query: {
              ulvEnhanced,
              resourceType,
              streamType,
              memoryType,
              startTime: defaultStartTime,
              endTime: defaultEndTime,
              alarmSign: alarmSign,
              fileType,
              channelMask,
              alarmTypes,
            },
            note: "Device will respond with 0x1205 message containing ULV resource list",
          });
        } else {
          res
            .status(500)
            .json({ error: "Failed to send enhanced resource query" });
        }
      } catch (error) {
        logger.error(
          `Error sending enhanced ULV resource query: ${error.message}`
        );
        res.status(500).json({ error: "Internal server error" });
      }
    });

    /**
     * ULV File Discovery and Access (0xB060) - Discover and list ULV files
     */
    this.app.post("/api/ulv/files/discover", (req, res) => {
      const {
        terminalId,
        discoveryType = "full", // 'full', 'quick', 'metadata'
        storageLocation = 1, // 1=SD0, 2=Disk1, 0=All
        fileTypes = ["00", "01", "02", "03", "04"], // 00=Image, 01=Audio, 02=Video, 03=Text, 04=Other
        includeMetadata = true,
        maxResults = 100,
      } = req.body;

      if (!terminalId) {
        return res.status(400).json({
          error: "Missing required field: terminalId",
        });
      }

      const connection =
        this.jt808Server.findConnectionByTerminalId(terminalId);
      if (!connection) {
        return res.status(404).json({ error: "Terminal not connected" });
      }

      if (!connection.isAuthenticated) {
        return res.status(403).json({ error: "Terminal not authenticated" });
      }

      try {
        logger.info(`ULV File Discovery requested for terminal ${terminalId}`);
        logger.info(
          `Discovery Type: ${discoveryType}, Storage: ${storageLocation}, File Types: ${fileTypes.join(
            ","
          )}`
        );

        const success = this.jt808Server.sendULVFileDiscovery(
          terminalId,
          discoveryType,
          storageLocation,
          fileTypes,
          includeMetadata,
          maxResults
        );

        if (success) {
          res.json({
            success: true,
            message: `ULV File Discovery initiated for terminal ${terminalId}`,
            discovery: {
              type: discoveryType,
              storageLocation,
              fileTypes,
              includeMetadata,
              maxResults,
            },
            note: "Device will respond with 0xB061 message containing file discovery results",
          });
        } else {
          res
            .status(500)
            .json({ error: "Failed to initiate ULV file discovery" });
        }
      } catch (error) {
        logger.error(`Error initiating ULV file discovery: ${error.message}`);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    /**
     * ULV File Metadata Query (0xB062) - Get detailed file information
     */
    this.app.post("/api/ulv/files/metadata", (req, res) => {
      const {
        terminalId,
        fileName, // Specific file name to query
        filePath, // File path on device
        includeContent = false, // Include file content preview
      } = req.body;

      if (!terminalId || !fileName) {
        return res.status(400).json({
          error: "Missing required fields: terminalId, fileName",
        });
      }

      const connection =
        this.jt808Server.findConnectionByTerminalId(terminalId);
      if (!connection) {
        return res.status(404).json({ error: "Terminal not connected" });
      }

      if (!connection.isAuthenticated) {
        return res.status(403).json({ error: "Terminal not authenticated" });
      }

      try {
        logger.info(
          `ULV File Metadata requested for ${fileName} on terminal ${terminalId}`
        );

        const success = this.jt808Server.sendULVFileMetadataQuery(
          terminalId,
          fileName,
          filePath,
          includeContent
        );

        if (success) {
          res.json({
            success: true,
            message: `ULV File Metadata query sent for ${fileName}`,
            query: {
              fileName,
              filePath,
              includeContent,
            },
            note: "Device will respond with 0xB063 message containing file metadata",
          });
        } else {
          res.status(500).json({ error: "Failed to query file metadata" });
        }
      } catch (error) {
        logger.error(`Error querying file metadata: ${error.message}`);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    /**
     * ULV File Access (0xB064) - Access and download ULV files
     */
    this.app.post("/api/ulv/files/access", (req, res) => {
      const {
        terminalId,
        fileName, // Specific file name to access
        filePath, // File path on device
        accessType = "download", // 'download', 'preview', 'stream'
        startOffset = 0, // Start byte offset for partial download
        maxBytes = 0, // Maximum bytes to download (0 = full file)
      } = req.body;

      if (!terminalId || !fileName) {
        return res.status(400).json({
          error: "Missing required fields: terminalId, fileName",
        });
      }

      const connection =
        this.jt808Server.findConnectionByTerminalId(terminalId);
      if (!connection) {
        return res.status(404).json({ error: "Terminal not connected" });
      }

      if (!connection.isAuthenticated) {
        return res.status(403).json({ error: "Terminal not authenticated" });
      }

      try {
        logger.info(
          `ULV File Access requested for ${fileName} on terminal ${terminalId}`
        );

        const success = this.jt808Server.sendULVFileAccess(
          terminalId,
          fileName,
          filePath,
          accessType,
          startOffset,
          maxBytes
        );

        if (success) {
          res.json({
            success: true,
            message: `ULV File Access request sent for ${fileName}`,
            access: {
              fileName,
              filePath,
              accessType,
              startOffset,
              maxBytes,
            },
            note: "Device will respond with 0xB065 message containing file data",
          });
        } else {
          res.status(500).json({ error: "Failed to request file access" });
        }
      } catch (error) {
        logger.error(`Error requesting file access: ${error.message}`);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    /**
     * Get ULV File Discovery Results
     */
    this.app.get("/api/ulv/files/discovery/:terminalId", (req, res) => {
      const { terminalId } = req.params;

      const connection =
        this.jt808Server.findConnectionByTerminalId(terminalId);
      if (!connection) {
        return res.status(404).json({ error: "Terminal not connected" });
      }

      if (!connection.isAuthenticated) {
        return res.status(403).json({ error: "Terminal not authenticated" });
      }

      try {
        if (connection.ulvFileDiscovery) {
          res.json({
            success: true,
            terminalId,
            discovery: connection.ulvFileDiscovery,
            timestamp: new Date().toISOString(),
          });
        } else {
          res.json({
            success: true,
            terminalId,
            discovery: null,
            message: "No file discovery results available",
          });
        }
      } catch (error) {
        logger.error(`Error getting file discovery results: ${error.message}`);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    // ============================================================================
    // Alternative Configuration Endpoints (from advanced-troubleshooting.md)
    // ============================================================================

    /**
     * Set device parameters for video streaming (0x8103)
     */
    this.app.post("/api/terminal/set-params", (req, res) => {
      const { terminalId, parameters } = req.body;

      if (!terminalId) {
        return res
          .status(400)
          .json({ error: "Missing required field: terminalId" });
      }

      const connection =
        this.jt808Server.findConnectionByTerminalId(terminalId);
      if (!connection) {
        return res.status(404).json({ error: "Terminal not connected" });
      }

      if (!connection.isAuthenticated) {
        return res.status(403).json({ error: "Terminal not authenticated" });
      }

      try {
        logger.info(`📹 Setting video parameters for terminal ${terminalId}`);

        const success = this.jt808Server.setVideoStreamingParameters(
          terminalId,
          parameters
        );

        if (success) {
          res.json({
            success: true,
            message: `Video streaming parameters set for terminal ${terminalId}`,
            parameters: parameters || {
              "0x0070": 1, // Enable video upload
              "0x0064": 2, // Set 720P resolution
              "0x0065": 5, // Set medium quality
            },
          });
        } else {
          res.status(500).json({ error: "Failed to set video parameters" });
        }
      } catch (error) {
        logger.error(`Error setting video parameters: ${error.message}`);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    /**
     * Restart terminal device (0x8105)
     */
    this.app.post("/api/terminal/restart", (req, res) => {
      const { terminalId } = req.body;

      if (!terminalId) {
        return res
          .status(400)
          .json({ error: "Missing required field: terminalId" });
      }

      const connection =
        this.jt808Server.findConnectionByTerminalId(terminalId);
      if (!connection) {
        return res.status(404).json({ error: "Terminal not connected" });
      }

      if (!connection.isAuthenticated) {
        return res.status(403).json({ error: "Terminal not authenticated" });
      }

      try {
        logger.info(`🔄 Restarting terminal ${terminalId}`);

        const success = this.jt808Server.restartTerminal(terminalId);

        if (success) {
          res.json({
            success: true,
            message: `Restart command sent to terminal ${terminalId}`,
            note: "Terminal will disconnect and reconnect after restart",
          });
        } else {
          res.status(500).json({ error: "Failed to send restart command" });
        }
      } catch (error) {
        logger.error(`Error restarting terminal: ${error.message}`);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    /**
     * Query terminal version and capabilities (0x8107)
     */
    this.app.post("/api/terminal/version", (req, res) => {
      const { terminalId } = req.body;

      if (!terminalId) {
        return res
          .status(400)
          .json({ error: "Missing required field: terminalId" });
      }

      const connection =
        this.jt808Server.findConnectionByTerminalId(terminalId);
      if (!connection) {
        return res.status(404).json({ error: "Terminal not connected" });
      }

      if (!connection.isAuthenticated) {
        return res.status(403).json({ error: "Terminal not authenticated" });
      }

      try {
        logger.info(`📋 Querying version for terminal ${terminalId}`);

        const success = this.jt808Server.queryTerminalVersion(terminalId);

        if (success) {
          res.json({
            success: true,
            message: `Version query sent to terminal ${terminalId}`,
            note: "Terminal will respond with version and capability information",
          });
        } else {
          res.status(500).json({ error: "Failed to query terminal version" });
        }
      } catch (error) {
        logger.error(`Error querying terminal version: ${error.message}`);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    /**
     * Request JT1078 live video streaming (0x9101)
     */
    this.app.post("/api/streaming/jt1078", (req, res) => {
      const { terminalId, channelId = 1, dataType = 0 } = req.body;

      if (!terminalId) {
        return res
          .status(400)
          .json({ error: "Missing required field: terminalId" });
      }

      const connection =
        this.jt808Server.findConnectionByTerminalId(terminalId);
      if (!connection) {
        return res.status(404).json({ error: "Terminal not connected" });
      }

      if (!connection.isAuthenticated) {
        return res.status(403).json({ error: "Terminal not authenticated" });
      }

      try {
        logger.info(
          `🎥 Requesting JT1078 live video for terminal ${terminalId}`
        );

        const success = this.jt808Server.requestJT1078LiveVideo(
          terminalId,
          channelId,
          dataType
        );

        if (success) {
          res.json({
            success: true,
            message: `JT1078 live video request sent to terminal ${terminalId}`,
            channelId,
            dataType,
            port: 1935,
            note: "Device will stream to port 1935 using JT1078 protocol",
          });
        } else {
          res.status(500).json({ error: "Failed to request JT1078 video" });
        }
      } catch (error) {
        logger.error(`Error requesting JT1078 video: ${error.message}`);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    /**
     * Start alternative UDP streaming on different port
     */
    this.app.post("/api/streaming/udp-alternative", (req, res) => {
      const { terminalId, port = 1935 } = req.body;

      if (!terminalId) {
        return res
          .status(400)
          .json({ error: "Missing required field: terminalId" });
      }

      const connection =
        this.jt808Server.findConnectionByTerminalId(terminalId);
      if (!connection) {
        return res.status(404).json({ error: "Terminal not connected" });
      }

      if (!connection.isAuthenticated) {
        return res.status(403).json({ error: "Terminal not authenticated" });
      }

      try {
        logger.info(
          `📡 Starting alternative UDP streaming for terminal ${terminalId} on port ${port}`
        );

        const success = this.jt808Server.startAlternativeUDPStreaming(
          terminalId,
          port
        );

        if (success) {
          res.json({
            success: true,
            message: `Alternative UDP streaming started for terminal ${terminalId}`,
            port,
            protocol: "UDP",
            note: "UDP server listening on alternative port",
          });
        } else {
          res
            .status(500)
            .json({ error: "Failed to start alternative UDP streaming" });
        }
      } catch (error) {
        logger.error(
          `Error starting alternative UDP streaming: ${error.message}`
        );
        res.status(500).json({ error: "Internal server error" });
      }
    });

    /**
     * Start TCP streaming
     */
    this.app.post("/api/streaming/tcp", (req, res) => {
      const { terminalId, port = 1936 } = req.body;

      if (!terminalId) {
        return res
          .status(400)
          .json({ error: "Missing required field: terminalId" });
      }

      const connection =
        this.jt808Server.findConnectionByTerminalId(terminalId);
      if (!connection) {
        return res.status(404).json({ error: "Terminal not connected" });
      }

      if (!connection.isAuthenticated) {
        return res.status(403).json({ error: "Terminal not authenticated" });
      }

      try {
        logger.info(
          `📡 Starting TCP streaming for terminal ${terminalId} on port ${port}`
        );

        const success = this.jt808Server.startTCPStreaming(terminalId, port);

        if (success) {
          res.json({
            success: true,
            message: `TCP streaming started for terminal ${terminalId}`,
            port,
            protocol: "TCP",
            note: "TCP server listening for streaming connections",
          });
        } else {
          res.status(500).json({ error: "Failed to start TCP streaming" });
        }
      } catch (error) {
        logger.error(`Error starting TCP streaming: ${error.message}`);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    /**
     * Verify device hardware capabilities
     */
    this.app.post("/api/terminal/verify-hardware", (req, res) => {
      const { terminalId } = req.body;

      if (!terminalId) {
        return res
          .status(400)
          .json({ error: "Missing required field: terminalId" });
      }

      const connection =
        this.jt808Server.findConnectionByTerminalId(terminalId);
      if (!connection) {
        return res.status(404).json({ error: "Terminal not connected" });
      }

      if (!connection.isAuthenticated) {
        return res.status(403).json({ error: "Terminal not authenticated" });
      }

      try {
        logger.info(`🔧 Verifying hardware for terminal ${terminalId}`);

        const success = this.jt808Server.verifyDeviceHardware(terminalId);

        if (success) {
          res.json({
            success: true,
            message: `Hardware verification request sent to terminal ${terminalId}`,
            note: "Terminal will respond with hardware capability information",
          });
        } else {
          res.status(500).json({ error: "Failed to verify device hardware" });
        }
      } catch (error) {
        logger.error(`Error verifying device hardware: ${error.message}`);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    /**
     * Get alternative streaming status
     */
    this.app.get("/api/streaming/status/:terminalId", (req, res) => {
      const { terminalId } = req.params;

      const connection =
        this.jt808Server.findConnectionByTerminalId(terminalId);
      if (!connection) {
        return res.status(404).json({ error: "Terminal not connected" });
      }

      try {
        const status = {
          terminalId,
          isConnected: true,
          isAuthenticated: connection.isAuthenticated,
          alternativeServers: connection.alternativeServers
            ? connection.alternativeServers.length
            : 0,
          streamingSessions: connection.streamingSessions
            ? connection.streamingSessions.size
            : 0,
          lastActivity: connection.lastActivity,
          capabilities: {
            supportsJT1078: true,
            supportsUDP: true,
            supportsTCP: true,
            supportsAlternativePorts: true,
          },
        };

        res.json({
          success: true,
          status,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        logger.error(`Error getting streaming status: ${error.message}`);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    /**
     * Get ULV File Discovery Results
     */
    this.app.get("/api/ulv/files/discovery/:terminalId", (req, res) => {
      const { terminalId } = req.params;

      const connection =
        this.jt808Server.findConnectionByTerminalId(terminalId);
      if (!connection) {
        return res.status(404).json({ error: "Terminal not connected" });
      }

      if (!connection.isAuthenticated) {
        return res.status(403).json({ error: "Terminal not authenticated" });
      }

      try {
        if (connection.ulvFileDiscovery) {
          res.json({
            success: true,
            terminalId,
            discovery: connection.ulvFileDiscovery,
            timestamp: new Date().toISOString(),
          });
        } else {
          res.json({
            success: true,
            terminalId,
            discovery: null,
            message:
              "No file discovery results available. Use /api/ulv/files/discover to initiate discovery.",
            timestamp: new Date().toISOString(),
          });
        }
      } catch (error) {
        logger.error(
          `Error retrieving file discovery results: ${error.message}`
        );
        res.status(500).json({ error: "Internal server error" });
      }
    });

    // Send file upload instructions to terminal (0x9206)
    this.app.post("/api/file-upload/instructions", (req, res) => {
      const {
        terminalId,
        ftpServer,
        ftpPort,
        username,
        password,
        uploadPath,
        channelNumber,
        startTime,
        endTime,
        resourceType,
        streamType,
        storageLocation,
        wifiEnabled,
        lanEnabled,
        mobileEnabled,
      } = req.body;

      if (!terminalId || !ftpServer || !username || !password) {
        return res
          .status(400)
          .json({
            error:
              "Missing required fields: terminalId, ftpServer, username, password",
          });
      }

      const connection =
        this.jt808Server.findConnectionByTerminalId(terminalId);
      if (!connection) {
        return res.status(404).json({ error: "Terminal not connected" });
      }

      if (!connection.isAuthenticated) {
        return res.status(403).json({ error: "Terminal not authenticated" });
      }

      try {
        const success = this.jt808Server.sendFileUploadInstructions(
          terminalId,
          ftpServer,
          ftpPort || 21,
          username,
          password,
          uploadPath || "/",
          channelNumber || 1,
          startTime || new Date().toISOString(),
          endTime || new Date().toISOString(),
          resourceType || 0,
          streamType || 0,
          storageLocation || 0,
          wifiEnabled || false,
          lanEnabled || false,
          mobileEnabled || false
        );

        if (success) {
          res.json({
            success: true,
            message: `File upload instructions sent to terminal ${terminalId}`,
            timestamp: new Date().toISOString(),
          });
        } else {
          res
            .status(500)
            .json({ error: "Failed to send file upload instructions" });
        }
      } catch (error) {
        logger.error(
          `Error sending file upload instructions: ${error.message}`
        );
        res.status(500).json({ error: "Internal server error" });
      }
    });

    // Control file upload process (0x9207)
    this.app.post("/api/file-upload/control", (req, res) => {
      const { terminalId, action, responseSerial } = req.body;

      if (!terminalId || !action) {
        return res
          .status(400)
          .json({ error: "Missing required fields: terminalId, action" });
      }

      const actionMap = { pause: 0, continue: 1, cancel: 2 };
      const actionCode = actionMap[action.toLowerCase()];

      if (actionCode === undefined) {
        return res
          .status(400)
          .json({
            error: "Invalid action. Must be: pause, continue, or cancel",
          });
      }

      const connection =
        this.jt808Server.findConnectionByTerminalId(terminalId);
      if (!connection) {
        return res.status(404).json({ error: "Terminal not connected" });
      }

      if (!connection.isAuthenticated) {
        return res.status(403).json({ error: "Terminal not authenticated" });
      }

      try {
        const success = this.jt808Server.sendFileUploadControl(
          terminalId,
          actionCode,
          responseSerial || 0
        );

        if (success) {
          res.json({
            success: true,
            message: `File upload ${action} command sent to terminal ${terminalId}`,
            timestamp: new Date().toISOString(),
          });
        } else {
          res
            .status(500)
            .json({ error: `Failed to send file upload ${action} command` });
        }
      } catch (error) {
        logger.error(`Error sending file upload control: ${error.message}`);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    // Send terminal control commands (0x8105)
    this.app.post("/api/terminal/control", (req, res) => {
      try {
        const { terminalId, command } = req.body;

        if (!terminalId || !command) {
          return res.status(400).json({
            success: false,
            error: "Missing required parameters: terminalId and command",
          });
        }

        // Validate command
        const validCommands = [
          "disconnect_oil",
          "recovery_oil",
          "disconnect_circuit",
          "recovery_circuit",
          "restart_device",
        ];
        if (!validCommands.includes(command)) {
          return res.status(400).json({
            success: false,
            error: `Invalid command. Valid commands are: ${validCommands.join(
              ", "
            )}`,
          });
        }

        // Find the terminal connection
        const connection =
          this.jt808Server.findConnectionByTerminalId(terminalId);
        if (!connection) {
          return res.status(404).json({
            success: false,
            error: `Terminal ${terminalId} not found or not connected`,
          });
        }

        // Send terminal control command
        const success = this.jt808Server.sendPlatformInstruction(connection, {
          action: command,
          terminalId: terminalId,
        });

        if (success) {
          res.json({
            success: true,
            message: `Terminal control command '${command}' sent to terminal ${terminalId}`,
            command: command,
            terminalId: terminalId,
            timestamp: new Date().toISOString(),
          });
        } else {
          res.status(500).json({
            success: false,
            error: `Failed to send terminal control command '${command}' to terminal ${terminalId}`,
          });
        }
      } catch (error) {
        logger.error(`Error in terminal control endpoint: ${error.message}`);
        res.status(500).json({
          success: false,
          error: "Internal server error",
        });
      }
    });

    // Error handling
    this.app.use((err, req, res, next) => {
      logger.error(`HTTP API Error: ${err.message}`);
      res.status(500).json({ error: "Internal server error" });
    });

    // ============================================================================
    // Audio/Video Streaming Endpoints (ULV Protocol)
    // ============================================================================

    /**
     * Start Audio/Video Streaming
     * POST /api/streaming/start
     */
    this.app.post("/api/streaming/start", (req, res) => {
      const {
        terminalId,
        channelNumber = 1,
        streamType = 0,
        quality = 0,
        frameRate = 25,
        bitrate = 0,
        audioEnabled = true,
        videoEnabled = true,
      } = req.body;

      if (!terminalId) {
        return res
          .status(400)
          .json({ error: "Missing required field: terminalId" });
      }

      try {
        logger.info(`🎥 Streaming start request for terminal ${terminalId}`);
        logger.info(
          `  Channel: ${channelNumber}, Stream: ${streamType}, Quality: ${quality}`
        );
        logger.info(
          `  Frame Rate: ${frameRate}, Audio: ${audioEnabled}, Video: ${videoEnabled}`
        );

        const sessionId = this.jt808Server.startStreaming(terminalId, {
          channelNumber,
          streamType,
          quality,
          frameRate,
          bitrate,
          audioEnabled,
          videoEnabled,
        });

        if (sessionId) {
          logger.info(`✅ Streaming started successfully: ${sessionId}`);
          res.json({
            success: true,
            sessionId,
            message: `Streaming started for terminal ${terminalId}`,
            details: {
              channelNumber,
              streamType,
              quality,
              frameRate,
              bitrate,
              audioEnabled,
              videoEnabled,
            },
          });
        } else {
          logger.error(
            `❌ Failed to start streaming for terminal ${terminalId}`
          );
          res.status(500).json({
            error: "Failed to start streaming",
            message: "Device may not be connected or streaming not supported",
          });
        }
      } catch (error) {
        logger.error(`Error starting streaming: ${error.message}`);
        res
          .status(500)
          .json({ error: "Internal server error", message: error.message });
      }
    });

    /**
     * Stop Audio/Video Streaming
     * POST /api/streaming/stop
     */
    this.app.post("/api/streaming/stop", (req, res) => {
      const { terminalId, sessionId } = req.body;

      if (!terminalId || !sessionId) {
        return res
          .status(400)
          .json({ error: "Missing required fields: terminalId, sessionId" });
      }

      try {
        logger.info(
          `🛑 Streaming stop request for terminal ${terminalId}, session ${sessionId}`
        );

        const success = this.jt808Server.stopStreaming(terminalId, sessionId);

        if (success) {
          logger.info(`✅ Streaming stopped successfully: ${sessionId}`);
          res.json({
            success: true,
            message: `Streaming stopped for session ${sessionId}`,
            sessionId,
          });
        } else {
          logger.error(`❌ Failed to stop streaming session ${sessionId}`);
          res.status(500).json({
            error: "Failed to stop streaming",
            message: "Session not found or already stopped",
          });
        }
      } catch (error) {
        logger.error(`Error stopping streaming: ${error.message}`);
        res
          .status(500)
          .json({ error: "Internal server error", message: error.message });
      }
    });

    /**
     * Get Streaming Status
     * GET /api/streaming/status/:terminalId
     */
    this.app.get("/api/streaming/status/:terminalId", (req, res) => {
      const { terminalId } = req.params;
      const { sessionId } = req.query;

      try {
        logger.info(
          `📊 Streaming status request for terminal ${terminalId}${
            sessionId ? `, session ${sessionId}` : ""
          }`
        );

        const status = this.jt808Server.getStreamingStatus(
          terminalId,
          sessionId
        );

        if (status) {
          res.json({
            success: true,
            status,
            terminalId,
          });
        } else {
          res.status(404).json({
            error: "No streaming sessions found",
            terminalId,
          });
        }
      } catch (error) {
        logger.error(`Error getting streaming status: ${error.message}`);
        res
          .status(500)
          .json({ error: "Internal server error", message: error.message });
      }
    });

    /**
     * Get Streaming Statistics
     * GET /api/streaming/stats/:terminalId/:sessionId
     */
    this.app.get("/api/streaming/stats/:terminalId/:sessionId", (req, res) => {
      const { terminalId, sessionId } = req.params;

      try {
        logger.info(
          `📈 Streaming statistics request for terminal ${terminalId}, session ${sessionId}`
        );

        const stats = this.jt808Server.getStreamingStatistics(
          terminalId,
          sessionId
        );

        if (stats) {
          res.json({
            success: true,
            stats,
            terminalId,
            sessionId,
          });
        } else {
          res.status(404).json({
            error: "Streaming session not found",
            terminalId,
            sessionId,
          });
        }
      } catch (error) {
        logger.error(`Error getting streaming statistics: ${error.message}`);
        res
          .status(500)
          .json({ error: "Internal server error", message: error.message });
      }
    });

    /**
     * List All Active Streaming Sessions
     * GET /api/streaming/sessions
     */
    this.app.get("/api/streaming/sessions", (req, res) => {
      try {
        logger.info(`📋 Listing all streaming sessions`);

        const allSessions = [];
        const connections = this.jt808Server.connections;

        for (const [connectionId, connection] of connections) {
          if (
            connection.streamingSessions &&
            connection.streamingSessions.size > 0
          ) {
            for (const [sessionId, session] of connection.streamingSessions) {
              allSessions.push({
                connectionId,
                terminalId: connection.terminalId,
                sessionId,
                status: session.status,
                startTime: session.startTime,
                channelNumber: session.channelNumber,
                streamType: session.streamType,
                totalBytes: session.totalBytes,
                totalPackets: session.packets ? session.packets.length : 0,
              });
            }
          }
        }

        res.json({
          success: true,
          totalSessions: allSessions.length,
          sessions: allSessions,
        });
      } catch (error) {
        logger.error(`Error listing streaming sessions: ${error.message}`);
        res
          .status(500)
          .json({ error: "Internal server error", message: error.message });
      }
    });

    /**
     * Get Streaming Data (Real-time)
     * GET /api/streaming/data/:terminalId/:sessionId
     */
    this.app.get("/api/streaming/data/:terminalId/:sessionId", (req, res) => {
      const { terminalId, sessionId } = req.params;

      try {
        logger.info(
          `📡 Streaming data request for terminal ${terminalId}, session ${sessionId}`
        );

        const session = this.jt808Server.getStreamingStatus(
          terminalId,
          sessionId
        );
        if (!session) {
          return res.status(404).json({
            error: "Streaming session not found",
            terminalId,
            sessionId,
          });
        }

        if (session.status !== "active") {
          return res.status(400).json({
            error: "Streaming session not active",
            status: session.status,
            terminalId,
            sessionId,
          });
        }

        // Set headers for streaming response
        res.writeHead(200, {
          "Content-Type": "application/octet-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          "Transfer-Encoding": "chunked",
        });

        // Send streaming data headers
        const streamInfo = {
          sessionId: session.sessionId,
          terminalId: session.terminalId,
          channelNumber: session.channelNumber,
          streamType: session.streamType,
          quality: session.quality,
          frameRate: session.frameRate,
          audioEnabled: session.audioEnabled,
          videoEnabled: session.videoEnabled,
        };

        res.write(JSON.stringify(streamInfo) + "\n");

        // Note: This is a basic implementation. For real-time streaming,
        // you would implement WebSocket or Server-Sent Events for live data
        res.end();
      } catch (error) {
        logger.error(`Error getting streaming data: ${error.message}`);
        res
          .status(500)
          .json({ error: "Internal server error", message: error.message });
      }
    });

    /**
     * Start Audio/Video Streaming
     * POST /api/streaming/start
     */
    this.app.post("/api/streaming/start", (req, res) => {
      const {
        terminalId,
        channelNumber = 1,
        streamType = 0,
        quality = 0,
        frameRate = 25,
        bitrate = 0,
        audioEnabled = true,
        videoEnabled = true,
      } = req.body;

      if (!terminalId) {
        return res
          .status(400)
          .json({ error: "Missing required field: terminalId" });
      }

      try {
        logger.info(`🎥 Streaming start request for terminal ${terminalId}`);
        logger.info(
          `  Channel: ${channelNumber}, Stream: ${streamType}, Quality: ${quality}`
        );
        logger.info(
          `  Frame Rate: ${frameRate}, Audio: ${audioEnabled}, Video: ${videoEnabled}`
        );

        const sessionId = this.jt808Server.startStreaming(terminalId, {
          channelNumber,
          streamType,
          quality,
          frameRate,
          bitrate,
          audioEnabled,
          videoEnabled,
        });

        if (sessionId) {
          logger.info(`✅ Streaming started successfully: ${sessionId}`);
          res.json({
            success: true,
            sessionId,
            message: `Streaming started for terminal ${terminalId}`,
            details: {
              channelNumber,
              streamType,
              quality,
              frameRate,
              bitrate,
              audioEnabled,
              videoEnabled,
            },
          });
        } else {
          logger.error(
            `❌ Failed to start streaming for terminal ${terminalId}`
          );
          res.status(500).json({
            error: "Failed to start streaming",
            message: "Device may not be connected or streaming not supported",
          });
        }
      } catch (error) {
        logger.error(`Error starting streaming: ${error.message}`);
        res
          .status(500)
          .json({ error: "Internal server error", message: error.message });
      }
    });

    /**
     * Stop Audio/Video Streaming
     * POST /api/streaming/stop
     */
    this.app.post("/api/streaming/stop", (req, res) => {
      const { terminalId, sessionId } = req.body;

      if (!terminalId || !sessionId) {
        return res
          .status(400)
          .json({ error: "Missing required fields: terminalId, sessionId" });
      }

      try {
        logger.info(
          `🛑 Streaming stop request for terminal ${terminalId}, session ${sessionId}`
        );

        const success = this.jt808Server.stopStreaming(terminalId, sessionId);

        if (success) {
          logger.info(`✅ Streaming stopped successfully: ${sessionId}`);
          res.json({
            success: true,
            message: `Streaming stopped for session ${sessionId}`,
            sessionId,
          });
        } else {
          logger.error(`❌ Failed to stop streaming session ${sessionId}`);
          res.status(500).json({
            error: "Failed to stop streaming",
            message: "Session not found or already stopped",
          });
        }
      } catch (error) {
        logger.error(`Error stopping streaming: ${error.message}`);
        res
          .status(500)
          .json({ error: "Internal server error", message: error.message });
      }
    });

    /**
     * Get Streaming Status
     * GET /api/streaming/status/:terminalId
     */
    this.app.get("/api/streaming/status/:terminalId", (req, res) => {
      const { terminalId } = req.params;
      const { sessionId } = req.query;

      try {
        logger.info(
          `📊 Streaming status request for terminal ${terminalId}${
            sessionId ? `, session ${sessionId}` : ""
          }`
        );

        const status = this.jt808Server.getStreamingStatus(
          terminalId,
          sessionId
        );

        if (status) {
          res.json({
            success: true,
            status,
            terminalId,
          });
        } else {
          res.status(404).json({
            error: "No streaming sessions found",
            terminalId,
          });
        }
      } catch (error) {
        logger.error(`Error getting streaming status: ${error.message}`);
        res
          .status(500)
          .json({ error: "Internal server error", message: error.message });
      }
    });

    /**
     * Get Streaming Statistics
     * GET /api/streaming/stats/:terminalId/:sessionId
     */
    this.app.get("/api/streaming/stats/:terminalId/:sessionId", (req, res) => {
      const { terminalId, sessionId } = req.params;

      try {
        logger.info(
          `📈 Streaming statistics request for terminal ${terminalId}, session ${sessionId}`
        );

        const stats = this.jt808Server.getStreamingStatistics(
          terminalId,
          sessionId
        );

        if (stats) {
          res.json({
            success: true,
            stats,
            terminalId,
            sessionId,
          });
        } else {
          res.status(404).json({
            error: "Streaming session not found",
            terminalId,
            sessionId,
          });
        }
      } catch (error) {
        logger.error(`Error getting streaming statistics: ${error.message}`);
        res
          .status(500)
          .json({ error: "Internal server error", message: error.message });
      }
    });

    /**
     * List All Active Streaming Sessions
     * GET /api/streaming/sessions
     */
    this.app.get("/api/streaming/sessions", (req, res) => {
      try {
        logger.info(`📋 Listing all streaming sessions`);

        const allSessions = [];
        const connections = this.jt808Server.connections;

        for (const [connectionId, connection] of connections) {
          if (
            connection.streamingSessions &&
            connection.streamingSessions.size > 0
          ) {
            for (const [sessionId, session] of connection.streamingSessions) {
              allSessions.push({
                connectionId,
                terminalId: connection.terminalId,
                sessionId,
                status: session.status,
                startTime: session.startTime,
                channelNumber: session.channelNumber,
                streamType: session.streamType,
                totalBytes: session.totalBytes,
                totalPackets: session.packets ? session.packets.length : 0,
              });
            }
          }
        }

        res.json({
          success: true,
          totalSessions: allSessions.length,
          sessions: allSessions,
        });
      } catch (error) {
        logger.error(`Error listing streaming sessions: ${error.message}`);
        res
          .status(500)
          .json({ error: "Internal server error", message: error.message });
      }
    });

    /**
     * Get Streaming Data (Real-time)
     * GET /api/streaming/data/:terminalId/:sessionId
     */
    this.app.get("/api/streaming/data/:terminalId/:sessionId", (req, res) => {
      const { terminalId, sessionId } = req.params;

      try {
        logger.info(
          `📡 Streaming data request for terminal ${terminalId}, session ${sessionId}`
        );

        const session = this.jt808Server.getStreamingStatus(
          terminalId,
          sessionId
        );
        if (!session) {
          return res.status(404).json({
            error: "Streaming session not found",
            terminalId,
            sessionId,
          });
        }

        if (session.status !== "active") {
          return res.status(400).json({
            error: "Streaming session not active",
            status: session.status,
            terminalId,
            sessionId,
          });
        }

        // Set headers for streaming response
        res.writeHead(200, {
          "Content-Type": "application/octet-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          "Transfer-Encoding": "chunked",
        });

        // Send streaming data headers
        const streamInfo = {
          sessionId: session.sessionId,
          terminalId: session.terminalId,
          channelNumber: session.channelNumber,
          streamType: session.streamType,
          quality: session.quality,
          frameRate: session.frameRate,
          audioEnabled: session.audioEnabled,
          videoEnabled: session.videoEnabled,
        };

        res.write(JSON.stringify(streamInfo) + "\n");

        // Note: This is a basic implementation. For real-time streaming,
        // you would implement WebSocket or Server-Sent Events for live data
        res.end();
      } catch (error) {
        logger.error(`Error getting streaming data: ${error.message}`);
        res
          .status(500)
          .json({ error: "Internal server error", message: error.message });
      }
    });

    /**
     * ULV Real-time Audio/Video Preview Request
     * POST /api/ulv/streaming/start
     */
    this.app.post("/api/ulv/streaming/start", (req, res) => {
      const {
        terminalId,
        serverIP = "192.168.100.100",
        tcpPort = 1935,
        udpPort = 8000,
        channelNumber = 1,
        dataType = 0,
        streamType = 0,
      } = req.body;

      if (!terminalId) {
        return res.status(400).json({ error: "Terminal ID is required" });
      }

      try {
        logger.info(`🎥 ULV Streaming request for terminal ${terminalId}`);

        const sessionId = this.jt808Server.sendULVStreamingRequest(terminalId, {
          serverIP,
          tcpPort,
          udpPort,
          channelNumber,
          dataType,
          streamType,
        });

        if (sessionId) {
          res.json({
            success: true,
            sessionId,
            message: "ULV streaming request sent",
            details: {
              serverIP,
              tcpPort,
              udpPort,
              channelNumber,
              dataType,
              streamType,
            },
          });
        } else {
          res
            .status(500)
            .json({ error: "Failed to send ULV streaming request" });
        }
      } catch (error) {
        logger.error(`Error starting ULV streaming: ${error.message}`);
        res
          .status(500)
          .json({ error: "Internal server error", message: error.message });
      }
    });

    /**
     * ULV Real-time Audio/Video Preview Transmission Control
     * POST /api/ulv/streaming/control
     */
    this.app.post("/api/ulv/streaming/control", (req, res) => {
      const { terminalId, sessionId, controlCommand, options = {} } = req.body;

      if (!terminalId || !sessionId || controlCommand === undefined) {
        return res
          .status(400)
          .json({
            error: "Terminal ID, Session ID, and Control Command are required",
          });
      }

      try {
        logger.info(
          `🎮 ULV Streaming control for terminal ${terminalId}, session ${sessionId}`
        );

        const success = this.jt808Server.sendULVStreamingControl(
          terminalId,
          sessionId,
          controlCommand,
          options
        );

        if (success) {
          res.json({
            success: true,
            message: "ULV streaming control sent",
            controlCommand,
            options,
          });
        } else {
          res
            .status(500)
            .json({ error: "Failed to send ULV streaming control" });
        }
      } catch (error) {
        logger.error(`Error controlling ULV streaming: ${error.message}`);
        res
          .status(500)
          .json({ error: "Internal server error", message: error.message });
      }
    });

    /**
     * Get ULV Streaming Status
     * GET /api/ulv/streaming/status/:terminalId/:sessionId
     */
    this.app.get(
      "/api/ulv/streaming/status/:terminalId/:sessionId",
      (req, res) => {
        const { terminalId, sessionId } = req.params;

        try {
          logger.info(
            `📊 ULV Streaming status request for terminal ${terminalId}, session ${sessionId}`
          );

          const connection =
            this.jt808Server.findConnectionByTerminalId(terminalId);
          if (!connection || !connection.streamingSessions) {
            return res.status(404).json({
              error: "Terminal not connected or no streaming sessions",
              terminalId,
            });
          }

          const session = connection.streamingSessions.get(sessionId);
          if (!session) {
            return res.status(404).json({
              error: "Streaming session not found",
              terminalId,
              sessionId,
            });
          }

          res.json({
            success: true,
            session: {
              sessionId: session.sessionId,
              terminalId: session.terminalId,
              channelNumber: session.channelNumber,
              dataType: session.dataType,
              streamType: session.streamType,
              serverIP: session.serverIP,
              tcpPort: session.tcpPort,
              udpPort: session.udpPort,
              status: session.status,
              startTime: session.startTime,
              endTime: session.endTime,
              totalBytes: session.totalBytes,
              totalPackets: session.packets ? session.packets.length : 0,
            },
          });
        } catch (error) {
          logger.error(`Error getting ULV streaming status: ${error.message}`);
          res
            .status(500)
            .json({ error: "Internal server error", message: error.message });
        }
      }
    );

    /**
     * Set Terminal Parameters
     * POST /api/terminal/set-params
     */
    this.app.post("/api/terminal/set-params", (req, res) => {
      try {
        const { terminalId, parameters } = req.body;

        if (!terminalId || !parameters) {
          return res.status(400).json({
            error: "Terminal ID and parameters are required",
          });
        }

        logger.info(`🔧 Setting terminal parameters for ${terminalId}`);
        logger.info(`📋 Parameters: ${JSON.stringify(parameters)}`);

        const success = this.jt808Server.setTerminalParameters(
          terminalId,
          parameters
        );

        if (success) {
          res.json({
            success: true,
            message: "Terminal parameters set successfully",
            terminalId,
            parameters,
          });
        } else {
          res.status(500).json({
            error: "Failed to set terminal parameters",
            terminalId,
          });
        }
      } catch (error) {
        logger.error(`Error setting terminal parameters: ${error.message}`);
        res
          .status(500)
          .json({ error: "Internal server error", message: error.message });
      }
    });

    /**
     * Query Terminal Parameters
     * POST /api/terminal/query-params
     */
    this.app.post("/api/terminal/query-params", (req, res) => {
      try {
        const { terminalId, parameterIds } = req.body;

        if (!terminalId) {
          return res.status(400).json({
            error: "Terminal ID is required",
          });
        }

        logger.info(`🔍 Querying terminal parameters for ${terminalId}`);

        const success = this.jt808Server.queryTerminalParameters(
          terminalId,
          parameterIds
        );

        if (success) {
          res.json({
            success: true,
            message: "Terminal parameter query sent successfully",
            terminalId,
          });
        } else {
          res.status(500).json({
            error: "Failed to query terminal parameters",
            terminalId,
          });
        }
      } catch (error) {
        logger.error(`Error querying terminal parameters: ${error.message}`);
        res
          .status(500)
          .json({ error: "Internal server error", message: error.message });
      }
    });

    /**
     * Restart Terminal
     * POST /api/terminal/restart
     */
    this.app.post("/api/terminal/restart", (req, res) => {
      try {
        const { terminalId } = req.body;

        if (!terminalId) {
          return res.status(400).json({
            error: "Terminal ID is required",
          });
        }

        logger.info(`🔄 Restarting terminal ${terminalId}`);

        const success = this.jt808Server.restartTerminal(terminalId);

        if (success) {
          res.json({
            success: true,
            message: "Terminal restart command sent successfully",
            terminalId,
          });
        } else {
          res.status(500).json({
            error: "Failed to send restart command",
            terminalId,
          });
        }
      } catch (error) {
        logger.error(`Error restarting terminal: ${error.message}`);
        res
          .status(500)
          .json({ error: "Internal server error", message: error.message });
      }
    });

    /**
     * Get Terminal Version
     * POST /api/terminal/version
     */
    this.app.post("/api/terminal/version", (req, res) => {
      try {
        const { terminalId } = req.body;

        if (!terminalId) {
          return res.status(400).json({
            error: "Terminal ID is required",
          });
        }

        logger.info(`📋 Querying terminal version for ${terminalId}`);

        const success = this.jt808Server.queryTerminalVersion(terminalId);

        if (success) {
          res.json({
            success: true,
            message: "Terminal version query sent successfully",
            terminalId,
          });
        } else {
          res.status(500).json({
            error: "Failed to query terminal version",
            terminalId,
          });
        }
      } catch (error) {
        logger.error(`Error querying terminal version: ${error.message}`);
        res
          .status(500)
          .json({ error: "Internal server error", message: error.message });
      }
    });

    // Get multimedia debugging information
    this.app.get("/api/multimedia/debug", (req, res) => {
      try {
        const debugInfo = this.jt808Server.getMultimediaDebugInfo();
        res.json(debugInfo);
      } catch (error) {
        logger.error(`Error getting multimedia debug info: ${error.message}`);
        res.status(500).json({ error: "Failed to get debug info" });
      }
    });

    // Enhanced multimedia debugging endpoint for vendors
    this.app.get("/api/multimedia/debug/vendor", (req, res) => {
      try {
        const debugInfo = this.jt808Server.getMultimediaDebugInfo();

        // Format for vendor debugging
        const vendorDebugInfo = {
          timestamp: debugInfo.timestamp,
          summary: {
            totalConnections: debugInfo.totalConnections,
            multimediaConnections: debugInfo.multimediaConnections,
            totalMultimediaEvents: debugInfo.totalMultimediaEvents,
            activeStreams: debugInfo.activeStreams,
          },
          connections: debugInfo.connections.map((conn) => ({
            terminalId: conn.terminalId,
            remoteAddress: conn.remoteAddress,
            multimediaEvents: conn.multimediaEvents,
            status: conn.isAuthenticated
              ? "Authenticated"
              : "Not Authenticated",
            lastActivity: conn.lastActivity,
          })),
          recommendations: this.generateVendorRecommendations(debugInfo),
        };

        res.json(vendorDebugInfo);
      } catch (error) {
        logger.error(`Error getting vendor debug info: ${error.message}`);
        res.status(500).json({ error: "Failed to get vendor debug info" });
      }
    });

    // 404 handler - must be last
    this.app.use((req, res) => {
      res.status(404).json({ error: "Endpoint not found" });
    });
  }

  start() {
    this.server = this.app.listen(this.port, () => {
      logger.info(`HTTP API Server started on port ${this.port}`);
    });
  }

  /**
   * Generate vendor debugging recommendations
   */
  generateVendorRecommendations(debugInfo) {
    const recommendations = [];

    if (debugInfo.totalConnections === 0) {
      recommendations.push(
        "No devices connected. Check network connectivity and device configuration."
      );
    }

    if (debugInfo.multimediaConnections === 0) {
      recommendations.push(
        "No multimedia events detected. Verify device multimedia settings and ULV protocol support."
      );
    }

    if (debugInfo.activeStreams === 0 && debugInfo.totalMultimediaEvents > 0) {
      recommendations.push(
        "Multimedia events received but no active streams. Check streaming configuration and device response."
      );
    }

    if (debugInfo.totalMultimediaEvents > 0) {
      recommendations.push(
        "Multimedia events detected. Monitor console logs for RTP stream analysis."
      );
      recommendations.push(
        "Use /api/multimedia/debug endpoint for detailed stream information."
      );
    }

    if (debugInfo.activeStreams > 0) {
      recommendations.push(
        "Active streams detected. Check RTP data format and streaming parameters."
      );
      recommendations.push(
        "Monitor console for RTP analysis and potential issues."
      );
    }

    return recommendations;
  }

  stop() {
    if (this.server) {
      this.server.close(() => {
        logger.info("HTTP API Server stopped");
      });
    }
  }
}

module.exports = HTTPAPIServer;
