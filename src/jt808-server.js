const JT808Parser = require("./protocol/jt808-parser");
const JT808Message = require("./protocol/jt808-message");
const logger = require("./utils/logger");
const config = require("./config/config");
const fs = require("fs");
const path = require("path");
const CommandManager = require("./commands/CommandManager");

class JT808Server {
  constructor() {
    this.parser = new JT808Parser();
    this.connections = new Map(); // Map to store active connections
    this.messageHandlers = new Map(); // Map to store message type handlers

    // Initialize Command Manager for modular command execution
    this.commandManager = new CommandManager(this);

    this.initializeMessageHandlers();

    // Fix existing .bin files on startup
    setTimeout(() => {
      this.fixExistingBinFiles();
    }, 5000); // Wait 5 seconds after startup
  }

  initializeMessageHandlers() {
    // Register handlers for different message types
    this.messageHandlers.set(0x0001, this.handleTerminalRegister.bind(this));
    this.messageHandlers.set(0x0002, this.handleTerminalHeartbeat.bind(this));
    this.messageHandlers.set(0x0003, this.handleTerminalLogout.bind(this));
    this.messageHandlers.set(
      0x0100,
      this.handleTerminalAuthentication.bind(this)
    );
    this.messageHandlers.set(
      0x0102,
      this.handleTerminalAuthenticationResponse.bind(this)
    );
    this.messageHandlers.set(0x0200, this.handleLocationReport.bind(this));
    this.messageHandlers.set(0x0201, this.handleLocationQuery.bind(this));
    this.messageHandlers.set(0x0704, this.handleBulkLocationReport.bind(this));
    this.messageHandlers.set(
      0x0800,
      this.handleMultimediaEventUpload.bind(this)
    );
    this.messageHandlers.set(
      0x800,
      this.handleMultimediaEventUpload.bind(this)
    ); // Alternative format
    this.messageHandlers.set(
      0x0801,
      this.handleMultimediaDataUpload.bind(this)
    );
    this.messageHandlers.set(0x801, this.handleMultimediaDataUpload.bind(this)); // Alternative format
    this.messageHandlers.set(
      0x8800,
      this.handleMultimediaPlatformResponse.bind(this)
    );
    this.messageHandlers.set(0x900, this.handleDeviceDataReport.bind(this));
    this.messageHandlers.set(
      0x0900,
      this.handleDataTransparentTransmission.bind(this)
    ); // Data Transparent Transmission
    this.messageHandlers.set(
      0x8100,
      this.handleTerminalRegisterResponse.bind(this)
    );
    this.messageHandlers.set(
      0x8201,
      this.handlePlatformLocationQuery.bind(this)
    );

    // File Upload Protocol Handlers
    this.messageHandlers.set(0x9205, this.handleResourceQuery.bind(this));
    this.messageHandlers.set(
      0x1205,
      this.handleResourceQueryResponse.bind(this)
    );
    this.messageHandlers.set(
      0x9206,
      this.handleFileUploadInstructions.bind(this)
    );
    this.messageHandlers.set(
      0x1206,
      this.handleFileUploadCompletion.bind(this)
    );
    this.messageHandlers.set(0x9207, this.handleFileUploadControl.bind(this));

    // Terminal Control Handlers
    this.messageHandlers.set(0x8105, this.handleTerminalControl.bind(this));

    // Add ULV parameter response handler
    this.messageHandlers.set(
      0xb051,
      this.handleULVParameterResponse.bind(this)
    );

    // Add ULV file discovery response handlers
    this.messageHandlers.set(
      0xb061,
      this.handleULVFileDiscoveryResponse.bind(this)
    );
    this.messageHandlers.set(
      0xb063,
      this.handleULVFileMetadataResponse.bind(this)
    );
    this.messageHandlers.set(
      0xb065,
      this.handleULVFileAccessResponse.bind(this)
    );
    this.messageHandlers.set(0x9103, this.handleULVStreamingData.bind(this));

    // Add handler for device response to 0x9101 streaming request
    this.messageHandlers.set(0x8001, this.handleGeneralResponse.bind(this));

    // Add handler for device's alternative general response format (0x0001)
    this.messageHandlers.set(
      0x0001,
      this.handleAlternativeGeneralResponse.bind(this)
    );

    // Add JT1078 protocol handlers for alternative streaming
    this.messageHandlers.set(
      0x9101,
      this.handleJT1078LiveVideoRequest.bind(this)
    );
    this.messageHandlers.set(
      0x1101,
      this.handleJT1078LiveVideoResponse.bind(this)
    );

    // Add parameter setting response handler
    this.messageHandlers.set(
      0x0104,
      this.handleParameterSettingResponse.bind(this)
    );

    // Add terminal attributes response handler
    this.messageHandlers.set(
      0x0107,
      this.handleTerminalAttributesResponse.bind(this)
    );
  }

  handleConnection(socket) {
    const connectionId = `${socket.remoteAddress}:${socket.remotePort}`;
    logger.info(`New connection established from ${connectionId}`);

    this.connections.set(connectionId, {
      socket,
      terminalId: null,
      lastHeartbeat: Date.now(),
      isAuthenticated: false,
      isRegistered: false,
      messageCount: 0,
      lastMessageTime: Date.now(),
    });

    // Set socket options for better stability
    socket.setKeepAlive(true, 60000); // 60 seconds
    socket.setTimeout(300000); // 5 minutes timeout

    socket.on("data", (data) => {
      try {
        const connection = this.connections.get(connectionId);
        if (connection) {
          connection.lastMessageTime = Date.now();
          connection.messageCount++;
        }

        this.handleData(data, connectionId);
      } catch (error) {
        logger.error(
          `Error handling data from ${connectionId}: ${error.message}`
        );
      }
    });

    socket.on("timeout", () => {
      logger.warn(`Connection timeout for ${connectionId}`);
      socket.destroy();
    });

    socket.on("error", (err) => {
      logger.error(`Socket error for ${connectionId}: ${err.message}`);
    });

    socket.on("close", () => {
      logger.info(`Connection closed from ${connectionId}`);

      // Clean up any active streaming sessions and SRS forwarding
      const connection = this.connections.get(connectionId);
      if (connection) {
        if (connection.streamingSessions) {
          for (const [
            sessionId,
            session,
          ] of connection.streamingSessions.entries()) {
            logger.debug(
              `🧹 Cleaned up streaming session ${sessionId} for closed connection`
            );
          }
        }

        // Clean up alternative servers
        this.cleanupAlternativeServers(connection);
      }

      this.connections.delete(connectionId);
    });
  }

  handleData(data, connectionId) {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    // Log raw data for debugging
    logger.debug(
      `Raw data from ${connectionId}: ${data.toString("hex")} (${
        data.length
      } bytes)`
    );

    try {
      // Parse the JT808 message
      const message = this.parser.parse(data);
      if (!message) {
        logger.warn(
          `Invalid message format from ${connectionId} - data: ${data.toString(
            "hex"
          )}`
        );
        return;
      }

      logger.info(
        `Received message from ${connectionId}: ${message.messageId.toString(
          16
        )}`
      );

      // Handle the message based on its type
      this.handleMessage(message, connection, connectionId);
    } catch (error) {
      logger.error(
        `Error parsing message from ${connectionId}: ${
          error.message
        } - data: ${data.toString("hex")}`
      );
    }
  }

  handleMessage(message, connection, connectionId) {
    const handler = this.messageHandlers.get(message.messageId);
    if (handler) {
      handler(message, connection, connectionId);
    } else {
      logger.warn(
        `No handler for message type: 0x${message.messageId.toString(16)}`
      );
      // Send general response for unhandled message types
      this.sendGeneralResponse(connection.socket, message, 0x0001);
    }
  }

  handleTerminalRegister(message, connection, connectionId) {
    logger.info(`Terminal registration request from ${connectionId}`);

    try {
      // Parse JT808 registration message body according to protocol
      // Body structure: Province ID (2) + County ID (2) + Manufacturer ID (11) + Terminal model (30) + Terminal ID (30) + License plate color (1) + License plate (variable)
      if (message.body.length < 76) {
        // Minimum length for fixed fields
        logger.warn(
          `Registration message too short: ${message.body.length} bytes`
        );
        const response = this.createRegisterResponse(message, 0x0002); // Message error
        connection.socket.write(response);
        return;
      }

      let offset = 0;
      const provinceId = message.body.readUInt16BE(offset);
      offset += 2;
      const countyId = message.body.readUInt16BE(offset);
      offset += 2;
      const manufacturerId = message.body.slice(offset, offset + 11);
      offset += 11;
      const terminalModel = message.body.slice(offset, offset + 30);
      offset += 30;
      const terminalIdBytes = message.body.slice(offset, offset + 30);
      offset += 30;
      const licensePlateColor = message.body.readUInt8(offset);
      offset += 1;

      // Extract terminal ID from the terminal ID field (remove padding)
      const terminalId = terminalIdBytes.toString("ascii").replace(/\0/g, "");

      logger.info(
        `Registration details: Province=${provinceId}, County=${countyId}, Terminal=${terminalId}, Model=${terminalModel
          .toString("ascii")
          .replace(/\0/g, "")}`
      );

      connection.terminalId = terminalId;

      // Check if terminal is in allowed list
      if (!this.isTerminalAllowed(terminalId)) {
        logger.warn(
          `Terminal ${terminalId} not in allowed list, rejecting registration`
        );
        const response = this.createRegisterResponse(message, 0x0001); // Registration failed
        connection.socket.write(response);
        connection.socket.destroy();
        return;
      }

      // Send registration response according to JT808 protocol (0x8100)
      const response = this.createRegisterResponse(message, 0x0000);
      connection.socket.write(response);

      // Mark connection as registered (authentication will be handled separately)
      connection.isRegistered = true;

      logger.info(
        `Terminal ${terminalId} registered successfully, waiting for authentication`
      );
    } catch (error) {
      logger.error(`Error parsing registration message: ${error.message}`);
      const response = this.createRegisterResponse(message, 0x0002); // Message error
      connection.socket.write(response);
    }
  }

  handleTerminalRegisterResponse(message, connection, connectionId) {
    logger.info(`Terminal registration response from ${connectionId}`);
  }

  handleTerminalLogout(message, connection, connectionId) {
    logger.info(`Terminal logout from ${connectionId}`);
    connection.isAuthenticated = false;

    // Send logout response
    const response = this.createGeneralResponse(message, 0x00);
    connection.socket.write(response);
  }

  handleTerminalAuthentication(message, connection, connectionId) {
    // If already authenticated, reject repeated 0x0100 messages and instruct to send proper heartbeats
    if (connection.isAuthenticated) {
      logger.warn(
        `Terminal ${connection.terminalId} sending 0x0100 after authentication - should send 0x0002 heartbeats`
      );

      // Send instruction to use proper heartbeat messages (0x0002)
      const heartbeatInstruction = this.createHeartbeatInstruction(message);
      connection.socket.write(heartbeatInstruction);

      logger.info(
        `Sent heartbeat instruction to terminal ${connection.terminalId}`
      );
      return;
    }

    // Debug: log connection state
    logger.debug(
      `Connection state: isAuthenticated=${connection.isAuthenticated}, isRegistered=${connection.isRegistered}, terminalId=${connection.terminalId}`
    );

    logger.info(`Terminal authentication request from ${connectionId}`);

    // If no terminal ID, this might be a combined registration + authentication message
    if (!connection.terminalId) {
      logger.info(
        `No terminal ID found, treating as combined registration + authentication`
      );

      try {
        // Parse registration data from the message body
        if (message.body.length < 76) {
          logger.warn(
            `Message too short for registration data: ${message.body.length} bytes`
          );
          return;
        }

        let offset = 0;
        const provinceId = message.body.readUInt16BE(offset);
        offset += 2;
        const countyId = message.body.readUInt16BE(offset);
        offset += 2;
        const manufacturerId = message.body.slice(offset, offset + 11);
        offset += 11;
        const terminalModel = message.body.slice(offset, offset + 30);
        offset += 30;
        const terminalIdBytes = message.body.slice(offset, offset + 30);
        offset += 30;
        const licensePlateColor = message.body.readUInt8(offset);
        offset += 1;

        const terminalId = terminalIdBytes.toString("ascii").replace(/\0/g, "");

        logger.info(
          `Registration details: Province=${provinceId}, County=${countyId}, Terminal=${terminalId}, Model=${terminalModel
            .toString("ascii")
            .replace(/\0/g, "")}`
        );

        connection.terminalId = terminalId;

        // Check if terminal is allowed
        if (!this.isTerminalAllowed(terminalId)) {
          logger.warn(`Terminal ${terminalId} not in allowed list, rejecting`);
          connection.socket.destroy();
          return;
        }

        // Mark as registered
        connection.isRegistered = true;

        // Send registration response
        const response = this.createRegisterResponse(message, 0x0000);
        connection.socket.write(response);

        logger.info(`Terminal ${terminalId} registered successfully`);
      } catch (error) {
        logger.error(`Error parsing registration data: ${error.message}`);
        return;
      }
    }

    // Now send authentication challenge
    try {
      const authChallenge = this.createAuthenticationChallenge(message);
      connection.socket.write(authChallenge);

      logger.info(
        `Authentication challenge sent to terminal ${connection.terminalId}`
      );
    } catch (error) {
      logger.error(`Error sending authentication challenge: ${error.message}`);
      connection.socket.destroy();
    }
  }

  handleTerminalAuthenticationResponse(message, connection, connectionId) {
    logger.info(`Terminal authentication response from ${connectionId}`);

    try {
      // Parse authentication response according to JT808 protocol
      // Message body contains: Authentication code length + Authentication code content + Terminal IMEI + Firmware version
      if (message.body.length < 2) {
        logger.warn(
          `Authentication response too short: ${message.body.length} bytes`
        );
        return;
      }

      const authCodeLength = message.body.readUInt8(0);
      const authCode = message.body
        .slice(1, 1 + authCodeLength)
        .toString("ascii");
      const terminalIMEI = message.body
        .slice(1 + authCodeLength, 1 + authCodeLength + 15)
        .toString("ascii");
      const firmwareVersion = message.body
        .slice(1 + authCodeLength + 15, 1 + authCodeLength + 35)
        .toString("ascii");

      logger.info(
        `Authentication response: Code=${authCode}, IMEI=${terminalIMEI}, Firmware=${firmwareVersion}`
      );

      // Mark connection as authenticated
      connection.isAuthenticated = true;
      connection.lastHeartbeat = Date.now();

      // Send authentication success response
      const response = this.createGeneralResponse(message, 0x00);
      connection.socket.write(response);

      // Send heartbeat instruction according to JT808 protocol (2.3.2)
      // Device should send 0x0002 heartbeat messages every 30 seconds
      logger.info(
        `Terminal ${connection.terminalId} authenticated successfully, instructing to send 0x0002 heartbeats`
      );

      // Update connection to expect proper heartbeat messages
      connection.expectHeartbeats = true;
    } catch (error) {
      logger.error(`Error parsing authentication response: ${error.message}`);
    }
  }

  handleTerminalHeartbeat(message, connection, connectionId) {
    connection.lastHeartbeat = Date.now();
    logger.debug(`Heartbeat from ${connectionId}`);

    // Send heartbeat response
    const response = this.createGeneralResponse(message, 0x00);
    connection.socket.write(response);
  }

  handleLocationReport(message, connection, connectionId) {
    if (!connection.isAuthenticated) {
      logger.warn(`Unauthorized location report from ${connectionId}`);
      return;
    }

    logger.info(`Location report from terminal ${connection.terminalId}`);

    try {
      // Parse location data according to JT808 protocol (Table 3.5.1, 3.5.2)
      const locationData = this.parseLocationData(message.body);

      // Log comprehensive location information
      logger.info(`Location Report Details:`);
      logger.info(
        `  Coordinates: ${locationData.latitude}, ${locationData.longitude}`
      );
      logger.info(
        `  Altitude: ${locationData.altitude}m, Speed: ${locationData.speed}km/h, Direction: ${locationData.direction}°`
      );
      logger.info(`  Time: ${locationData.time}`);
      logger.info(
        `  Alarm Flags: ${
          Object.keys(locationData.alarmFlags).length > 0
            ? JSON.stringify(locationData.alarmFlags)
            : "None"
        }`
      );
      logger.info(
        `  Status: ACC=${locationData.statusBits.acc}, Located=${locationData.statusBits.located}, Vehicle=${locationData.statusBits.vehicleState}`
      );

      if (Object.keys(locationData.additionalInfo).length > 0) {
        logger.info(
          `  Additional Info: ${JSON.stringify(locationData.additionalInfo)}`
        );
      }

      // Check if this is a response to a pending location query
      if (connection.pendingLocationQuery) {
        logger.info(
          `Location report is response to pending query from ${connection.pendingLocationQuery.requesterConnection.socket.remoteAddress}`
        );

        try {
          // Forward the location report to the original requester
          const locationResponse = this.createLocationQueryResponse(message);
          connection.pendingLocationQuery.requesterConnection.socket.write(
            locationResponse
          );

          logger.info(`Location response forwarded to query requester`);

          // Clean up the pending query
          delete connection.pendingLocationQuery;
        } catch (error) {
          logger.error(`Error forwarding location response: ${error.message}`);
        }
      }

      // Send acknowledgment according to JT808 protocol
      const response = this.createGeneralResponse(message, 0x00);
      connection.socket.write(response);

      logger.debug(
        `Location report acknowledged for terminal ${connection.terminalId}`
      );
    } catch (error) {
      logger.error(`Error parsing location report: ${error.message}`);
      // Send error response
      const response = this.createGeneralResponse(message, 0x02); // Message error
      connection.socket.write(response);
    }
  }

  handleLocationQuery(message, connection, connectionId) {
    logger.info(`Location query from ${connectionId}`);

    // Send location query response
    const response = this.createLocationQueryResponse(message);
    connection.socket.write(response);
  }

  handlePlatformLocationQuery(message, connection, connectionId) {
    logger.info(`Platform location query received from ${connectionId}`);

    // This is a platform-originated message (0x8201) - we need to forward it to the connected device
    // Find the device connection based on the terminal phone number in the message
    const terminalPhoneNumber = this.extractTerminalPhoneNumber(message);

    if (!terminalPhoneNumber) {
      logger.warn("Location query missing terminal phone number");
      const response = this.createGeneralResponse(message, 0x02); // Message error
      connection.socket.write(response);
      return;
    }

    // Find the device connection
    const deviceConnection = this.findDeviceConnection(terminalPhoneNumber);

    if (!deviceConnection) {
      logger.warn(
        `No device connection found for terminal ${terminalPhoneNumber}`
      );
      const response = this.createGeneralResponse(message, 0x03); // Terminal not found
      connection.socket.write(response);
      return;
    }

    if (!deviceConnection.isAuthenticated) {
      logger.warn(`Device ${terminalPhoneNumber} not authenticated`);
      const response = this.createGeneralResponse(message, 0x01); // Terminal not authenticated
      connection.socket.write(response);
      return;
    }

    // Forward the location query to the device
    logger.info(`Forwarding location query to device ${terminalPhoneNumber}`);

    try {
      // Create a location query message to send to the device
      const deviceQuery = this.createDeviceLocationQuery(terminalPhoneNumber);
      deviceConnection.socket.write(deviceQuery);

      // Store the query context for when we receive the response
      deviceConnection.pendingLocationQuery = {
        originalMessage: message,
        requesterConnection: connection,
        timestamp: Date.now(),
      };

      // Set a timeout for the response
      setTimeout(() => {
        if (deviceConnection.pendingLocationQuery) {
          logger.warn(
            `Location query timeout for device ${terminalPhoneNumber}`
          );
          delete deviceConnection.pendingLocationQuery;

          const response = this.createGeneralResponse(message, 0x04); // Query timeout
          connection.socket.write(response);
        }
      }, 10000); // 10 second timeout

      // Send immediate acknowledgment
      const response = this.createGeneralResponse(message, 0x00); // Query accepted
      connection.socket.write(response);
    } catch (error) {
      logger.error(`Error forwarding location query: ${error.message}`);
      const response = this.createGeneralResponse(message, 0x02); // Message error
      connection.socket.write(response);
    }
  }

  handleBulkLocationReport(message, connection, connectionId) {
    if (!connection.isAuthenticated) {
      logger.warn(`Unauthorized bulk location report from ${connectionId}`);
      return;
    }

    logger.info(`Bulk location report from terminal ${connection.terminalId}`);

    try {
      // Parse bulk location report according to Table 3.6.1
      if (message.body.length < 3) {
        throw new Error(
          `Bulk location message too short: ${message.body.length} bytes`
        );
      }

      let offset = 0;
      const numberOfItems = message.body.readUInt16BE(offset);
      offset += 2;
      const dataType = message.body.readUInt8(offset);
      offset += 1;

      logger.info(
        `Bulk Location Report: ${numberOfItems} items, Type: ${
          dataType === 0 ? "Normal Position" : "Supplementary Blind Area"
        }`
      );

      // Parse each location data item according to Table 3.6.2
      const locationItems = [];
      for (let i = 0; i < numberOfItems && offset < message.body.length; i++) {
        if (offset + 2 > message.body.length) {
          logger.warn(`Insufficient data for item ${i + 1}`);
          break;
        }

        const itemLength = message.body.readUInt16BE(offset);
        offset += 2;
        if (offset + itemLength > message.body.length) {
          logger.warn(
            `Item ${i + 1} length ${itemLength} exceeds remaining data`
          );
          break;
        }

        const itemData = message.body.slice(offset, offset + itemLength);
        offset += itemLength;

        try {
          const locationData = this.parseLocationData(itemData);
          locationItems.push(locationData);
          logger.debug(
            `Item ${i + 1}: ${locationData.latitude}, ${locationData.longitude}`
          );
        } catch (error) {
          logger.warn(`Error parsing item ${i + 1}: ${error.message}`);
        }
      }

      logger.info(`Successfully parsed ${locationItems.length} location items`);

      // Send acknowledgment
      const response = this.createGeneralResponse(message, 0x00);
      connection.socket.write(response);

      logger.debug(
        `Bulk location report acknowledged for terminal ${connection.terminalId}`
      );
    } catch (error) {
      logger.error(`Error parsing bulk location report: ${error.message}`);
      // Send error response
      const response = this.createGeneralResponse(message, 0x02); // Message error
      connection.socket.write(response);
    }
  }

  handleDeviceDataReport(message, connection, connectionId) {
    if (!connection.isAuthenticated) {
      logger.warn(`Unauthorized device data report from ${connectionId}`);
      return;
    }

    logger.info(`Device Data Report from terminal ${connection.terminalId}`);

    try {
      // Parse device data report message according to Table 3.9.1
      const deviceData = this.parseDeviceDataReport(message.body);

      logger.info(`Device Data Report Details:`);
      logger.info(
        `  Latitude: ${deviceData.latitude}, Longitude: ${deviceData.longitude}`
      );
      logger.info(`  Speed: ${deviceData.speed} km/h`);
      logger.info(`  Time: ${deviceData.time}`);

      // Log additional information items in a meaningful way
      if (
        deviceData.additionalInfoItems &&
        deviceData.additionalInfoItems.length > 0
      ) {
        logger.info(`  Additional Information Items:`);
        deviceData.additionalInfoItems.forEach((item, index) => {
          if (item.parsed && item.parsed.type !== "Unknown") {
            logger.info(
              `    ${index + 1}. ${item.parsed.type}: ${JSON.stringify(
                item.parsed
              )}`
            );
          } else {
            logger.info(
              `    ${index + 1}. ID: 0x${item.id.toString(16)}, Length: ${
                item.length
              }`
            );
          }
        });
      }

      // Send acknowledgment
      const response = this.createGeneralResponse(message, 0);
      connection.socket.write(response);
      logger.debug(
        `Device data report acknowledged for terminal ${connection.terminalId}`
      );
    } catch (error) {
      logger.error(`Error handling device data report: ${error.message}`);

      // Send error response
      const response = this.createGeneralResponse(message, 1);
      connection.socket.write(response);
    }
  }

  // Handle data transparent transmission messages (0x0900) from device
  handleDataTransparentTransmission(message, connection, connectionId) {
    if (!connection.isAuthenticated) {
      logger.warn(
        `Unauthorized data transparent transmission from ${connectionId}`
      );
      return;
    }

    logger.info(
      `Data Transparent Transmission from terminal ${connection.terminalId}`
    );

    try {
      // Parse transparent transmission message according to Table 3.10.1
      const transparentData = this.parseDataTransparentTransmission(
        message.body
      );

      logger.info(`Data Transparent Transmission Details:`);
      logger.info(
        `  Message Type: 0x${transparentData.messageType.toString(16)} (${
          transparentData.messageTypeName
        })`
      );
      logger.info(`  Data Length: ${transparentData.data.length} bytes`);

      // Handle different message types
      switch (transparentData.messageType) {
        case 0xf0:
          this.handleGPSTransparentTransmission(
            transparentData.data,
            connection
          );
          break;
        case 0xf1:
          this.handleGPSDataTransmission(transparentData.data, connection);
          break;
        case 0x41:
          this.handleOBDDataTransmission(transparentData.data, connection);
          break;
        case 0xa1:
          this.handleCMSPrivateData(transparentData.data, connection);
          break;
        case 0xf3:
          this.handleULVTransparentData(transparentData.data, connection);
          break;
        default:
          if (
            transparentData.messageType >= 0xf0 &&
            transparentData.messageType <= 0xff
          ) {
            logger.info(
              `User-defined transparent message type 0x${transparentData.messageType.toString(
                16
              )}`
            );
            this.handleUserDefinedTransparentData(
              transparentData.data,
              connection,
              transparentData.messageType
            );
          } else {
            logger.warn(
              `Unknown transparent message type: 0x${transparentData.messageType.toString(
                16
              )}`
            );
          }
      }

      // Send acknowledgment
      const response = this.createGeneralResponse(message, 0);
      connection.socket.write(response);
      logger.debug(
        `Data transparent transmission acknowledged for terminal ${connection.terminalId}`
      );
    } catch (error) {
      logger.error(
        `Error handling data transparent transmission: ${error.message}`
      );

      // Send error response
      const response = this.createGeneralResponse(message, 1);
      connection.socket.write(response);
    }
  }

  handleMultimediaEventUpload(message, connection, connectionId) {
    if (!connection.isAuthenticated) {
      logger.warn(`Unauthorized multimedia event upload from ${connectionId}`);
      return;
    }

    logger.info(
      `Multimedia event upload from terminal ${connection.terminalId}`
    );

    try {
      // Parse multimedia event upload message according to Table 3.7.1
      const multimediaData = this.parseMultimediaEventUpload(message.body);

      // ULV Protocol Compliance: Check message sequence
      const isCompliant = this.logULVProtocolStatus(
        connection,
        0x0800,
        multimediaData.dataId
      );
      if (!isCompliant) {
        logger.warn(
          `ULV Protocol violation detected for multimedia event ${multimediaData.dataId}`
        );
      }

      logger.info(`Multimedia Event Upload Details:`);
      logger.info(`  Data ID: ${multimediaData.dataId}`);
      logger.info(
        `  Type: ${multimediaData.typeName} (${multimediaData.type})`
      );
      logger.info(
        `  Format: ${multimediaData.formatName} (${multimediaData.format})`
      );
      logger.info(
        `  Event: ${multimediaData.eventName} (${multimediaData.event})`
      );
      logger.info(`  Channel: ${multimediaData.channelId}`);

      // Store multimedia event info for tracking (ULV Protocol requirement)
      if (!connection.multimediaEvents) {
        connection.multimediaEvents = new Map();
      }
      connection.multimediaEvents.set(multimediaData.dataId, {
        ...multimediaData,
        timestamp: new Date(),
        status: "event_received",
        messageSerialNumber: message.messageSerialNumber,
      });

      logger.info(
        `✅ Multimedia event ${multimediaData.dataId} registered - waiting for data upload`
      );
      logger.info(
        `📋 ULV Protocol: Event registered, device may now send 0x0801 data upload`
      );

      // Send acknowledgment (ULV Protocol: Platform must acknowledge 0x0800)
      const response = this.createGeneralResponse(message, 0x00);
      connection.socket.write(response);
      logger.debug(
        `Multimedia event upload acknowledged for terminal ${connection.terminalId}`
      );
    } catch (error) {
      logger.error(`Error handling multimedia event upload: ${error.message}`);
      // Send error response
      const response = this.createGeneralResponse(message, 0x02);
      connection.socket.write(response);
    }
  }

  handleMultimediaDataUpload(message, connection, connectionId) {
    if (!connection.isAuthenticated) {
      logger.warn(`Unauthorized multimedia data upload from ${connectionId}`);
      return;
    }

    logger.info(
      `Multimedia data upload from terminal ${connection.terminalId}`
    );

    try {
      // DEBUG: Log raw message data
      logger.debug(`🔍 RAW MULTIMEDIA MESSAGE DEBUG:`);
      logger.debug(`  Message ID: 0x${message.messageId.toString(16)}`);
      logger.debug(`  Body length: ${message.body.length} bytes`);
      logger.debug(`  Raw body (hex): ${message.body.toString("hex")}`);
      logger.debug(
        `  Raw body (first 50 bytes): ${message.body
          .slice(0, 50)
          .toString("hex")}`
      );

      // Parse multimedia data upload message according to Table 3.8.1
      const multimediaData = this.parseMultimediaDataUpload(message.body);

      // ULV Protocol Compliance: Check message sequence
      const isCompliant = this.logULVProtocolStatus(
        connection,
        0x0801,
        multimediaData.dataId
      );
      if (!isCompliant) {
        logger.warn(
          `ULV Protocol violation detected for multimedia data upload ${multimediaData.dataId}`
        );
      }

      // DEBUG: Log parsed data structure
      logger.debug(`🔍 PARSED MULTIMEDIA DATA DEBUG:`);
      logger.debug(
        `  multimediaData object:`,
        JSON.stringify(multimediaData, null, 2)
      );
      logger.debug(
        `  Type check: multimediaData.type = ${
          multimediaData.type
        } (${typeof multimediaData.type})`
      );
      logger.debug(
        `  Format check: multimediaData.format = ${
          multimediaData.format
        } (${typeof multimediaData.format})`
      );

      logger.info(`Multimedia Data Upload Details:`);
      logger.info(`  Data ID: ${multimediaData.dataId}`);
      logger.info(
        `  Type: ${multimediaData.typeName} (${multimediaData.type})`
      );
      logger.info(
        `  Format: ${multimediaData.formatName} (${multimediaData.format})`
      );
      logger.info(
        `  Event: ${multimediaData.eventName} (${multimediaData.event})`
      );
      logger.info(`  Channel: ${multimediaData.channelId}`);

      // ULV Protocol Compliance: Check if this multimedia event was registered
      if (
        !connection.multimediaEvents ||
        !connection.multimediaEvents.has(multimediaData.dataId)
      ) {
        logger.warn(
          `⚠️ ULV Protocol Violation: Received 0x0801 for unregistered multimedia event ${multimediaData.dataId}`
        );
        logger.warn(
          `📋 ULV Protocol requires: 0x0800 (event) → 0x8800 (ack) → 0x0801 (data)`
        );

        // Send 0x8800 response indicating error (data ID = 0 means error)
        const errorResponse = this.createMultimediaPlatformResponse(
          message,
          0,
          0,
          []
        );
        connection.socket.write(errorResponse);
        logger.debug(
          `Sent 0x8800 error response for unregistered multimedia event`
        );
        return;
      }

      if (multimediaData.location) {
        logger.info(
          `  Location: ${multimediaData.location.latitude}, ${multimediaData.location.longitude}`
        );
        logger.info(`  Time: ${multimediaData.location.time}`);
      }

      // Extract and save the actual media file data
      // According to ULV Protocol Table 3.8.1:
      // Bytes 0-7: Multimedia header (8 bytes)
      // Bytes 8-35: Location information (28 bytes)
      // Bytes 36+: Actual media data
      const mediaDataStart = 36; // Fixed offset according to ULV protocol

      // DEBUG: Log media data extraction details
      logger.debug(`🔍 MEDIA DATA EXTRACTION DEBUG:`);
      logger.debug(`  Message body length: ${message.body.length} bytes`);
      logger.debug(
        `  ULV Protocol: Header (8 bytes) + Location (28 bytes) = 36 bytes`
      );
      logger.debug(`  Calculated media data start: ${mediaDataStart} bytes`);
      logger.debug(
        `  Available bytes after mediaDataStart: ${
          message.body.length - mediaDataStart
        } bytes`
      );

      if (message.body.length > mediaDataStart) {
        const mediaData = message.body.slice(mediaDataStart); // Skip header and location data
        logger.debug(
          `  Extracted media data length: ${mediaData.length} bytes`
        );
        logger.debug(
          `  Media data (first 16 bytes): ${mediaData
            .slice(0, 16)
            .toString("hex")}`
        );
        logger.debug(
          `  Media data (last 16 bytes): ${mediaData
            .slice(-16)
            .toString("hex")}`
        );

        if (mediaData.length > 0) {
          // Ensure we have a valid terminal ID
          if (!connection.terminalId) {
            logger.warn(
              `Cannot save multimedia file: connection has no terminal ID`
            );
            return;
          }
          this.saveMultimediaFile(
            multimediaData,
            mediaData,
            connection.terminalId
          );

          // Update multimedia event status
          if (
            connection.multimediaEvents &&
            connection.multimediaEvents.has(multimediaData.dataId)
          ) {
            const event = connection.multimediaEvents.get(
              multimediaData.dataId
            );
            event.status = "file_saved";
            event.fileSize = mediaData.length;
            event.savedAt = new Date();
            logger.info(
              `Multimedia event ${multimediaData.dataId} completed - file saved successfully`
            );
          }
        }
      } else {
        logger.warn(
          `Message body too short for media data extraction: ${
            message.body.length
          } bytes, need at least ${mediaDataStart + 1} bytes`
        );
      }

      // Check if this is streaming data and handle accordingly
      if (this.handleStreamingData(message, connection, connectionId)) {
        logger.debug(`🎥 Multimedia data processed as streaming data`);
        return; // Already handled by streaming handler
      }

      // ULV Protocol: Send 0x8800 response instead of general acknowledgment
      // Data ID = 0 means all packets received successfully, no retransmission needed
      const successResponse = this.createMultimediaPlatformResponse(
        message,
        0,
        0,
        []
      );
      connection.socket.write(successResponse);
      logger.debug(
        `✅ Sent 0x8800 success response for multimedia data upload (data ID: 0, no retransmission)`
      );
      logger.info(
        `📋 ULV Protocol: 0x0801 message processed successfully, 0x8800 response sent`
      );
    } catch (error) {
      logger.error(`Error handling multimedia data upload: ${error.message}`);
      // Send 0x8800 error response
      const errorResponse = this.createMultimediaPlatformResponse(
        message,
        0,
        0,
        []
      );
      connection.socket.write(errorResponse);
      logger.debug(`Sent 0x8800 error response due to processing error`);
    }
  }

  handleMultimediaPlatformResponse(
    originalMessage,
    dataId,
    retransmissionCount,
    packetIds
  ) {
    // Create 0x8800 Multimedia Platform Response according to ULV Protocol Table 3.8.2
    // This is the proper response to 0x0801 messages as per ULV protocol

    // Calculate body length: 4 bytes (dataId) + 1 byte (count) + 2*n bytes (packet IDs)
    const bodyLength = 4 + 1 + 2 * retransmissionCount;

    // Create the message body
    const messageBody = Buffer.alloc(bodyLength);
    messageBody.writeUInt32BE(dataId, 0); // Multimedia data ID (DWORD)
    messageBody.writeUInt8(retransmissionCount, 4); // Total number of retransmitted packets (BYTE)

    // Add packet IDs if retransmission is needed
    if (retransmissionCount > 0 && packetIds && packetIds.length > 0) {
      for (
        let i = 0;
        i < Math.min(retransmissionCount, packetIds.length);
        i++
      ) {
        const offset = 5 + i * 2;
        messageBody.writeUInt16BE(packetIds[i], offset); // Packet ID (WORD)
      }
    }

    // Create the complete JT808 message with proper header structure
    const message = Buffer.alloc(17 + messageBody.length + 1); // Header + Body + Checksum

    // Header according to Table 2.2.2
    message.writeUInt16BE(0x8800, 0); // Message ID: Multimedia Platform Response
    message.writeUInt16BE(messageBody.length, 2); // Properties: Message body length (10 bits)
    message.writeUInt8(1, 4); // Protocol Version: Fixed to 1 for JTT808-2019
    message.writeUInt32BE(0, 5); // Terminal Phone Number: 0 for platform messages (BCD[10] format)
    message.writeUInt32BE(0, 9); // Terminal Phone Number: continued
    message.writeUInt16BE(0, 13); // Terminal Phone Number: continued
    message.writeUInt16BE(this.generateSerialNumber(), 15); // Message Serial Number

    // Message body
    messageBody.copy(message, 17);

    // Calculate checksum according to 2.2.4
    let checksum = 0;
    for (let i = 0; i < message.length - 1; i++) {
      checksum ^= message[i];
    }
    message.writeUInt8(checksum, message.length - 1);

    // Add start/end markers and escape according to 2.2.1
    return this.escapeAndWrapMessage(message);
  }

  // ULV Protocol Compliance: Check if multimedia event sequence is correct
  checkULVProtocolSequence(connection, multimediaDataId, messageType) {
    if (!connection.multimediaEvents) {
      connection.multimediaEvents = new Map();
    }

    const event = connection.multimediaEvents.get(multimediaDataId);

    if (messageType === 0x0800) {
      // 0x0800: Multimedia Event Upload - Always allowed
      return { valid: true, reason: "Event upload always allowed" };
    }

    if (messageType === 0x0801) {
      // 0x0801: Multimedia Data Upload - Must have registered event first
      if (!event) {
        return {
          valid: false,
          reason: `ULV Protocol Violation: 0x0801 received for unregistered multimedia event ${multimediaDataId}`,
        };
      }

      if (event.status !== "event_received") {
        return {
          valid: false,
          reason: `ULV Protocol Violation: Event ${multimediaDataId} status is ${event.status}, expected 'event_received'`,
        };
      }

      return {
        valid: true,
        reason: "Event properly registered, data upload allowed",
      };
    }

    return { valid: true, reason: "Other message types not restricted" };
  }

  // ULV Protocol: Log protocol compliance status
  logULVProtocolStatus(connection, messageType, multimediaDataId) {
    if (messageType === 0x0800 || messageType === 0x0801) {
      const sequenceCheck = this.checkULVProtocolSequence(
        connection,
        multimediaDataId,
        messageType
      );

      if (sequenceCheck.valid) {
        logger.info(`✅ ULV Protocol: ${sequenceCheck.reason}`);
      } else {
        logger.warn(`⚠️ ULV Protocol: ${sequenceCheck.reason}`);
        logger.info(
          `📋 ULV Protocol requires: 0x0800 (event) → 0x8800 (ack) → 0x0801 (data)`
        );
      }

      return sequenceCheck.valid;
    }
    return true;
  }

  saveMultimediaFile(multimediaData, mediaData, terminalId) {
    try {
      // Create directory structure for the terminal
      const terminalDir = path.join("media", "uploads", terminalId);
      if (!fs.existsSync(terminalDir)) {
        fs.mkdirSync(terminalDir, { recursive: true });
      }

      // Debug: Log the multimedia data structure
      logger.debug(`saveMultimediaFile - multimediaData:`, {
        dataId: multimediaData.dataId,
        type: multimediaData.type,
        typeName: multimediaData.typeName,
        format: multimediaData.format,
        formatName: multimediaData.formatName,
        event: multimediaData.event,
        channelId: multimediaData.channelId,
      });

      // Determine file extension based on media type and format
      let fileExtension = "bin";
      if (multimediaData.type === 0) {
        // Image
        if (multimediaData.format === 0) fileExtension = "jpg";
        else if (multimediaData.format === 1) fileExtension = "png";
        else fileExtension = "img";
      } else if (multimediaData.type === 1) {
        // Audio
        if (multimediaData.format === 0) fileExtension = "wav";
        else if (multimediaData.format === 1) fileExtension = "mp3";
        else fileExtension = "audio";
      } else if (multimediaData.type === 2) {
        // Video
        if (multimediaData.format === 0) fileExtension = "mp4";
        else if (multimediaData.format === 1) fileExtension = "avi";
        else fileExtension = "video";
      }

      // Enhanced file type detection from content headers
      if (fileExtension === "bin" && mediaData.length > 4) {
        const header = mediaData.slice(0, 4);
        logger.debug(`Analyzing file header: ${header.toString("hex")}`);

        if (header[0] === 0xff && header[1] === 0xd8) {
          fileExtension = "jpg";
          logger.info(`✅ Detected JPEG format from file header (FF D8)`);
        } else if (
          header[0] === 0x89 &&
          header[1] === 0x50 &&
          header[2] === 0x4e &&
          header[3] === 0x47
        ) {
          fileExtension = "png";
          logger.info(`✅ Detected PNG format from file header (89 50 4E 47)`);
        } else if (
          header[0] === 0x52 &&
          header[1] === 0x49 &&
          header[2] === 0x46 &&
          header[3] === 0x46
        ) {
          fileExtension = "wav";
          logger.info(`✅ Detected WAV format from file header (52 49 46 46)`);
        } else if (
          header[0] === 0x00 &&
          header[1] === 0x00 &&
          header[2] === 0x00 &&
          header[3] === 0x18
        ) {
          fileExtension = "mp4";
          logger.info(`✅ Detected MP4 format from file header (00 00 00 18)`);
        } else {
          logger.warn(`⚠️ Unknown file format, keeping .bin extension`);
        }
      }

      // Create filename with timestamp and data ID
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `${multimediaData.dataId}_${timestamp}.${fileExtension}`;
      const filepath = path.join(terminalDir, filename);

      // Save the media file
      fs.writeFileSync(filepath, mediaData);

      // Validate the saved file
      const savedFileSize = fs.statSync(filepath).size;
      if (savedFileSize !== mediaData.length) {
        logger.error(
          `❌ File size mismatch: expected ${mediaData.length} bytes, saved ${savedFileSize} bytes`
        );
      } else {
        logger.info(`✅ File saved successfully: ${filepath}`);
        logger.info(`  Size: ${mediaData.length} bytes`);
        logger.info(`  Type: ${multimediaData.typeName}`);
        logger.info(`  Format: ${multimediaData.formatName}`);
        logger.info(`  Extension: ${fileExtension}`);
      }

      // Also save to type-specific directories for easy access
      const typeDir = path.join(
        "media",
        this.getMediaTypeDirectory(multimediaData.type)
      );
      if (!fs.existsSync(typeDir)) {
        fs.mkdirSync(typeDir, { recursive: true });
      }

      const typeFilepath = path.join(typeDir, filename);
      fs.writeFileSync(typeFilepath, mediaData);
      logger.info(
        `Multimedia file also saved to type directory: ${typeFilepath}`
      );

      // Log final file information
      logger.info(`Multimedia file saved with extension: ${fileExtension}`);
      logger.info(`File size: ${mediaData.length} bytes`);
    } catch (error) {
      logger.error(`Error saving multimedia file: ${error.message}`);
    }
  }

  // Handle multimedia platform response messages (0x8800) from device
  handleMultimediaPlatformResponse(message, connection, connectionId) {
    logger.info(`Multimedia platform response received from ${connectionId}`);

    try {
      // Parse platform response message according to Table 3.8.2
      const responseData = this.parseMultimediaPlatformResponse(message.body);

      logger.info(`Multimedia Platform Response Details:`);
      logger.info(`  Data ID: ${responseData.dataId}`);
      logger.info(
        `  Retransmission Count: ${responseData.retransmissionCount}`
      );

      if (responseData.retransmissionCount > 0) {
        logger.info(
          `  Retransmission Packet IDs: ${responseData.packetIds.join(", ")}`
        );
        logger.info(
          `  Note: Device should retransmit these packets using 0x0801 message`
        );
      } else {
        logger.info(
          `  All packets received successfully - no retransmission needed`
        );
      }

      // Send acknowledgment
      const response = this.createGeneralResponse(message, 0x00);
      connection.socket.write(response);
      logger.debug(
        `Multimedia platform response acknowledged for terminal ${
          connection.terminalId || "unknown"
        }`
      );
    } catch (error) {
      logger.error(
        `Error handling multimedia platform response: ${error.message}`
      );
      // Send error response
      const response = this.createGeneralResponse(message, 0x02);
      connection.socket.write(response);
    }
  }

  // Utility method to fix existing .bin files
  fixExistingBinFiles() {
    try {
      const uploadsDir = path.join("media", "uploads");
      if (!fs.existsSync(uploadsDir)) return;

      logger.info("Scanning for existing .bin files to fix...");

      const terminalDirs = fs.readdirSync(uploadsDir);
      let fixedCount = 0;

      for (const terminalDir of terminalDirs) {
        const terminalPath = path.join(uploadsDir, terminalDir);
        if (!fs.statSync(terminalPath).isDirectory()) continue;

        const files = fs.readdirSync(terminalPath);
        for (const file of files) {
          if (file.endsWith(".bin")) {
            const filePath = path.join(terminalPath, file);
            const newPath = this.detectAndRenameFile(filePath);
            if (newPath) {
              logger.info(`Fixed file: ${file} → ${path.basename(newPath)}`);
              fixedCount++;
            }
          }
        }
      }

      logger.info(`Fixed ${fixedCount} .bin files`);
    } catch (error) {
      logger.error(`Error fixing existing .bin files: ${error.message}`);
    }
  }

  detectAndRenameFile(filePath) {
    try {
      const data = fs.readFileSync(filePath);
      if (data.length < 4) return null;

      const header = data.slice(0, 4);
      let newExtension = "bin";

      if (header[0] === 0xff && header[1] === 0xd8) {
        newExtension = "jpg";
      } else if (
        header[0] === 0x89 &&
        header[1] === 0x50 &&
        header[2] === 0x4e &&
        header[3] === 0x47
      ) {
        newExtension = "png";
      } else if (
        header[0] === 0x52 &&
        header[1] === 0x49 &&
        header[2] === 0x46 &&
        header[3] === 0x46
      ) {
        newExtension = "wav";
      } else if (
        header[0] === 0x00 &&
        header[1] === 0x00 &&
        header[2] === 0x00 &&
        header[3] === 0x18
      ) {
        newExtension = "mp4";
      }

      if (newExtension !== "bin") {
        const newPath = filePath.replace(".bin", `.${newExtension}`);
        fs.renameSync(filePath, newPath);
        return newPath;
      }
    } catch (error) {
      logger.error(
        `Error detecting file type for ${filePath}: ${error.message}`
      );
    }
    return null;
  }

  getMediaTypeDirectory(mediaType) {
    switch (mediaType) {
      case 0:
        return "images";
      case 1:
        return "audio";
      case 2:
        return "video";
      default:
        return "uploads";
    }
  }

  parseMultimediaEventUpload(body) {
    if (body.length < 8) {
      throw new Error(
        `Multimedia event upload body too short: ${body.length} bytes`
      );
    }

    const dataId = body.readUInt32BE(0);
    const type = body.readUInt8(4);
    const format = body.readUInt8(5);
    const event = body.readUInt8(6);
    const channelId = body.readUInt8(7);

    // Convert values to readable names
    const typeNames = { 0: "Image", 1: "Audio", 2: "Video" };
    const formatNames = { 0: "JPEG" };
    const eventNames = { 0: "Platform Instruction", 1: "Timing Action" };

    return {
      dataId,
      type,
      typeName: typeNames[type] || `Unknown (${type})`,
      format,
      formatName: formatNames[format] || `Reserved (${format})`,
      event,
      eventName: eventNames[event] || `Reserved (${event})`,
      channelId,
    };
  }

  parseMultimediaDataUpload(body) {
    if (body.length < 36) {
      // 8 bytes header + 28 bytes location
      throw new Error(
        `Multimedia data upload body too short: ${body.length} bytes`
      );
    }

    // DEBUG: Log raw parsing
    logger.debug(`🔍 PARSING MULTIMEDIA DATA UPLOAD BODY:`);
    logger.debug(`  Body length: ${body.length} bytes`);
    logger.debug(
      `  First 16 bytes (hex): ${body.slice(0, 16).toString("hex")}`
    );

    // ULV Protocol Compliance: Multimedia header MUST be at offset 0
    // According to ULV spec: 0x0801 message body starts with multimedia header
    let dataId, type, format, event, channelId;

    // Parse ULV multimedia header at offset 0 (protocol compliant)
    dataId = body.readUInt32BE(0);
    type = body.readUInt8(4);
    format = body.readUInt8(5);
    event = body.readUInt8(6);
    channelId = body.readUInt8(7);

    // Validate ULV protocol compliance
    if (dataId <= 0) {
      logger.warn(
        `⚠️ ULV Protocol Violation: Data ID must be > 0, got ${dataId}`
      );
    }
    if (type > 2) {
      logger.warn(`⚠️ ULV Protocol Violation: Type must be 0-2, got ${type}`);
    }
    if (format > 10) {
      logger.warn(
        `⚠️ ULV Protocol Violation: Format must be 0-10, got ${format}`
      );
    }
    if (event > 2) {
      logger.warn(`⚠️ ULV Protocol Violation: Event must be 0-2, got ${event}`);
    }

    logger.debug(`🔍 ULV Protocol Compliant Header (offset 0):`);
    logger.debug(`  Data ID: ${dataId} (0x${dataId.toString(16)})`);
    logger.debug(`  Type: ${type} (0x${type.toString(16)})`);
    logger.debug(`  Format: ${format} (0x${format.toString(16)})`);
    logger.debug(`  Event: ${event} (0x${event.toString(16)})`);
    logger.debug(`  Channel: ${channelId} (0x${channelId.toString(16)})`);

    // DEBUG: Log parsed values
    logger.debug(`🔍 PARSED VALUES:`);
    logger.debug(`  dataId: ${dataId} (0x${dataId.toString(16)})`);
    logger.debug(`  type: ${type} (0x${type.toString(16)})`);
    logger.debug(`  format: ${format} (0x${format.toString(16)})`);
    logger.debug(`  event: ${event} (0x${event.toString(16)})`);
    logger.debug(`  channelId: ${channelId} (0x${channelId.toString(16)})`);

    // Parse location information (28 bytes, structured as 0x0200 message body)
    // According to ULV Protocol: Location data starts at byte 8
    const locationStart = 8;
    const locationEnd = locationStart + 28;
    const locationData = this.parseLocationData(
      body.slice(locationStart, locationEnd)
    );

    // Convert values to readable names
    const typeNames = { 0: "Image", 1: "Audio", 2: "Video" };
    const formatNames = { 0: "JPEG" };
    const eventNames = { 0: "Platform Instruction", 1: "Timing Action" };

    return {
      dataId,
      type,
      typeName: typeNames[type] || `Unknown (${type})`,
      format,
      formatName: formatNames[format] || `Reserved (${format})`,
      event,
      eventName: eventNames[event] || `Reserved (${event})`,
      channelId,
      location: locationData,
    };
  }

  parseMultimediaPlatformResponse(body) {
    if (body.length < 4) {
      throw new Error(
        `Multimedia platform response body too short: ${body.length} bytes`
      );
    }

    const dataId = body.readUInt32BE(0);

    if (dataId === 0) {
      // No retransmission needed
      return {
        dataId,
        retransmissionCount: 0,
        packetIds: [],
      };
    }

    if (body.length < 5) {
      throw new Error(
        `Multimedia platform response body too short for retransmission count: ${body.length} bytes`
      );
    }

    const retransmissionCount = body.readUInt8(4);

    if (retransmissionCount === 0) {
      return {
        dataId,
        retransmissionCount: 0,
        packetIds: [],
      };
    }

    // Calculate expected length: 4 bytes (dataId) + 1 byte (count) + 2*n bytes (packet IDs)
    const expectedLength = 5 + 2 * retransmissionCount;

    if (body.length < expectedLength) {
      throw new Error(
        `Multimedia platform response body too short for packet IDs: ${body.length} bytes, expected ${expectedLength}`
      );
    }

    const packetIds = [];
    for (let i = 0; i < retransmissionCount; i++) {
      const offset = 5 + i * 2;
      const packetId = body.readUInt16BE(offset);
      packetIds.push(packetId);
    }

    return {
      dataId,
      retransmissionCount,
      packetIds,
    };
  }

  handlePlatformGeneralResponse(message, connection, connectionId) {
    logger.info(`Platform general response from ${connectionId}`);
  }

  parseLocationData(body) {
    // Parse location data according to JT808 protocol (Table 3.5.2)
    if (body.length < 28) {
      throw new Error(
        `Location message too short: ${body.length} bytes, expected at least 28`
      );
    }

    let offset = 0;

    // Location Basic Information (Table 3.5.2)
    const alarmSign = body.readUInt32BE(offset);
    offset += 4; // DWORD - Alarm flags
    const condition = body.readUInt32BE(offset);
    offset += 4; // DWORD - Status bits
    const latitude = body.readInt32BE(offset);
    offset += 4; // DWORD - Latitude * 10^6
    const longitude = body.readInt32BE(offset);
    offset += 4; // DWORD - Longitude * 10^6
    const altitude = body.readUInt16BE(offset);
    offset += 2; // WORD - Altitude in meters
    const speed = body.readUInt16BE(offset);
    offset += 2; // WORD - Speed * 0.1 km/h
    const direction = body.readUInt16BE(offset);
    offset += 2; // WORD - Direction 0-359°
    const timestamp = body.readUInt32BE(offset);
    offset += 4; // DWORD - JTT2019 timestamp (seconds since 2000-01-01)
    const reserved = body.readUInt16BE(offset);
    offset += 2; // WORD - Reserved field

    // Parse JTT2019 timestamp format
    const time = this.parseJTT2019Time(timestamp);

    // Parse alarm flags (Table 3.5.3)
    const alarmFlags = this.parseAlarmFlags(alarmSign);

    // Parse status bits (Table 3.5.4)
    const statusBits = this.parseStatusBits(condition);

    // Parse additional information items
    const additionalInfo = this.parseAdditionalInfo(body.slice(offset));

    return {
      // Basic location data
      latitude: latitude / 1000000, // Convert to decimal degrees
      longitude: longitude / 1000000, // Convert to decimal degrees
      altitude: altitude, // Meters
      speed: speed / 10, // Convert to km/h
      direction: direction, // Degrees (0-359)
      time: time, // Parsed timestamp

      // Alarm and status information
      alarmSign: alarmSign,
      condition: condition,
      alarmFlags: alarmFlags,
      statusBits: statusBits,

      // Additional information
      additionalInfo: additionalInfo,
    };
  }

  // Parse JTT2019 timestamp format (seconds since 2000-01-01 00:00:00 UTC)
  parseJTT2019Time(timestamp) {
    const jtt2019Epoch = new Date("2000-01-01T00:00:00Z").getTime();
    const utcTime = jtt2019Epoch + timestamp * 1000;
    const date = new Date(utcTime);

    return date.toISOString();
  }

  // Parse alarm flags according to Table 3.5.3
  parseAlarmFlags(alarmSign) {
    const flags = {};

    if (alarmSign & (1 << 0)) flags.emergencyAlarm = "SOS";
    if (alarmSign & (1 << 1)) flags.overspeedAlarm = "Overspeed";
    if (alarmSign & (1 << 2)) flags.fatigueDriving = "Fatigue Driving";
    if (alarmSign & (1 << 4)) flags.gnssModuleFailure = "GNSS Module Failure";
    if (alarmSign & (1 << 5))
      flags.gnssAntennaDisconnected = "GNSS Antenna Disconnected";
    if (alarmSign & (1 << 6))
      flags.gnssAntennaShortCircuit = "GNSS Antenna Short Circuit";
    if (alarmSign & (1 << 8)) flags.mainPowerOff = "Main Power Off";
    if (alarmSign & (1 << 14))
      flags.fatigueDrivingWarning = "Fatigue Driving Warning";
    if (alarmSign & (1 << 18))
      flags.cumulativeDrivingOvertime = "Cumulative Driving Overtime";
    if (alarmSign & (1 << 19)) flags.overtimeParking = "Overtime Parking";
    if (alarmSign & (1 << 29)) flags.collisionAlarm = "Collision Alarm";

    return flags;
  }

  // Parse status bits according to Table 3.5.4
  parseStatusBits(condition) {
    const status = {};

    status.acc = condition & (1 << 0) ? "ON" : "OFF";
    status.located = condition & (1 << 1) ? "YES" : "NO";
    status.latitude = condition & (1 << 2) ? "SOUTH" : "NORTH";
    status.longitude = condition & (1 << 3) ? "WEST" : "EAST";
    status.door1 = condition & (1 << 13) ? "OPEN" : "CLOSED";
    status.door2 = condition & (1 << 14) ? "OPEN" : "CLOSED";
    status.door3 = condition & (1 << 15) ? "OPEN" : "CLOSED";
    status.door4 = condition & (1 << 16) ? "OPEN" : "CLOSED";
    status.gpsSatellites = condition & (1 << 18) ? "USED" : "NOT_USED";
    status.beidouSatellites = condition & (1 << 19) ? "USED" : "NOT_USED";
    status.glonassSatellites = condition & (1 << 20) ? "USED" : "NOT_USED";
    status.galileoSatellites = condition & (1 << 21) ? "USED" : "NOT_USED";
    status.vehicleState = condition & (1 << 22) ? "RUNNING" : "STOPPED";

    return status;
  }

  // Parse additional information items according to Table 3.5.6
  parseAdditionalInfo(data) {
    const items = {};
    let offset = 0;

    while (offset < data.length && offset + 2 <= data.length) {
      const infoId = data.readUInt8(offset);
      offset += 1;
      const infoLength = data.readUInt8(offset);
      offset += 1;

      if (offset + infoLength > data.length) {
        logger.warn(
          `Additional info item ${infoId} length ${infoLength} exceeds remaining data`
        );
        break;
      }

      const infoData = data.slice(offset, offset + infoLength);
      offset += infoLength;

      switch (infoId) {
        case 0x01: // Mileage
          if (infoLength === 4) {
            items.mileage = infoData.readUInt32BE(0) / 10; // Convert to km
          }
          break;

        case 0x02: // Fuel quantity
          if (infoLength === 2) {
            items.fuelQuantity = infoData.readUInt16BE(0) / 10; // Convert to L
          }
          break;

        case 0x03: // Speed from tachograph
          if (infoLength === 2) {
            items.tachographSpeed = infoData.readUInt16BE(0) / 10; // Convert to km/h
          }
          break;

        case 0x14: // Video related alarm
          if (infoLength === 4) {
            items.videoAlarm = infoData.readUInt32BE(0);
          }
          break;

        case 0x15: // Video signal loss alarm
          if (infoLength === 4) {
            items.videoSignalLoss = infoData.readUInt32BE(0);
          }
          break;

        case 0x17: // Memory fault alarm
          if (infoLength === 2) {
            items.memoryFault = infoData.readUInt16BE(0);
          }
          break;

        case 0x18: // Abnormal driving
          if (infoLength === 5) {
            items.abnormalDriving = {
              motionDetection: infoData.readUInt8(4) & (1 << 2) ? "YES" : "NO",
            };
          }
          break;

        case 0x25: // Extended vehicle signal status (not part of location reporting)
          if (infoLength === 4) {
            items.extendedVehicleStatus = infoData.readUInt32BE(0);
          }
          break;

        case 0x2a: // IO Status bits (not part of location reporting)
          if (infoLength === 2) {
            items.ioStatus = infoData.readUInt16BE(0);
          }
          break;

        case 0x30: // Wireless communication network signal strength
          if (infoLength === 1) {
            items.signalStrength = infoData.readUInt8(0);
          }
          break;

        case 0x31: // Number of GNSS positioning stars
          if (infoLength === 1) {
            items.gnssStars = infoData.readUInt8(0);
          }
          break;

        case 0xec: // Auxiliary fuel quantity
          if (infoLength === 2) {
            items.auxiliaryFuel = infoData.readUInt16BE(0) / 10; // Convert to L
          }
          break;

        case 0xe4: // Environmental data (temperature/humidity)
          if (infoLength === 16) {
            items.environmental = {
              temp1: infoData.readInt16BE(0) / 10, // Temperature 1
              humidity1: infoData.readUInt16BE(2), // Humidity 1
              temp2: infoData.readInt16BE(4) / 10, // Temperature 2
              humidity2: infoData.readUInt16BE(6), // Humidity 2
              temp3: infoData.readInt16BE(8) / 10, // Temperature 3
              humidity3: infoData.readUInt16BE(10), // Humidity 3
              temp4: infoData.readInt16BE(12) / 10, // Temperature 4
              humidity4: infoData.readUInt16BE(14), // Humidity 4
            };
          }
          break;

        case 0xef: // MDVR status
          if (infoLength === 13) {
            items.mdvrStatus = this.parseMDVRStatus(infoData);
          }
          break;

        case 0xfc: // Device specific data (from real device)
          if (infoLength === 12) {
            items.deviceSpecificData = {
              rawData: infoData.toString("hex"),
              note: "Device-specific data format (12 bytes)",
            };
          }
          break;

        case 0xe1: // Device status indicator (from real device)
          if (infoLength === 1) {
            items.deviceStatus = {
              status: infoData.readUInt8(0),
              note: "Device status indicator (1 byte)",
            };
          }
          break;

        default:
          logger.debug(
            `Unknown additional info ID: 0x${infoId.toString(
              16
            )} (length: ${infoLength})`
          );
          items[`unknown_${infoId}`] = infoData.toString("hex");
      }
    }

    return items;
  }

  // Parse video related alarm according to Table 3.5.6
  parseVideoAlarm(data) {
    if (data.length < 4) return null;

    const alarmBits = data.readUInt32BE(0);
    return {
      videoLoss: alarmBits & (1 << 0) ? "YES" : "NO",
      abnormalDriving: alarmBits & (1 << 4) ? "YES" : "NO",
      rawValue: alarmBits,
    };
  }

  // Parse video signal loss alarm state according to Table 3.5.6
  parseVideoSignalLoss(data) {
    if (data.length < 4) return null;

    const lossBits = data.readUInt32BE(0);
    const channels = [];

    for (let i = 0; i < 32; i++) {
      if (lossBits & (1 << i)) {
        channels.push(i + 1); // Channel numbers are 1-based
      }
    }

    return {
      channels: channels,
      rawValue: lossBits,
    };
  }

  // Parse memory fault alarm status according to Table 3.5.6
  parseMemoryFault(data) {
    if (data.length < 2) return null;

    const faultBits = data.readUInt16BE(0);
    const memories = [];

    for (let i = 0; i < 12; i++) {
      if (faultBits & (1 << i)) {
        memories.push(i + 1); // Memory numbers are 1-based
      }
    }

    return {
      memories: memories,
      rawValue: faultBits,
    };
  }

  // Parse abnormal driving according to Table 3.5.6
  parseAbnormalDriving(data) {
    if (data.length < 5) return null;

    const motionBit = data.readUInt8(4);
    return {
      motionDetection: motionBit & (1 << 2) ? "YES" : "NO",
      rawValue: motionBit,
    };
  }

  // Note: Tables 3.5.7 and 3.5.8 are NOT part of location reporting
  // They are for other message types in the JT808 protocol

  // Parse ADAS alarm information
  parseADASAlarm(data) {
    // This would need Table 3.5.9 for full implementation
    return {
      rawData: data.toString("hex"),
      note: "Full parsing requires Table 3.5.9 specification",
    };
  }

  // Parse driver status monitoring system alarm
  parseDriverStatusAlarm(data) {
    // This would need Table 3.5.10 for full implementation
    return {
      rawData: data.toString("hex"),
      note: "Full parsing requires Table 3.5.10 specification",
    };
  }

  // Parse blind spot monitoring system alarm
  parseBlindSpotAlarm(data) {
    // This would need Table 3.5.11 for full implementation
    return {
      rawData: data.toString("hex"),
      note: "Full parsing requires Table 3.5.11 specification",
    };
  }

  // Parse MDVR status
  parseMDVRStatus(data) {
    // This would need Table 3.5.13 for full implementation
    return {
      rawData: data.toString("hex"),
      note: "Full parsing requires Table 3.5.13 specification",
    };
  }

  createRegisterResponse(originalMessage, result) {
    const response = Buffer.alloc(12);
    response.writeUInt16BE(0x8100, 0); // Message ID
    response.writeUInt16BE(originalMessage.messageSerialNumber, 2);
    response.writeUInt32BE(originalMessage.terminalId, 4);
    response.writeUInt16BE(1, 8); // Result count
    response.writeUInt16BE(result, 10); // Result

    return this.parser.buildMessage(response);
  }

  createGeneralResponse(originalMessage, result) {
    // According to JT808 protocol Table 2.2.2, the message header is 17 bytes
    // and the body contains the response data according to Table 3.1.2

    // Create the message body (5 bytes) according to Table 3.1.2
    const messageBody = Buffer.alloc(5);
    messageBody.writeUInt16BE(originalMessage.messageSerialNumber, 0); // Reply serial number (2 bytes)
    messageBody.writeUInt16BE(originalMessage.messageId, 2); // Reply ID - the original message ID (2 bytes)
    messageBody.writeUInt8(result, 4); // Result code: 0=success, 1=failure, 2=message error, 3=not supported (1 byte)

    // Create the complete JT808 message with proper header structure
    const message = Buffer.alloc(17 + messageBody.length + 1); // Header + Body + Checksum

    // Header according to Table 2.2.2
    message.writeUInt16BE(0x8001, 0); // Message ID: Platform General Response
    message.writeUInt16BE(messageBody.length, 2); // Properties: Message body length (10 bits)
    message.writeUInt8(1, 4); // Protocol Version: Fixed to 1 for JTT808-2019
    message.writeUInt32BE(0, 5); // Terminal Phone Number: 0 for platform messages (BCD[10] format)
    message.writeUInt32BE(0, 9); // Terminal Phone Number: continued
    message.writeUInt16BE(0, 13); // Terminal Phone Number: continued
    message.writeUInt16BE(this.generateSerialNumber(), 15); // Message Serial Number

    // Message body
    messageBody.copy(message, 17);

    // Calculate checksum according to 2.2.4
    let checksum = 0;
    for (let i = 0; i < message.length - 1; i++) {
      checksum ^= message[i];
    }
    message.writeUInt8(checksum, message.length - 1);

    // Add start/end markers and escape according to 2.2.1
    return this.escapeAndWrapMessage(message);
  }

  createMultimediaPlatformResponse(
    originalMessage,
    dataId,
    retransmissionCount,
    packetIds
  ) {
    // Create 0x8800 Multimedia Platform Response according to ULV Protocol Table 3.8.2
    // This is the proper response to 0x0801 messages as per ULV protocol

    // Calculate body length: 4 bytes (dataId) + 1 byte (count) + 2*n bytes (packet IDs)
    const bodyLength = 4 + 1 + 2 * retransmissionCount;

    // Create the message body
    const messageBody = Buffer.alloc(bodyLength);
    messageBody.writeUInt32BE(dataId, 0); // Multimedia data ID (DWORD)
    messageBody.writeUInt8(retransmissionCount, 4); // Total number of retransmitted packets (BYTE)

    // Add packet IDs if retransmission is needed
    if (retransmissionCount > 0 && packetIds && packetIds.length > 0) {
      for (
        let i = 0;
        i < Math.min(retransmissionCount, packetIds.length);
        i++
      ) {
        const offset = 5 + i * 2;
        messageBody.writeUInt16BE(packetIds[i], offset); // Packet ID (WORD)
      }
    }

    // Create the complete JT808 message with proper header structure
    const message = Buffer.alloc(17 + messageBody.length + 1); // Header + Body + Checksum

    // Header according to Table 2.2.2
    message.writeUInt16BE(0x8800, 0); // Message ID: Multimedia Platform Response
    message.writeUInt16BE(messageBody.length, 2); // Properties: Message body length (10 bits)
    message.writeUInt8(1, 4); // Protocol Version: Fixed to 1 for JTT808-2019
    message.writeUInt32BE(0, 5); // Terminal Phone Number: 0 for platform messages (BCD[10] format)
    message.writeUInt32BE(0, 9); // Terminal Phone Number: continued
    message.writeUInt16BE(0, 13); // Terminal Phone Number: continued
    message.writeUInt16BE(this.generateSerialNumber(), 15); // Message Serial Number

    // Message body
    messageBody.copy(message, 17);

    // Calculate checksum according to 2.2.4
    let checksum = 0;
    for (let i = 0; i < message.length - 1; i++) {
      checksum ^= message[i];
    }
    message.writeUInt8(checksum, message.length - 1);

    // Add start/end markers and escape according to 2.2.1
    return this.escapeAndWrapMessage(message);
  }

  // ULV Protocol Compliance: Check if multimedia event sequence is correct
  checkULVProtocolSequence(connection, multimediaDataId, messageType) {
    if (!connection.multimediaEvents) {
      connection.multimediaEvents = new Map();
    }

    const event = connection.multimediaEvents.get(multimediaDataId);

    if (messageType === 0x0800) {
      // 0x0800: Multimedia Event Upload - Always allowed
      return { valid: true, reason: "Event upload always allowed" };
    }

    if (messageType === 0x0801) {
      // 0x0801: Multimedia Data Upload - Must have registered event first
      if (!event) {
        return {
          valid: false,
          reason: `ULV Protocol Violation: 0x0801 received for unregistered multimedia event ${multimediaDataId}`,
        };
      }

      if (event.status !== "event_received") {
        return {
          valid: false,
          reason: `ULV Protocol Violation: Event ${multimediaDataId} status is ${event.status}, expected 'event_received'`,
        };
      }

      return {
        valid: true,
        reason: "Event properly registered, data upload allowed",
      };
    }

    return { valid: true, reason: "Other message types not restricted" };
  }

  // ULV Protocol: Log protocol compliance status
  logULVProtocolStatus(connection, messageType, multimediaDataId) {
    if (messageType === 0x0800 || messageType === 0x0801) {
      const sequenceCheck = this.checkULVProtocolSequence(
        connection,
        multimediaDataId,
        messageType
      );

      if (sequenceCheck.valid) {
        logger.info(`✅ ULV Protocol: ${sequenceCheck.reason}`);
      } else {
        logger.warn(`⚠️ ULV Protocol: ${sequenceCheck.reason}`);
        logger.info(
          `📋 ULV Protocol requires: 0x0800 (event) → 0x8800 (ack) → 0x0801 (data)`
        );
      }

      return sequenceCheck.valid;
    }
    return true;
  }

  createLocationQueryResponse(originalMessage) {
    // Create location query response
    const response = Buffer.alloc(28);
    response.writeUInt16BE(0x0201, 0); // Message ID
    response.writeUInt16BE(originalMessage.messageSerialNumber, 2);
    response.writeUInt32BE(originalMessage.terminalId, 4);

    // Add sample location data
    response.writeUInt32BE(0, 8); // Alarm
    response.writeUInt32BE(0, 12); // Status
    response.writeInt32BE(40000000, 16); // Latitude (40.0)
    response.writeInt32BE(116000000, 20); // Longitude (116.0)
    response.writeUInt16BE(100, 24); // Altitude
    response.writeUInt16BE(0, 26); // Speed

    return this.parser.buildMessage(response);
  }

  sendGeneralResponse(socket, message, result) {
    const response = this.createGeneralResponse(message, result);
    socket.write(response);
  }

  // Authentication helper methods
  isTerminalAllowed(terminalId) {
    // Convert both the configured IDs and the received terminalId to strings for comparison
    const allowedTerminals = config.auth.allowedTerminals.map((id) =>
      id.toString()
    );
    return allowedTerminals.includes(terminalId.toString());
  }

  parseAuthenticationData(body) {
    if (body.length < 8) {
      throw new Error("Authentication data too short");
    }

    return {
      authCode: body.readUInt32BE(0),
      timestamp: body.readUInt32BE(4),
    };
  }

  verifyAuthentication(terminalId, authData) {
    // Simple authentication: check if auth code matches terminal ID pattern
    // In production, this should use proper cryptographic verification
    const expectedAuthCode = this.generateAuthCode(
      terminalId,
      authData.timestamp
    );
    return authData.authCode === expectedAuthCode;
  }

  generateAuthCode(terminalId, timestamp) {
    // Simple hash-based authentication code
    // In production, use proper cryptographic methods
    const data = `${terminalId}:${timestamp}:${config.auth.authSecret}`;
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = ((hash << 5) - hash + data.charCodeAt(i)) & 0xffffffff;
    }
    return hash >>> 0; // Convert to unsigned 32-bit
  }

  createAuthenticationChallenge(originalMessage) {
    const challenge = Buffer.alloc(8);
    challenge.writeUInt16BE(0x8100, 0); // Message ID
    challenge.writeUInt16BE(originalMessage.messageSerialNumber, 2);
    challenge.writeUInt32BE(originalMessage.terminalId, 4);

    return this.parser.buildMessage(challenge);
  }

  createAuthenticationResponse(originalMessage, result) {
    const response = Buffer.alloc(4);
    response.writeUInt16BE(0x8001, 0); // Message ID
    response.writeUInt16BE(originalMessage.messageSerialNumber, 2);

    return this.parser.buildMessage(response);
  }

  // Clean up disconnected connections
  cleanupConnections() {
    const now = Date.now();
    for (const [connectionId, connection] of this.connections.entries()) {
      // Check if socket is still valid
      if (connection.socket.destroyed) {
        logger.info(`Removing destroyed connection: ${connectionId}`);

        // Clean up any active streaming sessions
        if (connection.streamingSessions) {
          for (const [
            sessionId,
            session,
          ] of connection.streamingSessions.entries()) {
            logger.debug(
              `🧹 Cleaned up streaming session ${sessionId} for destroyed connection`
            );
          }
        }

        this.connections.delete(connectionId);
        continue;
      }

      // Check heartbeat timeout (longer for authenticated terminals)
      const heartbeatTimeout = connection.isAuthenticated ? 300000 : 60000; // 5 min vs 1 min
      if (now - connection.lastHeartbeat > heartbeatTimeout) {
        logger.info(
          `Cleaning up inactive connection: ${connectionId} (last heartbeat: ${
            now - connection.lastHeartbeat
          }ms ago)`
        );

        // Clean up any active streaming sessions
        if (connection.streamingSessions) {
          for (const [
            sessionId,
            session,
          ] of connection.streamingSessions.entries()) {
            logger.debug(
              `🧹 Cleaned up streaming session ${sessionId} for inactive connection`
            );
          }
        }

        connection.socket.destroy();
        this.connections.delete(connectionId);
        continue;
      }

      // Check message activity timeout
      if (now - connection.lastMessageTime > 600000) {
        // 10 minutes
        logger.info(
          `Cleaning up inactive connection: ${connectionId} (no messages for ${Math.round(
            (now - connection.lastMessageTime) / 1000
          )}s)`
        );

        // Clean up any active streaming sessions
        if (connection.streamingSessions) {
          for (const [
            sessionId,
            session,
          ] of connection.streamingSessions.entries()) {
            logger.debug(
              `🧹 Cleaned up streaming session ${sessionId} for inactive connection`
            );
          }
        }

        connection.socket.destroy();
        this.connections.delete(connectionId);
        continue;
      }
    }
  }

  // Get server statistics
  getStats() {
    return {
      activeConnections: this.connections.size,
      authenticatedTerminals: Array.from(this.connections.values()).filter(
        (conn) => conn.isAuthenticated
      ).length,
    };
  }

  createHeartbeatInstruction(originalMessage) {
    // Create instruction to send proper heartbeat messages (0x0002)
    // According to JT808 protocol, this should be a general response with instruction
    const response = Buffer.alloc(5);
    response.writeUInt16BE(originalMessage.messageSerialNumber, 0); // Reply serial number (2 bytes)
    response.writeUInt16BE(originalMessage.messageId, 2); // Reply ID - the original message ID (2 bytes)
    response.writeUInt8(0x00, 4); // Result: Success (1 byte)

    return this.parser.buildMessage(response);
  }

  generateSerialNumber() {
    // Generate a unique serial number for platform messages
    return Math.floor(Math.random() * 65536);
  }

  escapeAndWrapMessage(message) {
    // Escape special characters according to 2.2.1
    const escaped = [];

    for (let i = 0; i < message.length; i++) {
      if (message[i] === 0x7e) {
        escaped.push(0x7d, 0x02);
      } else if (message[i] === 0x7d) {
        escaped.push(0x7d, 0x01);
      } else {
        escaped.push(message[i]);
      }
    }

    // Add start/end markers
    return Buffer.concat([
      Buffer.from([0x7e]),
      Buffer.from(escaped),
      Buffer.from([0x7e]),
    ]);
  }

  extractTerminalPhoneNumber(message) {
    // Extract terminal phone number from platform location query message
    // For 0x8201, the terminal phone number is in the message header (after properties and protocol version)
    // The message structure is: [MessageID(2)][Properties(2)][ProtocolVersion(1)][TerminalPhone(6)][SerialNumber(2)][Reserved(4)]

    // We need to access the raw message data since the phone number is in the header
    // The phone number starts at offset 5 (after MessageID + Properties + ProtocolVersion)
    if (message.rawData && message.rawData.length >= 17) {
      const phoneNumberBytes = message.rawData.slice(5, 11); // 6 bytes starting at offset 5

      // Convert BCD to string
      let phoneNumber = "";
      for (let i = 0; i < 6; i++) {
        const byte = phoneNumberBytes[i];
        phoneNumber += Math.floor(byte / 16).toString(16);
        phoneNumber += (byte % 16).toString(16);
      }

      logger.debug(
        `Extracted phone number: ${phoneNumber} from bytes: ${phoneNumberBytes.toString(
          "hex"
        )}`
      );
      return phoneNumber;
    }

    logger.warn(
      `Cannot extract phone number - message.rawData length: ${
        message.rawData ? message.rawData.length : "undefined"
      }`
    );
    return null;
  }

  findDeviceConnection(terminalPhoneNumber) {
    // Find device connection by terminal ID
    for (const [connectionId, connection] of this.connections.entries()) {
      if (connection.terminalId === terminalPhoneNumber) {
        return connection;
      }
    }
    return null;
  }

  createDeviceLocationQuery(terminalPhoneNumber) {
    // Create a location query message (0x0201) to send to the device
    const messageId = Buffer.alloc(2);
    messageId.writeUInt16BE(0x0201, 0); // Location Query

    const properties = Buffer.alloc(2);
    properties.writeUInt16BE(0x0000, 0); // No body content

    const protocolVersion = Buffer.alloc(1);
    protocolVersion.writeUInt8(0x01, 0); // Protocol version 1

    // Convert phone number to BCD format (6 bytes)
    const bcdPhone = Buffer.alloc(6);
    for (let i = 0; i < 6; i++) {
      bcdPhone[i] = parseInt(terminalPhoneNumber.substr(i * 2, 2), 16);
    }

    const messageSerialNumber = Buffer.alloc(2);
    messageSerialNumber.writeUInt16BE(this.generateSerialNumber(), 0);

    const reserved = Buffer.alloc(4);
    reserved.writeUInt32BE(0, 0);

    // Build header (17 bytes)
    const header = Buffer.concat([
      messageId, // 2 bytes: Message ID
      properties, // 2 bytes: Properties (body length)
      protocolVersion, // 1 byte: Protocol version
      bcdPhone, // 6 bytes: Terminal phone number
      messageSerialNumber, // 2 bytes: Message serial number
      reserved, // 4 bytes: Reserved
    ]);

    // Calculate checksum
    let checksum = 0;
    for (let i = 0; i < header.length; i++) {
      checksum ^= header[i];
    }

    const checksumBuffer = Buffer.alloc(1);
    checksumBuffer.writeUInt8(checksum, 0);

    // Build complete message
    const message = Buffer.concat([header, checksumBuffer]);

    // Escape and wrap
    return this.escapeAndWrapMessage(message);
  }

  /**
   * Send platform instruction to terminal
   */
  sendPlatformInstruction(connection, instruction) {
    try {
      const { action, terminalId, ...params } = instruction;

      logger.info(
        `📤 Sending platform instruction to terminal ${terminalId}: ${action}`
      );

      // For terminal control commands, use 0x8105 with standard ULV command words
      if (
        action === "disconnect_oil" ||
        action === "recovery_oil" ||
        action === "disconnect_circuit" ||
        action === "recovery_circuit" ||
        action === "restart_device"
      ) {
        // Map action to command word
        let commandWord;
        switch (action) {
          case "disconnect_oil":
            commandWord = 0x70;
            break;
          case "recovery_oil":
            commandWord = 0x71;
            break;
          case "disconnect_circuit":
            commandWord = 0x72;
            break;
          case "recovery_circuit":
            commandWord = 0x73;
            break;
          case "restart_device":
            commandWord = 0x74;
            break;
          default:
            logger.warn(`Unknown terminal control action: ${action}`);
            return false;
        }
        return this.sendTerminalControl(connection.terminalId, commandWord);
      } else {
        logger.warn(`Unknown action type: ${action}`);
        return false;
      }
    } catch (error) {
      logger.error(`Error sending platform instruction: ${error.message}`);
      return false;
    }
  }

  sendMultimediaFileUploadInstructions(connection, instruction) {
    try {
      const {
        terminalId,
        serverAddress,
        port,
        username,
        password,
        uploadPath,
        channelId = 1,
        startTime,
        endTime,
      } = instruction;

      logger.info(
        `📁 Sending 0x9206 File Upload Instructions to terminal ${terminalId}`
      );

      // Create message body for 0x9206 File Upload Instructions
      const serverAddrBuffer = Buffer.from(serverAddress, "utf8");
      const usernameBuffer = Buffer.from(username, "utf8");
      const passwordBuffer = Buffer.from(password, "utf8");
      const uploadPathBuffer = Buffer.from(uploadPath, "utf8");

      // Calculate total message body length
      const messageBody = Buffer.alloc(
        27 +
          serverAddrBuffer.length +
          usernameBuffer.length +
          passwordBuffer.length +
          uploadPathBuffer.length
      );

      let offset = 0;

      // Server address length and address
      messageBody.writeUInt8(serverAddrBuffer.length, offset);
      offset += 1;
      serverAddrBuffer.copy(messageBody, offset);
      offset += serverAddrBuffer.length;

      // Port
      messageBody.writeUInt16BE(port, offset);
      offset += 2;

      // Username length and username
      messageBody.writeUInt8(usernameBuffer.length, offset);
      offset += 1;
      usernameBuffer.copy(messageBody, offset);
      offset += usernameBuffer.length;

      // Password length and password
      messageBody.writeUInt8(passwordBuffer.length, offset);
      offset += 1;
      passwordBuffer.copy(messageBody, offset);
      offset += passwordBuffer.length;

      // Upload path length and path
      messageBody.writeUInt8(uploadPathBuffer.length, offset);
      offset += 1;
      uploadPathBuffer.copy(messageBody, offset);
      offset += uploadPathBuffer.length;

      // Logical channel number
      messageBody.writeUInt8(channelId, offset);
      offset += 1;

      // Start time (BCD format: YY-MM-DD-HH-MM-SS)
      if (startTime) {
        const startDate = new Date(startTime);
        messageBody.writeUInt8(startDate.getFullYear() % 100, offset);
        messageBody.writeUInt8(startDate.getMonth() + 1, offset + 1);
        messageBody.writeUInt8(startDate.getDate(), offset + 2);
        messageBody.writeUInt8(startDate.getHours(), offset + 3);
        messageBody.writeUInt8(startDate.getMinutes(), offset + 4);
        messageBody.writeUInt8(startDate.getSeconds(), offset + 5);
      } else {
        // Use current time if not specified
        const now = new Date();
        messageBody.writeUInt8(now.getFullYear() % 100, offset);
        messageBody.writeUInt8(now.getMonth() + 1, offset + 1);
        messageBody.writeUInt8(now.getDate(), offset + 2);
        messageBody.writeUInt8(now.getHours(), offset + 3);
        messageBody.writeUInt8(now.getMinutes(), offset + 4);
        messageBody.writeUInt8(now.getSeconds(), offset + 5);
      }
      offset += 6;

      // End time (BCD format: YY-MM-DD-HH-MM-SS)
      if (endTime) {
        const endDate = new Date(endTime);
        messageBody.writeUInt8(endDate.getFullYear() % 100, offset);
        messageBody.writeUInt8(endDate.getMonth() + 1, offset + 1);
        messageBody.writeUInt8(endDate.getDate(), offset + 2);
        messageBody.writeUInt8(endDate.getHours(), offset + 3);
        messageBody.writeUInt8(endDate.getMinutes(), offset + 4);
        messageBody.writeUInt8(endDate.getSeconds(), offset + 5);
      } else {
        // Use current time + 1 hour if not specified
        const now = new Date();
        now.setHours(now.getHours() + 1);
        messageBody.writeUInt8(now.getFullYear() % 100, offset);
        messageBody.writeUInt8(now.getMonth() + 1, offset + 1);
        messageBody.writeUInt8(now.getDate(), offset + 2);
        messageBody.writeUInt8(now.getHours(), offset + 3);
        messageBody.writeUInt8(now.getMinutes(), offset + 4);
        messageBody.writeUInt8(now.getSeconds(), offset + 5);
      }
      offset += 6;

      // Alarm sign (64 bits, not used, fill with 0)
      messageBody.writeBigUInt64LE(0n, offset);
      offset += 8;

      // Build complete JT808 message using the parser
      const message = this.parser.buildMessage(messageBody);

      // Send to terminal
      connection.socket.write(message);

      logger.info(
        `✅ 0x9206 File Upload Instructions sent to terminal ${terminalId}`
      );
      return true;
    } catch (error) {
      logger.error(`Error sending file upload instructions: ${error.message}`);
      return false;
    }
  }

  sendTerminalControlCommand(connection, instruction) {
    try {
      const { action, terminalId } = instruction;

      logger.info(
        `🎮 Sending 0x8105 Terminal Control Command to terminal ${terminalId} for ${action}`
      );

      // Map actions to ULV protocol command words (from Section 3.20)
      let commandWord;
      switch (action) {
        case "disconnect_oil":
          commandWord = 0x70; // Disconnect the oil
          break;
        case "recovery_oil":
          commandWord = 0x71; // Recovery oil
          break;
        case "disconnect_circuit":
          commandWord = 0x72; // Disconnect the circuit
          break;
        case "recovery_circuit":
          commandWord = 0x73; // Recovery circuit
          break;
        case "restart_device":
          commandWord = 0x74; // Restart the device
          break;
        default:
          logger.warn(`Unknown terminal control action: ${action}`);
          return false;
      }

      // Create JT808 message with 0x8105
      const messageBody = Buffer.alloc(1);
      messageBody.writeUInt8(commandWord, 0); // Command word

      // Send to terminal using the proper method
      const success = this.sendMessageToTerminal(
        connection,
        0x8105,
        messageBody
      );

      logger.info(
        `✅ 0x8105 Terminal Control Command (${this.getTerminalControlCommandName(
          commandWord
        )}) sent to terminal ${terminalId}`
      );
      return true;
    } catch (error) {
      logger.error(`Error sending terminal control command: ${error.message}`);
      return false;
    }
  }

  sendMultimediaRequest(connection, request) {
    try {
      const { type, format, event, channelId } = request;

      // Create multimedia request message (0x8800 with specific body)
      const messageId = Buffer.alloc(2);
      messageId.writeUInt16BE(0x8800, 0);

      // Create message body for multimedia request
      const multimediaDataId = Buffer.alloc(4);
      multimediaDataId.writeUInt32BE(Date.now(), 0); // Use timestamp as ID

      const multimediaType = Buffer.alloc(1);
      multimediaType.writeUInt8(this.getMultimediaTypeCode(type), 0);

      const multimediaFormat = Buffer.alloc(1);
      multimediaFormat.writeUInt8(this.getMultimediaFormatCode(format), 0);

      const eventCode = Buffer.alloc(1);
      eventCode.writeUInt8(this.getEventCode(event), 0);

      const channelIdBuffer = Buffer.alloc(1);
      channelIdBuffer.writeUInt8(channelId || 1, 0);

      const body = Buffer.concat([
        multimediaDataId,
        multimediaType,
        multimediaFormat,
        eventCode,
        channelIdBuffer,
      ]);

      const properties = Buffer.alloc(2);
      properties.writeUInt16BE(body.length, 0);

      const protocolVersion = Buffer.alloc(1);
      protocolVersion.writeUInt8(0x01, 0);

      // Convert terminal ID to BCD format
      const bcdPhone = Buffer.alloc(6);
      const phoneNumber = connection.terminalId;
      for (let i = 0; i < 6; i++) {
        bcdPhone[i] = parseInt(phoneNumber.substr(i * 2, 2), 16);
      }

      const messageSerialNumber = Buffer.alloc(2);
      messageSerialNumber.writeUInt16BE(this.generateSerialNumber(), 0);

      const reserved = Buffer.alloc(4);
      reserved.writeUInt32BE(0, 0);

      // Build header
      const header = Buffer.concat([
        messageId,
        properties,
        protocolVersion,
        bcdPhone,
        messageSerialNumber,
        reserved,
      ]);

      // Build complete message
      const message = Buffer.concat([header, body]);

      // Calculate checksum
      let checksum = 0;
      for (let i = 0; i < message.length; i++) {
        checksum ^= message[i];
      }

      const checksumBuffer = Buffer.alloc(1);
      checksumBuffer.writeUInt8(checksum, 0);

      const completeMessage = Buffer.concat([message, checksumBuffer]);
      const escapedMessage = this.escapeAndWrapMessage(completeMessage);

      // Send to terminal
      connection.socket.write(escapedMessage);

      logger.info(
        `Multimedia request sent to terminal ${connection.terminalId}: ${type} ${format}`
      );
      return true;
    } catch (error) {
      logger.error(`Error sending multimedia request: ${error.message}`);
      return false;
    }
  }

  sendPlatformResponse(connection, response) {
    try {
      const { multimediaDataId, action, packetIds } = response;

      // Create platform response message (0x8800)
      const messageId = Buffer.alloc(2);
      messageId.writeUInt16BE(0x8800, 0);

      let body;
      if (action === "retransmit" && packetIds && packetIds.length > 0) {
        // Retransmission request
        const multimediaDataIdBuffer = Buffer.alloc(4);
        multimediaDataIdBuffer.writeUInt32BE(multimediaDataId, 0);

        const totalRetransmittedPackets = Buffer.alloc(1);
        totalRetransmittedPackets.writeUInt8(packetIds.length, 0);

        const retransmissionPacketIds = Buffer.alloc(packetIds.length * 2);
        packetIds.forEach((packetId, index) => {
          retransmissionPacketIds.writeUInt16BE(packetId, index * 2);
        });

        body = Buffer.concat([
          multimediaDataIdBuffer,
          totalRetransmittedPackets,
          retransmissionPacketIds,
        ]);
      } else {
        // Success response (no retransmission needed)
        const multimediaDataIdBuffer = Buffer.alloc(4);
        multimediaDataIdBuffer.writeUInt32BE(multimediaDataId, 0);
        body = multimediaDataIdBuffer;
      }

      const properties = Buffer.alloc(2);
      properties.writeUInt16BE(body.length, 0);

      const protocolVersion = Buffer.alloc(1);
      protocolVersion.writeUInt8(0x01, 0);

      // Convert terminal ID to BCD format
      const bcdPhone = Buffer.alloc(6);
      const phoneNumber = connection.terminalId;
      for (let i = 0; i < 6; i++) {
        bcdPhone[i] = parseInt(phoneNumber.substr(i * 2, 2), 16);
      }

      const messageSerialNumber = Buffer.alloc(2);
      messageSerialNumber.writeUInt16BE(this.generateSerialNumber(), 0);

      const reserved = Buffer.alloc(4);
      reserved.writeUInt32BE(0, 0);

      // Build header
      const header = Buffer.concat([
        messageId,
        properties,
        protocolVersion,
        bcdPhone,
        messageSerialNumber,
        reserved,
      ]);

      // Build complete message
      const message = Buffer.concat([header, body]);

      // Calculate checksum
      let checksum = 0;
      for (let i = 0; i < message.length; i++) {
        checksum ^= message[i];
      }

      const checksumBuffer = Buffer.alloc(1);
      checksumBuffer.writeUInt8(checksum, 0);

      const completeMessage = Buffer.concat([message, checksumBuffer]);
      const escapedMessage = this.escapeAndWrapMessage(completeMessage);

      // Send to terminal
      connection.socket.write(escapedMessage);

      logger.info(
        `Platform response sent to terminal ${connection.terminalId}: ${action}`
      );
      return true;
    } catch (error) {
      logger.error(`Error sending platform response: ${error.message}`);
      return false;
    }
  }

  getRecentMultimediaUploads(limit = 50, terminalId = null) {
    try {
      // This would typically query a database or file system
      // For now, return a mock response
      const uploads = [];

      if (terminalId) {
        // Filter by terminal ID
        uploads.push({
          terminalId,
          timestamp: new Date().toISOString(),
          type: "image",
          format: "jpeg",
          size: "15KB",
          status: "uploaded",
        });
      } else {
        // Return recent uploads from all terminals
        for (const [id, connection] of this.connections.entries()) {
          if (connection.terminalId) {
            uploads.push({
              terminalId: connection.terminalId,
              timestamp: new Date().toISOString(),
              type: "image",
              format: "jpeg",
              size: "15KB",
              status: "uploaded",
            });
          }
        }
      }

      return uploads.slice(0, limit);
    } catch (error) {
      logger.error(`Error getting multimedia uploads: ${error.message}`);
      return [];
    }
  }

  // Helper methods for multimedia codes
  getMultimediaTypeCode(type) {
    const typeMap = { image: 0, audio: 1, video: 2 };
    return typeMap[type.toLowerCase()] || 0;
  }

  getMultimediaFormatCode(format) {
    const formatMap = { jpeg: 0, png: 1, mp4: 2, avi: 3 };
    return formatMap[format.toLowerCase()] || 0;
  }

  getEventCode(event) {
    const eventMap = { platform_instruction: 0, timing_action: 1, alarm: 2 };
    return eventMap[event.toLowerCase()] || 0;
  }

  generateSerialNumber() {
    return Math.floor(Math.random() * 65535) + 1;
  }

  // ============================================================================
  // Resource Query Protocol Handlers (0x9205, 0x1205)
  // ============================================================================

  /**
   * Handle Resource Query (0x9205)
   * Platform queries terminal for available multimedia resources
   */
  handleResourceQuery(message, connection, connectionId) {
    try {
      logger.info(`🔍 Resource Query received from ${connectionId}`);

      // Parse the resource query body
      const queryData = this.parseResourceQuery(message.body);

      if (queryData) {
        logger.info(`🔍 Resource Query Details:`);
        logger.info(`  Response Serial: ${queryData.responseSerial}`);
        logger.info(`  Channel Number: ${queryData.channelNumber}`);
        logger.info(`  Resource Type: ${queryData.resourceType}`);
        logger.info(`  Stream Type: ${queryData.streamType}`);
        logger.info(`  Memory Type: ${queryData.memoryType}`);
        logger.info(
          `  Time Range: ${queryData.startTime} to ${queryData.endTime}`
        );
        logger.info(`  Alarm Sign: 0x${queryData.alarmSign}`);

        // Store query request for this connection
        connection.pendingResourceQuery = queryData;

        // Send general response (0x8001) to acknowledge receipt
        this.sendGeneralResponse(connection.socket, message, 0x0000);

        logger.info(
          `✅ Resource Query acknowledged for terminal ${
            connection.terminalId || connectionId
          }`
        );
      }
    } catch (error) {
      logger.error(`Error handling resource query: ${error.message}`);
      // Send error response
      this.sendGeneralResponse(connection.socket, message, 0x0001);
    }
  }

  /**
   * Handle Resource Query Response (0x1205)
   * Terminal responds with list of available multimedia resources
   */
  handleResourceQueryResponse(message, connection, connectionId) {
    try {
      logger.info(`🔍 Resource Query Response received from ${connectionId}`);

      // Parse the resource query response body
      const responseData = this.parseResourceQueryResponse(message.body);

      if (responseData) {
        logger.info(`🔍 Resource Query Response Details:`);
        logger.info(`  Response Serial: ${responseData.responseSerial}`);
        logger.info(`  Total Resources: ${responseData.totalResources}`);
        logger.info(
          `  Resource List: ${responseData.resourceList.length} items`
        );

        // Log each resource
        responseData.resourceList.forEach((resource, index) => {
          logger.info(`  Resource ${index + 1}:`);
          logger.info(`    Channel: ${resource.channelNumber}`);
          logger.info(`    Type: ${resource.resourceType}`);
          logger.info(`    Stream: ${resource.streamType}`);
          logger.info(`    Storage: ${resource.storageLocation}`);
          logger.info(`    File Size: ${resource.fileSize} bytes`);
          logger.info(`    Time: ${resource.time}`);
          logger.info(
            `    Location: ${resource.latitude}, ${resource.longitude}`
          );
        });

        // Store the resource list for this connection
        connection.resourceList = responseData.resourceList;

        logger.info(
          `✅ Resource Query Response processed for terminal ${
            connection.terminalId || connectionId
          }`
        );
      }
    } catch (error) {
      logger.error(`Error handling resource query response: ${error.message}`);
    }
  }

  // ============================================================================
  // File Upload Protocol Handlers (0x9206, 0x1206, 0x9207)
  // ============================================================================

  /**
   * Handle File Upload Instructions (0x9206)
   * Platform sends FTP upload commands to terminal
   */
  handleFileUploadInstructions(message, connection, connectionId) {
    try {
      logger.info(`📁 File Upload Instructions received from ${connectionId}`);

      // Parse the file upload instruction body
      const uploadData = this.parseFileUploadInstructions(message.body);

      if (uploadData) {
        logger.info(`📁 File Upload Instructions Details:`);
        logger.info(
          `  FTP Server: ${uploadData.serverAddress}:${uploadData.port}`
        );
        logger.info(`  Username: ${uploadData.username}`);
        logger.info(`  Path: ${uploadData.uploadPath}`);
        logger.info(`  Channel: ${uploadData.channelNumber}`);
        logger.info(
          `  Time Range: ${uploadData.startTime} to ${uploadData.endTime}`
        );
        logger.info(`  Resource Type: ${uploadData.resourceType}`);
        logger.info(`  Stream Type: ${uploadData.streamType}`);
        logger.info(`  Storage: ${uploadData.storageLocation}`);
        logger.info(
          `  Conditions: WIFI=${uploadData.wifiEnabled}, LAN=${uploadData.lanEnabled}, 3G/4G=${uploadData.mobileEnabled}`
        );

        // Store upload instructions for this connection
        connection.pendingUpload = uploadData;

        // Send general response (0x8001) to acknowledge receipt
        this.sendGeneralResponse(connection.socket, message, 0x0000);

        logger.info(
          `✅ File Upload Instructions acknowledged for terminal ${
            connection.terminalId || connectionId
          }`
        );
      }
    } catch (error) {
      logger.error(`Error handling file upload instructions: ${error.message}`);
      // Send error response
      this.sendGeneralResponse(connection.socket, message, 0x0001);
    }
  }

  /**
   * Handle File Upload Completion Notice (0x1206)
   * Terminal reports upload completion status
   */
  handleFileUploadCompletion(message, connection, connectionId) {
    try {
      logger.info(
        `📁 File Upload Completion Notice received from ${connectionId}`
      );

      // Parse the completion notice body
      const completionData = this.parseFileUploadCompletion(message.body);

      if (completionData) {
        logger.info(`📁 File Upload Completion Details:`);
        logger.info(`  Response Serial: ${completionData.responseSerial}`);
        logger.info(
          `  Result: ${completionData.result === 0 ? "Success" : "Failed"}`
        );

        // Clear pending upload for this connection
        if (connection.pendingUpload) {
          delete connection.pendingUpload;
        }

        logger.info(
          `✅ File Upload Completion processed for terminal ${
            connection.terminalId || connectionId
          }`
        );
      }
    } catch (error) {
      logger.error(`Error handling file upload completion: ${error.message}`);
    }
  }

  /**
   * Handle File Upload Control (0x9207)
   * Platform controls upload process (pause/continue/cancel)
   */
  handleFileUploadControl(message, connection, connectionId) {
    try {
      logger.info(`📁 File Upload Control received from ${connectionId}`);

      // Parse the control message body
      const controlData = this.parseFileUploadControl(message.body);

      if (controlData) {
        const actionMap = { 0: "Pause", 1: "Continue", 2: "Cancel" };
        logger.info(`📁 File Upload Control Details:`);
        logger.info(`  Response Serial: ${controlData.responseSerial}`);
        logger.info(
          `  Action: ${actionMap[controlData.uploadControl] || "Unknown"}`
        );

        // Send general response (0x8001) to acknowledge receipt
        this.sendGeneralResponse(connection.socket, message, 0x0000);

        logger.info(
          `✅ File Upload Control acknowledged for terminal ${
            connection.terminalId || connectionId
          }`
        );
      }
    } catch (error) {
      logger.error(`Error handling file upload control: ${error.message}`);
      // Send error response
      this.sendGeneralResponse(connection.socket, message, 0x0001);
    }
  }

  // ============================================================================
  // Terminal Control Handler (0x8105)
  // ============================================================================

  /**
   * Handle Terminal Control (0x8105)
   * Platform sends control commands to terminal
   */
  handleTerminalControl(message, connection, connectionId) {
    try {
      logger.info(`🎮 Terminal Control received from ${connectionId}`);

      // Parse the control command body
      const controlData = this.parseTerminalControl(message.body);

      if (controlData) {
        const commandMap = {
          0x70: "Disconnect Oil",
          0x71: "Recovery Oil",
          0x72: "Disconnect Circuit",
          0x73: "Recovery Circuit",
          0x74: "Restart Device",
        };

        logger.info(`🎮 Terminal Control Details:`);
        logger.info(
          `  Command: 0x${controlData.command.toString(16)} - ${
            commandMap[controlData.command] || "Unknown"
          }`
        );

        // Send general response (0x8001) to acknowledge receipt
        this.sendGeneralResponse(connection.socket, message, 0x0000);

        logger.info(
          `✅ Terminal Control acknowledged for terminal ${
            connection.terminalId || connectionId
          }`
        );
      }
    } catch (error) {
      logger.error(`Error handling terminal control: ${error.message}`);
      // Send error response
      this.sendGeneralResponse(connection.socket, message, 0x0001);
    }
  }

  // ============================================================================
  // Parsing Methods for New Protocol Messages
  // ============================================================================

  /**
   * Parse Resource Query (0x9205) message body
   */
  parseResourceQuery(body) {
    try {
      if (body.length < 27) {
        // Updated minimum length for 64-bit alarm sign
        logger.warn(
          `Resource query body too short: ${body.length} bytes (expected >= 27)`
        );
        return null;
      }

      let offset = 0;

      // Response serial number
      const responseSerial = body.readUInt16BE(offset);
      offset += 2;

      // Logical channel number
      const channelNumber = body.readUInt8(offset);
      offset += 1;

      // Audio and video resource type
      const resourceType = body.readUInt8(offset);
      offset += 1;

      // Stream type
      const streamType = body.readUInt8(offset);
      offset += 1;

      // Memory type
      const memoryType = body.readUInt8(offset);
      offset += 1;

      // Start time (BCD[6])
      const startTime = this.parseBCDTime(body.slice(offset, offset + 6));
      offset += 6;

      // End time (BCD[6])
      const endTime = this.parseBCDTime(body.slice(offset, offset + 6));
      offset += 6;

      // Alarm sign (64 bits = 8 bytes) - ULV protocol specification
      const alarmSign = body.slice(offset, offset + 8);
      offset += 8;

      return {
        responseSerial,
        channelNumber,
        resourceType,
        streamType,
        memoryType,
        startTime,
        endTime,
        alarmSign: alarmSign.toString("hex"), // Convert to hex string for logging
      };
    } catch (error) {
      logger.error(`Error parsing resource query: ${error.message}`);
      return null;
    }
  }

  /**
   * Parse Resource Query Response (0x1205) message body
   */
  parseResourceQueryResponse(body) {
    try {
      if (body.length < 6) {
        logger.warn(
          `Resource query response body too short: ${body.length} bytes (expected >= 6 for header)`
        );
        return null;
      }

      let offset = 0;

      // Response serial number (WORD = 2 bytes)
      const responseSerial = body.readUInt16BE(offset);
      offset += 2;

      // Total number of resources (DWORD = 4 bytes) - ULV protocol specification
      const totalResources = body.readUInt32BE(offset);
      offset += 4;

      // Resource list
      const resourceList = [];

      // Parse each resource item according to ULV protocol Table 3.14.3
      while (offset < body.length && resourceList.length < totalResources) {
        if (offset + 28 > body.length) break; // Minimum size for resource item (28 bytes)

        const resource = {
          channelNumber: body.readUInt8(offset), // Start byte 0: Channel number (BYTE)
          startTime: this.parseBCDTime(body.slice(offset + 1, offset + 7)), // Start byte 1: Start time (BCD[6])
          endTime: this.parseBCDTime(body.slice(offset + 7, offset + 13)), // Start byte 7: End time (BCD[6])
          alarmSign: body.slice(offset + 13, offset + 21).toString("hex"), // Start byte 13: Alarm sign (64 bits)
          resourceType: body.readUInt8(offset + 21), // Start byte 21: Resource type (BYTE)
          streamType: body.readUInt8(offset + 22), // Start byte 22: Stream type (BYTE)
          memoryType: body.readUInt8(offset + 23), // Start byte 23: Memory type (BYTE)
          fileSize: body.readUInt32BE(offset + 24), // Start byte 24: File size (DWORD)
        };

        resourceList.push(resource);
        offset += 28; // Size of each resource item according to ULV spec
      }

      return {
        responseSerial,
        totalResources,
        resourceList,
      };
    } catch (error) {
      logger.error(`Error parsing resource query response: ${error.message}`);
      return null;
    }
  }

  /**
   * Parse File Upload Instructions (0x9206) message body
   */
  parseFileUploadInstructions(body) {
    try {
      if (body.length < 31) {
        logger.warn(
          `File upload instructions body too short: ${body.length} bytes`
        );
        return null;
      }

      let offset = 0;

      // Server address length
      const serverAddressLength = body.readUInt8(offset);
      offset += 1;

      // Server address
      const serverAddress = body
        .slice(offset, offset + serverAddressLength)
        .toString("utf8");
      offset += serverAddressLength;

      // Port
      const port = body.readUInt16BE(offset);
      offset += 2;

      // Username length
      const usernameLength = body.readUInt8(offset);
      offset += 1;

      // Username
      const username = body
        .slice(offset, offset + usernameLength)
        .toString("utf8");
      offset += usernameLength;

      // Password length
      const passwordLength = body.readUInt8(offset);
      offset += 1;

      // Password
      const password = body
        .slice(offset, offset + passwordLength)
        .toString("utf8");
      offset += passwordLength;

      // File upload path length
      const uploadPathLength = body.readUInt8(offset);
      offset += 1;

      // File upload path
      const uploadPath = body
        .slice(offset, offset + uploadPathLength)
        .toString("utf8");
      offset += uploadPathLength;

      // Logical channel number
      const channelNumber = body.readUInt8(offset);
      offset += 1;

      // Start time (BCD[6])
      const startTime = this.parseBCDTime(body.slice(offset, offset + 6));
      offset += 6;

      // End time (BCD[6])
      const endTime = this.parseBCDTime(body.slice(offset, offset + 6));
      offset += 6;

      // Alarm sign (64 bits, not used temporarily)
      const alarmSign = body.slice(offset, offset + 8);
      offset += 8;

      // Audio and video resource type
      const resourceType = body.readUInt8(offset);
      offset += 1;

      // Stream type
      const streamType = body.readUInt8(offset);
      offset += 1;

      // Storage location
      const storageLocation = body.readUInt8(offset);
      offset += 1;

      // Task execution conditions
      const conditions = body.readUInt8(offset);
      const wifiEnabled = (conditions & 0x01) !== 0;
      const lanEnabled = (conditions & 0x02) !== 0;
      const mobileEnabled = (conditions & 0x04) !== 0;

      return {
        serverAddress,
        port,
        username,
        password,
        uploadPath,
        channelNumber,
        startTime,
        endTime,
        alarmSign,
        resourceType,
        streamType,
        storageLocation,
        wifiEnabled,
        lanEnabled,
        mobileEnabled,
      };
    } catch (error) {
      logger.error(`Error parsing file upload instructions: ${error.message}`);
      return null;
    }
  }

  /**
   * Parse File Upload Completion (0x1206) message body
   */
  parseFileUploadCompletion(body) {
    try {
      if (body.length < 3) {
        logger.warn(
          `File upload completion body too short: ${body.length} bytes`
        );
        return null;
      }

      const responseSerial = body.readUInt16BE(0);
      const result = body.readUInt8(2);

      return {
        responseSerial,
        result,
      };
    } catch (error) {
      logger.error(`Error parsing file upload completion: ${error.message}`);
      return null;
    }
  }

  /**
   * Parse File Upload Control (0x9207) message body
   */
  parseFileUploadControl(body) {
    try {
      if (body.length < 3) {
        logger.warn(`File upload control body too short: ${body.length} bytes`);
        return null;
      }

      const responseSerial = body.readUInt16BE(0);
      const uploadControl = body.readUInt8(2);

      return {
        responseSerial,
        uploadControl,
      };
    } catch (error) {
      logger.error(`Error parsing file upload control: ${error.message}`);
      return null;
    }
  }

  /**
   * Parse Terminal Control (0x8105) message body
   */
  parseTerminalControl(body) {
    try {
      if (body.length < 1) {
        logger.warn(`Terminal control body too short: ${body.length} bytes`);
        return null;
      }

      const command = body.readUInt8(0);

      return {
        command,
      };
    } catch (error) {
      logger.error(`Error parsing terminal control: ${error.message}`);
      return null;
    }
  }

  /**
   * Parse BCD time format (YY-MM-DD-HH-MM-SS)
   */
  parseBCDTime(bcdBuffer) {
    try {
      const year = 2000 + ((bcdBuffer[0] >> 4) * 10 + (bcdBuffer[0] & 0x0f));
      const month = (bcdBuffer[1] >> 4) * 10 + (bcdBuffer[1] & 0x0f);
      const day = (bcdBuffer[2] >> 4) * 10 + (bcdBuffer[2] & 0x0f);
      const hour = (bcdBuffer[3] >> 4) * 10 + (bcdBuffer[3] & 0x0f);
      const minute = (bcdBuffer[4] >> 4) * 10 + (bcdBuffer[4] & 0x0f);
      const second = (bcdBuffer[5] >> 4) * 10 + (bcdBuffer[5] & 0x0f);

      return `${year}-${month.toString().padStart(2, "0")}-${day
        .toString()
        .padStart(2, "0")} ${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}:${second.toString().padStart(2, "0")}`;
    } catch (error) {
      logger.error(`Error parsing BCD time: ${error.message}`);
      return "2000-00-00 00:00:00";
    }
  }

  // ============================================================================
  // Platform Message Sending Methods for New Protocol
  // ============================================================================

  /**
   * Send Resource Query (0x9205) to terminal
   */
  sendResourceQuery(
    terminalId,
    channelNumber = 1,
    resourceType = 0,
    streamType = 0,
    memoryType = 0,
    startTime = null,
    endTime = null,
    alarmSign = 0
  ) {
    logger.info(`sendResourceQuery called with terminalId: ${terminalId}`);

    const connection = this.findConnectionByTerminalId(terminalId);
    if (!connection) {
      logger.error(`Terminal ${terminalId} not found for resource query`);
      return false;
    }

    try {
      // Create message body according to ULV protocol
      const body = this.createResourceQueryBody(
        channelNumber,
        resourceType,
        streamType,
        memoryType,
        startTime,
        endTime,
        alarmSign
      );

      // Send message
      return this.sendMessage(connection, 0x9205, body);
    } catch (error) {
      logger.error(`Error sending resource query: ${error.message}`);
      return false;
    }
  }

  /**
   * Send File Upload Instructions (0x9206) to terminal
   */
  sendFileUploadInstructions(
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
    mobileEnabled
  ) {
    try {
      const connection = this.findConnectionByTerminalId(terminalId);
      if (!connection) {
        logger.error(
          `Terminal ${terminalId} not found for file upload instructions`
        );
        return false;
      }

      // Convert ISO time strings to BCD format
      const startBCD = this.isoTimeToBCD(startTime);
      const endBCD = this.isoTimeToBCD(endTime);

      // Build message body according to Table 3.21.1
      const body = Buffer.concat([
        Buffer.from([ftpServer.length]), // Server address length
        Buffer.from(ftpServer, "utf8"), // Server address
        Buffer.alloc(2), // Port (2 bytes)
        Buffer.from([username.length]), // Username length
        Buffer.from(username, "utf8"), // Username
        Buffer.from([password.length]), // Password length
        Buffer.from(password, "utf8"), // Password
        Buffer.from([uploadPath.length]), // File upload path length
        Buffer.from(uploadPath, "utf8"), // File upload path
        Buffer.from([channelNumber]), // Logical channel number
        startBCD, // Start time (BCD[6])
        endBCD, // End time (BCD[6])
        Buffer.alloc(8, 0), // Alarm sign (64 bits, not used)
        Buffer.from([resourceType]), // Audio and video resource type
        Buffer.from([streamType]), // Stream type
        Buffer.from([storageLocation]), // Storage location
        Buffer.from([
          (wifiEnabled ? 0x01 : 0) |
            (lanEnabled ? 0x02 : 0) |
            (mobileEnabled ? 0x04 : 0),
        ]), // Task execution conditions
      ]);

      // Set port in the correct position
      body.writeUInt16BE(ftpPort, ftpServer.length + 1);

      const success = this.sendMessageToTerminal(connection, 0x9206, body);

      if (success) {
        logger.info(
          `📁 File Upload Instructions sent to terminal ${terminalId}`
        );
        logger.info(`  FTP Server: ${ftpServer}:${ftpPort}`);
        logger.info(`  Username: ${username}`);
        logger.info(`  Path: ${uploadPath}`);
        logger.info(`  Channel: ${channelNumber}`);
        logger.info(`  Time Range: ${startTime} to ${endTime}`);
      }

      return success;
    } catch (error) {
      logger.error(`Error sending file upload instructions: ${error.message}`);
      return false;
    }
  }

  /**
   * Send File Upload Control (0x9207) to terminal
   */
  sendFileUploadControl(terminalId, uploadControl, responseSerial) {
    try {
      const connection = this.findConnectionByTerminalId(terminalId);
      if (!connection) {
        logger.error(
          `Terminal ${terminalId} not found for file upload control`
        );
        return false;
      }

      // Build message body according to Table 3.23.1
      const body = Buffer.concat([
        Buffer.alloc(2), // Response serial number (2 bytes)
        Buffer.from([uploadControl]), // Upload control (1 byte)
      ]);

      // Set response serial number
      body.writeUInt16BE(responseSerial, 0);

      const success = this.sendMessageToTerminal(connection, 0x9207, body);

      if (success) {
        const actionMap = { 0: "Pause", 1: "Continue", 2: "Cancel" };
        logger.info(
          `📁 File Upload Control sent to terminal ${terminalId}: ${
            actionMap[uploadControl] || "Unknown"
          }`
        );
        logger.info(`  Response Serial: ${responseSerial}`);
        logger.info(`  Action: ${actionMap[uploadControl] || "Unknown"}`);
      }

      return success;
    } catch (error) {
      logger.error(`Error sending file upload control: ${error.message}`);
      return false;
    }
  }

  /**
   * Send Terminal Control (0x8105) to terminal
   */
  sendTerminalControl(terminalId, command) {
    try {
      const connection = this.findConnectionByTerminalId(terminalId);
      if (!connection) {
        logger.error(`Terminal ${terminalId} not found for terminal control`);
        return false;
      }

      // Build message body according to Table 3.20
      const body = Buffer.from([command]);

      const success = this.sendMessageToTerminal(connection, 0x8105, body);

      if (success) {
        const commandMap = {
          0x70: "Disconnect Oil",
          0x71: "Recovery Oil",
          0x72: "Disconnect Circuit",
          0x73: "Recovery Circuit",
          0x74: "Restart Device",
        };
        logger.info(
          `🎮 Terminal Control sent to terminal ${terminalId}: ${
            commandMap[command] || "Unknown"
          }`
        );
        logger.info(
          `  Command: 0x${command.toString(16)} - ${
            commandMap[command] || "Unknown"
          }`
        );
      }

      return success;
    } catch (error) {
      logger.error(`Error sending terminal control: ${error.message}`);
      return false;
    }
  }

  /**
   * Helper method to find connection by terminal ID
   */
  findConnectionByTerminalId(terminalId) {
    for (const [connectionId, connection] of this.connections.entries()) {
      if (connection.terminalId === terminalId) {
        return connection;
      }
    }
    return null;
  }

  /**
   * Helper method to send message to terminal
   */
  sendMessageToTerminal(connection, messageId, body) {
    try {
      // Debug logging to see what we're receiving
      logger.debug(`SEND MESSAGE DEBUG - Input Parameters:`);
      logger.debug(
        `   Connection: ${typeof connection}, Terminal ID: ${
          connection?.terminalId
        }`
      );
      logger.debug(`   Message ID: 0x${messageId.toString(16).toUpperCase()}`);
      logger.debug(
        `   Body: ${typeof body}, Length: ${
          body?.length
        }, Content: ${body?.toString("hex")}`
      );

      // Build message header according to JT808-2019 standard
      const messageIdBuffer = Buffer.alloc(2);
      messageIdBuffer.writeUInt16BE(messageId, 0);

      // Properties: Version ID (bit 14) = 1, body length
      const properties = Buffer.alloc(2);
      properties.writeUInt16BE(0x4000 | body.length, 0);

      const protocolVersion = Buffer.alloc(1);
      protocolVersion.writeUInt8(1, 0);

      // Terminal phone number in BCD format (6 bytes) - CRITICAL FIX
      const bcdPhone = Buffer.alloc(6);
      if (connection.terminalId) {
        // Convert terminal ID to BCD format
        const phoneNumber = connection.terminalId.padStart(12, "0");
        for (let i = 0; i < 6; i++) {
          const digit1 = parseInt(phoneNumber[i * 2], 10);
          const digit2 = parseInt(phoneNumber[i * 2 + 1], 10);
          bcdPhone[i] = (digit1 << 4) | digit2;
        }
      }

      const messageSerialNumber = Buffer.alloc(2);
      messageSerialNumber.writeUInt16BE(this.generateSerialNumber(), 0);

      // Build header (15 bytes total for JT808-2019)
      const header = Buffer.concat([
        messageIdBuffer, // 2 bytes
        properties, // 2 bytes
        protocolVersion, // 1 byte
        bcdPhone, // 6 bytes
        messageSerialNumber, // 2 bytes
      ]);

      // Build complete message
      const message = Buffer.concat([header, body]);

      // Calculate checksum
      let checksum = 0;
      for (let i = 0; i < message.length; i++) {
        checksum ^= message[i];
      }

      const checksumBuffer = Buffer.alloc(1);
      checksumBuffer.writeUInt8(checksum, 0);

      const completeMessage = Buffer.concat([message, checksumBuffer]);

      // Wrap with 0x7E markers and apply escape processing
      const wrappedMessage = Buffer.alloc(completeMessage.length + 2);
      wrappedMessage.writeUInt8(0x7e, 0);
      completeMessage.copy(wrappedMessage, 1);
      wrappedMessage.writeUInt8(0x7e, wrappedMessage.length - 1);

      // Apply escape processing for 0x7E and 0x7D in message content
      const escapedMessage = this.applyEscapeProcessing(wrappedMessage);

      // Send to terminal with enhanced logging
      logger.debug(`SEND MESSAGE DEBUG:`);
      logger.debug(`   Message ID: 0x${messageId.toString(16).toUpperCase()}`);
      logger.debug(`   Body length: ${body.length} bytes`);
      logger.debug(`   Terminal ID: ${connection.terminalId}`);
      logger.debug(
        `   Socket valid: ${connection.socket && !connection.socket.destroyed}`
      );
      logger.debug(`   Final message: ${escapedMessage.toString("hex")}`);

      const writeResult = connection.socket.write(escapedMessage);
      logger.debug(`Socket write result: ${writeResult}`);

      if (writeResult) {
        logger.debug(`Message sent successfully`);
        logger.debug(
          `Sent message to terminal ${
            connection.terminalId || "unknown"
          }: 0x${messageId.toString(16)}, ${body.length} bytes`
        );
        logger.debug(`Raw message: ${escapedMessage.toString("hex")}`);
        return true;
      } else {
        logger.warn(`Socket write failed - buffer full or socket closed`);
        logger.error(
          `Socket write failed for terminal ${connection.terminalId}`
        );
        return false;
      }
    } catch (error) {
      logger.error(`Error sending message to terminal: ${error.message}`);
      return false;
    }
  }

  /**
   * Convert ISO time string to BCD format (YY-MM-DD-HH-MM-SS)
   */
  isoTimeToBCD(isoTimeString) {
    try {
      const date = new Date(isoTimeString);
      const year = date.getFullYear() - 2000; // Convert to YY format
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const hour = date.getHours();
      const minute = date.getMinutes();
      const second = date.getSeconds();

      const bcdBuffer = Buffer.alloc(6);
      bcdBuffer[0] = (Math.floor(year / 10) << 4) | year % 10;
      bcdBuffer[1] = (Math.floor(month / 10) << 4) | month % 10;
      bcdBuffer[2] = (Math.floor(day / 10) << 4) | day % 10;
      bcdBuffer[3] = (Math.floor(hour / 10) << 4) | hour % 10;
      bcdBuffer[4] = (Math.floor(minute / 10) << 4) | minute % 10;
      bcdBuffer[5] = (Math.floor(second / 10) << 4) | second % 10;

      return bcdBuffer;
    } catch (error) {
      logger.error(`Error converting ISO time to BCD: ${error.message}`);
      return Buffer.alloc(6, 0);
    }
  }

  parseDeviceDataReport(messageBody) {
    if (messageBody.length < 28) {
      throw new Error(
        `Device data report too short: ${messageBody.length} bytes`
      );
    }

    // Parse basic location data (similar to location report)
    const locationData = this.parseLocationData(messageBody);

    // Parse additional information items if present
    let additionalInfoItems = [];
    if (messageBody.length > 28) {
      try {
        additionalInfoItems = this.parseAdditionalInfoItems(
          messageBody.slice(28)
        );
      } catch (error) {
        logger.warn(`Error parsing additional info items: ${error.message}`);
      }
    }

    return {
      ...locationData,
      additionalInfoItems,
    };
  }

  // Parse data transparent transmission message body according to Table 3.10.1
  parseDataTransparentTransmission(messageBody) {
    if (messageBody.length < 1) {
      throw new Error(
        `Transparent transmission message too short: ${messageBody.length} bytes`
      );
    }

    const messageType = messageBody.readUInt8(0);
    const data = messageBody.slice(1);

    // Get message type name
    let messageTypeName = "Unknown";
    switch (messageType) {
      case 0xf0:
        messageTypeName = "GPS Transparent Transmission";
        break;
      case 0xf1:
        messageTypeName = "GPS Data Transmission";
        break;
      case 0x41:
        messageTypeName = "OBD Data Transmission";
        break;
      case 0xa1:
        messageTypeName = "CMS Private, WiFi Information";
        break;
      case 0xf3:
        messageTypeName = "ULV Transparent Data";
        break;
      default:
        if (messageType >= 0xf0 && messageType <= 0xff) {
          messageTypeName = "User-defined Transparent Message";
        }
    }

    return {
      messageType,
      messageTypeName,
      data,
    };
  }

  // Handle GPS transparent transmission (0xF0)
  handleGPSTransparentTransmission(data, connection) {
    logger.info(
      `GPS Transparent Transmission from terminal ${connection.terminalId}`
    );

    try {
      if (data.length < 35) {
        logger.warn(`GPS transparent data too short: ${data.length} bytes`);
        return;
      }

      const transmissionType = data.readUInt8(0);
      const alarmFlag = data.readUInt32BE(1);
      const status = data.readUInt32BE(5);
      const latitude = data.readUInt32BE(9) / 1000000; // Convert from millionths
      const longitude = data.readUInt32BE(13) / 1000000; // Convert from millionths
      const height = data.readUInt16BE(17);
      const speed = data.readUInt16BE(19) / 10; // Convert from 0.1 km/h
      const direction = data.readUInt16BE(21);
      const time = this.parseBCDTime(data.slice(23, 29));
      const mileage = data.readUInt32BE(29) / 10; // Convert from 0.1 km
      const fuelSensorStatus = data.readUInt8(33);
      const deviceDifferences = data.readUInt8(34);

      logger.info(`GPS Transparent Data:`);
      logger.info(
        `  Type: ${transmissionType} (${this.getTransmissionTypeName(
          transmissionType
        )})`
      );
      logger.info(`  Location: ${latitude}, ${longitude}`);
      logger.info(`  Speed: ${speed} km/h, Direction: ${direction}°`);
      logger.info(`  Height: ${height}m, Mileage: ${mileage} km`);
      logger.info(`  Time: ${time}`);
      logger.info(
        `  Fuel Sensors: ${this.parseFuelSensorStatus(fuelSensorStatus)}`
      );
    } catch (error) {
      logger.error(`Error parsing GPS transparent data: ${error.message}`);
    }
  }

  // Handle GPS data transmission (0xF1)
  handleGPSDataTransmission(data, connection) {
    logger.info(`GPS Data Transmission from terminal ${connection.terminalId}`);

    try {
      if (data.length < 35) {
        logger.warn(`GPS data transmission too short: ${data.length} bytes`);
        return;
      }

      // Similar structure to GPS transparent transmission
      this.handleGPSTransparentTransmission(data, connection);
    } catch (error) {
      logger.error(`Error parsing GPS data transmission: ${error.message}`);
    }
  }

  // Handle OBD data transmission (0x41)
  handleOBDDataTransmission(data, connection) {
    logger.info(`OBD Data Transmission from terminal ${connection.terminalId}`);

    try {
      const obdString = data.toString("utf8").trim();

      if (obdString.startsWith("$OBD-RT:")) {
        const obdData = obdString.substring(8).split(",");

        logger.info(`OBD Data:`);
        logger.info(`  Battery Voltage: ${obdData[0]} V`);
        logger.info(`  Engine Speed: ${obdData[1]} rpm`);
        logger.info(`  Vehicle Speed: ${obdData[2]} km/h`);
        logger.info(`  Throttle: ${obdData[3]}%`);
        logger.info(`  Engine Load: ${obdData[4]}%`);
        logger.info(`  Coolant Temp: ${obdData[5]}°C`);
        logger.info(`  Instant Fuel: ${obdData[6]} L/h`);
        logger.info(`  Avg Fuel: ${obdData[7]} L/100km`);
        logger.info(`  Driving Distance: ${obdData[8]} km`);
        logger.info(`  Total Mileage: ${obdData[9]} km`);
        logger.info(`  Fuel Consumption: ${obdData[10]} L`);
        logger.info(`  Cumulative Fuel: ${obdData[11]} L`);
        logger.info(`  Fault Codes: ${obdData[12]}`);
        logger.info(`  Rapid Accel: ${obdData[13]} times`);
        logger.info(`  Rapid Decel: ${obdData[14]} times`);
      } else {
        logger.warn(`Invalid OBD data format: ${obdString}`);
      }
    } catch (error) {
      logger.error(`Error parsing OBD data: ${error.message}`);
    }
  }

  // Handle CMS Private data (0xA1)
  handleCMSPrivateData(data, connection) {
    logger.info(`CMS Private Data from terminal ${connection.terminalId}`);

    try {
      if (data.length < 3) {
        logger.warn(`CMS private data too short: ${data.length} bytes`);
        return;
      }

      const network = data.readUInt8(0);
      const networkNameLength = data.readUInt8(1);
      const networkName = data.slice(2, 2 + networkNameLength).toString("utf8");
      const manufacturerType = data.readUInt8(2 + networkNameLength);
      const audioType = data.readUInt8(2 + networkNameLength + 1);
      const diskType = data.readUInt8(2 + networkNameLength + 2);

      logger.info(`CMS Private Data:`);
      logger.info(`  Network: ${this.getNetworkTypeName(network)}`);
      logger.info(`  Network Name: ${networkName}`);
      logger.info(`  Manufacturer Type: ${manufacturerType}`);
      logger.info(`  Audio Type: ${this.getAudioTypeName(audioType)}`);
      logger.info(`  Disk Type: ${this.getDiskTypeName(diskType)}`);
    } catch (error) {
      logger.error(`Error parsing CMS private data: ${error.message}`);
    }
  }

  // Handle ULV transparent data (0xF3)
  handleULVTransparentData(data, connection) {
    logger.info(`ULV Transparent Data from terminal ${connection.terminalId}`);

    try {
      if (data.length < 3) {
        logger.warn(`ULV transparent data too short: ${data.length} bytes`);
        return;
      }

      const ulvMessageType = data.readUInt8(0);
      const dataType = data.readUInt8(1);
      const customerId = data.readUInt8(2);
      const ulvData = data.slice(3);

      logger.info(`ULV Transparent Data:`);
      logger.info(
        `  ULV Message Type: 0x${ulvMessageType.toString(16)} (fixed 0xF3)`
      );
      logger.info(
        `  Data Type: ${dataType} (${this.getULVDataTypeName(dataType)})`
      );
      logger.info(
        `  Customer ID: ${customerId} (${this.getCustomerIdName(customerId)})`
      );

      if (dataType === 0) {
        this.handleULVVehicleInformation(ulvData, connection);
      } else {
        logger.info(`ULV data type ${dataType} - keeping for future use`);
      }
    } catch (error) {
      logger.error(`Error parsing ULV transparent data: ${error.message}`);
    }
  }

  // Handle ULV vehicle information
  handleULVVehicleInformation(data, connection) {
    logger.info(
      `ULV Vehicle Information from terminal ${connection.terminalId}`
    );

    try {
      if (data.length < 25) {
        logger.warn(`ULV vehicle information too short: ${data.length} bytes`);
        return;
      }

      const dataType = data.readUInt8(0);
      const alarmFlag = data.readUInt32BE(1);
      const status = data.readUInt32BE(5);
      const latitude = data.readUInt32BE(9) / 1000000; // Convert from millionths
      const longitude = data.readUInt32BE(13) / 1000000; // Convert from millionths
      const latDirection = data.readUInt8(17) === 0x4e ? "N" : "S"; // 0x4E = 'N', 0x53 = 'S'
      const lonDirection = data.readUInt8(18) === 0x45 ? "E" : "W"; // 0x45 = 'E', 0x57 = 'W'
      const height = data.readUInt16BE(19);
      const speed = data.readUInt16BE(21) / 10; // Convert from 0.1 km/h
      const direction = data.readUInt16BE(23);
      const time = this.parseBCDTime(data.slice(25, 31));

      // Parse additional fields if present
      let mileage = null;
      let numSatellites = null;
      let additionalInfoItems = [];

      if (data.length >= 36) {
        mileage = data.readUInt32BE(31) / 10; // Convert from 0.1 km
      }

      if (data.length >= 37) {
        numSatellites = data.readUInt8(35);
      }

      // Parse additional information items if present
      if (data.length > 36) {
        try {
          additionalInfoItems = this.parseAdditionalInfoItems(data.slice(36));
        } catch (error) {
          logger.warn(
            `Error parsing ULV additional info items: ${error.message}`
          );
        }
      }

      logger.info(`ULV Vehicle Information:`);
      logger.info(
        `  Data Type: ${dataType} (${this.getULVDataSubTypeName(dataType)})`
      );
      logger.info(
        `  Location: ${latDirection}${latitude}, ${lonDirection}${longitude}`
      );
      logger.info(`  Speed: ${speed} km/h, Direction: ${direction}°`);
      logger.info(`  Height: ${height}m`);
      logger.info(`  Time: ${time}`);
      logger.info(`  Alarm Flag: 0x${alarmFlag.toString(16)}`);
      logger.info(`  Status: 0x${status.toString(16)}`);

      if (mileage !== null) {
        logger.info(`  Mileage: ${mileage} km`);
      }

      if (numSatellites !== null) {
        logger.info(`  GNSS Satellites: ${numSatellites}`);
      }

      // Log additional information items in a meaningful way
      if (additionalInfoItems.length > 0) {
        logger.info(`  Additional Information Items:`);
        additionalInfoItems.forEach((item, index) => {
          if (item.parsed && item.parsed.type !== "Unknown") {
            logger.info(
              `    ${index + 1}. ${item.parsed.type}: ${JSON.stringify(
                item.parsed
              )}`
            );
          } else {
            logger.info(
              `    ${index + 1}. ID: 0x${item.id.toString(16)}, Length: ${
                item.length
              }`
            );
          }
        });
      }
    } catch (error) {
      logger.error(`Error parsing ULV vehicle information: ${error.message}`);
    }
  }

  // Handle user-defined transparent data
  handleUserDefinedTransparentData(data, connection, messageType) {
    logger.info(
      `User-defined Transparent Data (0x${messageType.toString(
        16
      )}) from terminal ${connection.terminalId}`
    );
    logger.debug(`User-defined data length: ${data.length} bytes`);

    // Log the raw data for analysis
    logger.debug(`Raw user-defined data: ${data.toString("hex")}`);
  }

  // Helper methods for parsing transparent data
  getTransmissionTypeName(type) {
    switch (type) {
      case 0:
        return "Real-time upload of ordinary data";
      case 1:
        return "Ordinary data supplementary transmission";
      case 2:
        return "Real-time upload of alarm data";
      case 3:
        return "Supplementary transmission of alarm data";
      default:
        return "Unknown";
    }
  }

  getULVDataTypeName(type) {
    switch (type) {
      case 0:
        return "Vehicle information";
      default:
        return "Keep (reserved)";
    }
  }

  getULVDataSubTypeName(type) {
    switch (type) {
      case 0:
        return "Real time upload of regular data";
      case 1:
        return "Ordinary data supplementary transmission";
      case 2:
        return "Real time upload of alarm data";
      case 3:
        return "Alarm data supplementary transmission";
      default:
        return "Unknown";
    }
  }

  getCustomerIdName(id) {
    switch (id) {
      case 0:
        return "Standard universal";
      default:
        return "Customized by customer";
    }
  }

  // Enhanced helper methods for ULV additional info items
  getULVAdditionalInfoTypeName(infoId) {
    switch (infoId) {
      case 0x00:
        return "Driver Information";
      case 0x01:
        return "Historical Speed";
      case 0x02:
        return "Oil Volume";
      case 0x03:
        return "Temperature and Humidity";
      case 0x04:
        return "Network Information";
      case 0x05:
        return "Video Status";
      case 0x06:
        return "IO Input Status";
      case 0x07:
        return "Disk Status";
      case 0x17:
        return "Memory Fault Alarm";
      case 0x18:
        return "Abnormal Driving";
      case 0x19:
        return "Extended Vehicle Signal Status";
      case 0x2a:
        return "IO Status";
      case 0x30:
        return "Signal Strength";
      case 0x31:
        return "GNSS Stars";
      case 0x3f:
        return "Reserved Field";
      default:
        return `Unknown (0x${infoId.toString(16)})`;
    }
  }

  getNetworkTypeName(type) {
    switch (type) {
      case 0:
        return "Wired";
      case 1:
        return "WiFi";
      case 2:
        return "3G/4G";
      default:
        return "Unknown";
    }
  }

  getAudioTypeName(type) {
    switch (type) {
      case 10:
        return "G711A";
      case 12:
        return "AAC_8K";
      default:
        return "Unknown";
    }
  }

  getDiskTypeName(type) {
    switch (type) {
      case 0:
        return "Invalid";
      case 1:
        return "SD card";
      case 2:
        return "Hard disk";
      case 3:
        return "SSD";
      default:
        return "Unknown";
    }
  }

  parseFuelSensorStatus(status) {
    const sensors = [];
    if (status & 0x01) sensors.push("fuel-LIGO");
    if (status & 0x02) sensors.push("fuel-LIGO-EUP");
    if (status & 0x04) sensors.push("fuel-UL212-EUP");
    return sensors.length > 0 ? sensors.join(", ") : "No sensors connected";
  }

  parseBCDTime(timeBuffer) {
    if (timeBuffer.length < 6) return "Invalid time";

    const year = 2000 + ((timeBuffer[0] >> 4) * 10 + (timeBuffer[0] & 0x0f));
    const month = (timeBuffer[1] >> 4) * 10 + (timeBuffer[1] & 0x0f);
    const day = (timeBuffer[2] >> 4) * 10 + (timeBuffer[2] & 0x0f);
    const hour = (timeBuffer[3] >> 4) * 10 + (timeBuffer[3] & 0x0f);
    const minute = (timeBuffer[4] >> 4) * 10 + (timeBuffer[4] & 0x0f);
    const second = (timeBuffer[5] >> 4) * 10 + (timeBuffer[5] & 0x0f);

    return `${year}-${month.toString().padStart(2, "0")}-${day
      .toString()
      .padStart(2, "0")} ${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}:${second.toString().padStart(2, "0")}`;
  }

  // Parse additional information items for device data reports (ULV protocol Table 3.10.11)
  parseAdditionalInfoItems(data) {
    const items = [];
    let offset = 0;

    while (offset < data.length && offset + 2 <= data.length) {
      const infoId = data.readUInt8(offset);
      offset += 1;
      const infoLength = data.readUInt8(offset);
      offset += 1;

      if (offset + infoLength > data.length) {
        logger.warn(
          `Additional info item ${infoId} length ${infoLength} exceeds remaining data`
        );
        break;
      }

      const infoData = data.slice(offset, offset + infoLength);
      offset += infoLength;

      let itemInfo = {
        id: infoId,
        length: infoLength,
        data: infoData,
      };

      // Parse according to ULV Protocol Table 3.10.11
      switch (infoId) {
        case 0x00: // Driver information (Table 3.10.12)
          if (infoLength >= 61) {
            itemInfo.parsed = {
              type: "Driver Information",
              driverName: infoData
                .slice(0, 32)
                .toString("utf8")
                .replace(/\0/g, ""),
              licenseNumber: infoData
                .slice(32, 56)
                .toString("utf8")
                .replace(/\0/g, ""),
              loginStatus: infoData.readUInt8(56),
              continuousDrivingTime: infoData.readUInt32BE(57),
            };
          }
          break;

        case 0x01: // Historical speed (Table 3.10.13)
          if (infoLength >= 1) {
            const numSpeeds = infoData.readUInt8(0);
            const speeds = [];
            for (let i = 0; i < numSpeeds && i + 1 < infoLength; i++) {
              speeds.push(infoData.readUInt8(i + 1));
            }
            itemInfo.parsed = {
              type: "Historical Speed",
              numSpeeds: numSpeeds,
              speeds: speeds,
            };
          }
          break;

        case 0x02: // Oil volume (Table 3.10.14)
          if (infoLength >= 9) {
            const fuelValues = [];
            for (let i = 0; i < 4; i++) {
              fuelValues.push(infoData.readUInt16BE(1 + i * 2));
            }
            itemInfo.parsed = {
              type: "Oil Volume",
              sensorType: infoData.readUInt8(0),
              fuelValues: fuelValues,
            };
          }
          break;

        case 0x03: // Temperature and humidity (Table 3.10.15)
          if (infoLength >= 16) {
            const temps = [];
            const humidities = [];
            for (let i = 0; i < 4; i++) {
              temps.push(infoData.readInt16BE(i * 2) / 10);
              humidities.push(infoData.readUInt16BE(8 + i * 2));
            }
            itemInfo.parsed = {
              type: "Temperature and Humidity",
              temperatures: temps,
              humidities: humidities,
            };
          }
          break;

        case 0x04: // Network information (Table 3.10.16)
          if (infoLength >= 2) {
            itemInfo.parsed = {
              type: "Network Information",
              connectionMethod: infoData.readUInt8(0),
              signalValue: infoData.readUInt8(1),
            };
          }
          break;

        case 0x05: // Video status (Table 3.10.17)
          if (infoLength >= 8) {
            itemInfo.parsed = {
              type: "Video Status",
              videoLossStatus: infoData.readUInt32BE(0),
              recordingStatus: infoData.readUInt32BE(4),
            };
          }
          break;

        case 0x06: // IO input status (Table 3.10.18)
          if (infoLength >= 1) {
            itemInfo.parsed = {
              type: "IO Input Status",
              ioStatus: infoData.readUInt8(0),
            };
          }
          break;

        case 0x07: // Disk status (Table 3.10.19)
          if (infoLength >= 34) {
            const hddCapacities = [];
            const hddRemaining = [];
            const sdCapacities = [];
            const sdRemaining = [];

            for (let i = 0; i < 2; i++) {
              hddCapacities.push(infoData.readUInt32BE(1 + i * 4));
              hddRemaining.push(infoData.readUInt32BE(9 + i * 4));
              sdCapacities.push(infoData.readUInt32BE(18 + i * 4));
              sdRemaining.push(infoData.readUInt32BE(26 + i * 4));
            }

            itemInfo.parsed = {
              type: "Disk Status",
              numHardDrives: infoData.readUInt8(0),
              hddTotalCapacities: hddCapacities,
              hddRemainingCapacities: hddRemaining,
              numSDCards: infoData.readUInt8(17),
              sdTotalCapacities: sdCapacities,
              sdRemainingCapacities: sdRemaining,
            };
          }
          break;

        case 0x17: // Memory fault alarm
          if (infoLength >= 2) {
            itemInfo.parsed = {
              type: "Memory Fault Alarm",
              value: infoData.readUInt16BE(0),
            };
          }
          break;

        case 0x18: // Abnormal driving
          if (infoLength >= 5) {
            itemInfo.parsed = {
              type: "Abnormal Driving",
              motionDetection: infoData.readUInt8(4) & (1 << 2) ? "YES" : "NO",
            };
          }
          break;

        case 0x19: // Extended vehicle signal status
          if (infoLength >= 4) {
            itemInfo.parsed = {
              type: "Extended Vehicle Signal Status",
              value: infoData.readUInt32BE(0),
            };
          }
          break;

        case 0x2a: // IO Status bits
          if (infoLength >= 2) {
            itemInfo.parsed = {
              type: "IO Status",
              value: infoData.readUInt16BE(0),
            };
          }
          break;

        case 0x30: // Wireless communication network signal strength
          if (infoLength >= 1) {
            itemInfo.parsed = {
              type: "Signal Strength",
              value: infoData.readUInt8(0),
            };
          }
          break;

        case 0x31: // Number of GNSS positioning stars
          if (infoLength >= 1) {
            itemInfo.parsed = {
              type: "GNSS Stars",
              value: infoData.readUInt8(0),
            };
          }
          break;

        case 0x3f: // Reserved field (often contains "None" or empty data)
          itemInfo.parsed = {
            type: "Reserved Field",
            value: infoData.toString("utf8").replace(/\0/g, ""),
          };
          break;

        default:
          itemInfo.parsed = {
            type: "Unknown",
            value: `ID: 0x${infoId.toString(16)}, Length: ${infoLength}`,
          };
      }

      items.push(itemInfo);
    }

    return items;
  }

  /**
   * Send multimedia capture command via 0x8105 Terminal Control
   */

  /**
   * Handle terminal control response
   */
  handleTerminalControlResponse(message, connection, connectionId) {
    try {
      logger.info(`📋 Terminal Control Response received from ${connectionId}`);

      // Parse the response body
      const body = message.messageBody;
      if (body.length < 1) {
        logger.warn(
          `Terminal control response body too short: ${body.length} bytes`
        );
        return;
      }

      const commandWord = body.readUInt8(0);
      const commandName = this.getTerminalControlCommandName(commandWord);

      logger.info(`📋 Terminal Control Response Details:`);
      logger.info(
        `  Command Word: 0x${commandWord
          .toString(16)
          .padStart(2, "0")} (${commandName})`
      );
      logger.info(`  Response Status: Success`);

      // Check if this was a multimedia capture command
      if (commandWord >= 0x75 && commandWord <= 0x77) {
        const actionType =
          commandWord === 0x75
            ? "photo"
            : commandWord === 0x76
            ? "video"
            : "audio";
        logger.info(
          `📸 Multimedia capture command (${actionType}) acknowledged by terminal ${
            connection.terminalId || connectionId
          }`
        );
        logger.info(
          `📋 ULV Protocol: Terminal should now capture ${actionType} and send via 0x0800/0x0801`
        );
      }

      logger.info(
        `✅ Terminal Control Response processed for terminal ${
          connection.terminalId || connectionId
        }`
      );
    } catch (error) {
      logger.error(
        `Error handling terminal control response: ${error.message}`
      );
    }
  }

  /**
   * Get human-readable name for ULV additional info type
   */
  getULVAdditionalInfoTypeName(typeId) {
    const typeNames = {
      0x01: "Reserved Field",
      0x02: "Network Information",
      0x03: "Reserved Field",
      0x04: "Reserved Field",
      0x05: "Reserved Field",
      0x06: "Reserved Field",
      0x07: "Reserved Field",
      0x08: "Reserved Field",
      0x09: "Reserved Field",
      0x0a: "Reserved Field",
      0x0b: "Reserved Field",
      0x0c: "Reserved Field",
      0x0d: "Reserved Field",
      0x0e: "Reserved Field",
      0x0f: "Reserved Field",
      0x10: "Reserved Field",
      0x11: "Reserved Field",
      0x12: "Reserved Field",
      0x13: "Reserved Field",
      0x14: "Reserved Field",
      0x15: "Reserved Field",
      0x16: "Reserved Field",
      0x17: "Reserved Field",
      0x18: "Reserved Field",
      0x19: "Reserved Field",
      0x1a: "Reserved Field",
      0x1b: "Reserved Field",
      0x1c: "Reserved Field",
      0x1d: "Reserved Field",
      0x1e: "Reserved Field",
      0x1f: "Reserved Field",
      0x20: "Reserved Field",
    };
    return (
      typeNames[typeId] ||
      `Unknown Type 0x${typeId.toString(16).padStart(2, "0")}`
    );
  }

  /**
   * Get human-readable name for terminal control command word
   */
  getTerminalControlCommandName(commandWord) {
    const commandNames = {
      0x70: "Disconnect Oil",
      0x71: "Recovery Oil",
      0x72: "Disconnect Circuit",
      0x73: "Recovery Circuit",
      0x74: "Restart Device",
      0x75: "Capture Photo",
      0x76: "Capture Video",
      0x77: "Capture Audio",
    };
    return (
      commandNames[commandWord] ||
      `Unknown Command 0x${commandWord.toString(16).padStart(2, "0")}`
    );
  }

  /**
   * 🖼️ Send Photo Capture Command using ULV Protocol V2.0.0
   * Protocol: Send trigger command → Device responds with 0x0800 (event coding 0)
   * Event Coding 0: "The platform issues an instruction"
   */
  sendPhotoCaptureCommand(connection, instruction) {
    try {
      const {
        terminalId,
        channelId = 1,
        quality = "high",
        timestamp,
      } = instruction;

      logger.info(`📸 Sending Photo Capture Command to terminal ${terminalId}`);
      logger.info(`  Channel: ${channelId}, Quality: ${quality}`);
      logger.info(
        `📋 Protocol: ULV 0x0800 with event coding 0 (platform instruction)`
      );

      // According to ULV Protocol V2.0.0:
      // - Event Coding 0: "The platform issues an instruction"
      // - We send a trigger command that causes device to send 0x0800
      // - Device will respond with multimedia event (0x0800) + data (0x0801)

      // Create a trigger command using 0x0900 (Data Transparent Transmission)
      // This will cause the device to generate a 0x0800 event with coding 0
      const captureData = Buffer.alloc(20);

      // Header: ULV Transparent Data (0xF3)
      captureData[0] = 0xf3;

      // Data Type: 0x01 (Custom command)
      captureData[1] = 0x01;

      // Command: 0x01 (Photo Capture)
      captureData[2] = 0x01;

      // Channel ID
      captureData[3] = channelId;

      // Quality setting (0=low, 1=medium, 2=high)
      const qualityMap = { low: 0, medium: 1, high: 2 };
      captureData[4] = qualityMap[quality] || 2;

      // Timestamp (4 bytes, little endian)
      captureData.writeUInt32LE(Math.floor(timestamp / 1000), 5);

      // Reserved bytes
      captureData.fill(0, 9, 20);

      // Build the 0x0900 message body
      const messageIdBuffer = Buffer.alloc(2);
      messageIdBuffer.writeUInt16BE(0x0900, 0);

      const terminalIdLengthBuffer = Buffer.alloc(2);
      terminalIdLengthBuffer.writeUInt16BE(connection.terminalId.length, 0);

      const serialNumberBuffer = Buffer.alloc(2);
      serialNumberBuffer.writeUInt16BE(this.generateSerialNumber(), 0);

      const bodyLengthBuffer = Buffer.alloc(2);
      bodyLengthBuffer.writeUInt16BE(captureData.length, 0);

      const messageBody = Buffer.concat([
        messageIdBuffer, // Message ID (2 bytes)
        terminalIdLengthBuffer, // Terminal ID length
        Buffer.from(connection.terminalId), // Terminal ID
        serialNumberBuffer, // Message serial number
        bodyLengthBuffer, // Message body length
        captureData, // ULV capture data
      ]);

      // Build and send the JT808 message
      const message = this.parser.buildMessage(messageBody);

      if (message) {
        // Send the message
        connection.socket.write(message);

        logger.info(`📸 Photo capture trigger sent to terminal ${terminalId}`);
        logger.info(`📋 Message: 0x0900 with ULV capture command`);
        logger.info(
          `📋 Expected response: 0x0800 (event coding 0) → 0x8800 (ack) → 0x0801 (data) → 0x8800 (ack)`
        );
        logger.info(
          `📋 Event coding 0 indicates: "The platform issues an instruction"`
        );

        return true;
      } else {
        logger.error(
          `Failed to build photo capture message for terminal ${terminalId}`
        );
        return false;
      }
    } catch (error) {
      logger.error(`Error sending photo capture command: ${error.message}`);
      return false;
    }
  }

  /**
   * Send ULV Parameter Query (0xB050) to terminal
   */
  sendULVParameterQuery(terminalId, cmdType, paramType) {
    logger.info(`sendULVParameterQuery called with terminalId: ${terminalId}`);
    try {
      const connection = this.findConnectionByTerminalId(terminalId);
      if (!connection) {
        logger.error(
          `Terminal ${terminalId} not found for ULV parameter query`
        );
        return false;
      }

      // Build JSON parameter string according to ULV protocol
      const paramString = JSON.stringify({
        CmdType: cmdType,
        ParamType: paramType,
      });

      // Build message body according to Table 3.17.1
      const body = Buffer.concat([
        Buffer.alloc(4), // Type (DWORD) - not used yet, fill with 0
        Buffer.alloc(4), // Parameter length (DWORD) - placeholder
        Buffer.from(paramString, "utf8"), // String parameter (JSON)
      ]);

      // Set parameter length
      body.writeUInt32LE(paramString.length, 4);

      const success = this.sendMessageToTerminal(connection, 0xb050, body);

      if (success) {
        logger.info(`ULV Parameter Query sent to terminal ${terminalId}`);
        logger.info(`  Command Type: ${cmdType}`);
        logger.info(`  Parameter Type: ${paramType}`);
        logger.info(`  Parameter String: ${paramString}`);
      }

      return success;
    } catch (error) {
      logger.error(`Error sending ULV parameter query: ${error.message}`);
      return false;
    }
  }

  /**
   * Handle ULV Parameter Response (0xB051) from terminal
   */
  handleULVParameterResponse(message, connection, connectionId) {
    try {
      logger.info(`ULV Parameter Response received from ${connectionId}`);

      if (message.body && message.body.length > 0) {
        const responseData = this.parseULVParameterResponse(message.body);
        if (responseData) {
          logger.info(
            `ULV Parameter Response parsed successfully:`,
            responseData
          );

          // Store the response data on the connection for later use
          connection.ulvParameters = responseData;

          // Send acknowledgment
          this.sendGeneralResponse(
            connection,
            message.messageSerialNumber,
            0x0001
          );
        }
      } else {
        logger.warn(`ULV Parameter Response has no body`);
        this.sendGeneralResponse(
          connection,
          message.messageSerialNumber,
          0x0001
        );
      }
    } catch (error) {
      logger.error(`Error handling ULV parameter response: ${error.message}`);
      this.sendGeneralResponse(connection, message.messageSerialNumber, 0x0001);
    }
  }

  /**
   * Handle ULV File Discovery Response (0xB061) from terminal
   */
  handleULVFileDiscoveryResponse(message, connection, connectionId) {
    try {
      logger.info(`ULV File Discovery Response received from ${connectionId}`);

      if (message.body && message.body.length > 0) {
        const responseData = this.parseULVFileDiscoveryResponse(message.body);
        if (responseData) {
          logger.info(
            `ULV File Discovery Response parsed successfully:`,
            responseData
          );

          // Store the file discovery results on the connection for later use
          connection.ulvFileDiscovery = responseData;

          // Send acknowledgment
          this.sendGeneralResponse(
            connection,
            message.messageSerialNumber,
            0x0001
          );

          // Log file discovery summary
          if (
            responseData.paramData &&
            responseData.paramData.fileList &&
            responseData.paramData.fileList.length > 0
          ) {
            logger.info(
              `🔍 ULV File Discovery found ${responseData.paramData.fileList.length} files on terminal ${connection.terminalId}`
            );
            logger.info(
              `  Storage Location: ${
                responseData.paramData.storageLocation || "Unknown"
              }`
            );
            logger.info(
              `  Total Size: ${
                responseData.paramData.totalSize || "Unknown"
              } bytes`
            );
            logger.info(
              `  File Types: ${(responseData.paramData.fileTypes || []).join(
                ", "
              )}`
            );

            // Log first few files as examples
            const sampleFiles = responseData.paramData.fileList.slice(0, 5);
            sampleFiles.forEach((file, index) => {
              logger.info(
                `  File ${index + 1}: ${file.fileName} (${
                  file.fileSize
                } bytes, ${file.fileType})`
              );
            });
          } else {
            logger.info(
              `🔍 ULV File Discovery completed - No files found on terminal ${connection.terminalId}`
            );
          }
        } else {
          logger.warn(
            `Failed to parse ULV file discovery response from ${connectionId}`
          );
          this.sendGeneralResponse(
            connection,
            message.messageSerialNumber,
            0x0001
          );
        }
      } else {
        logger.warn(
          `ULV file discovery response from ${connectionId} has no body`
        );
        this.sendGeneralResponse(
          connection,
          message.messageSerialNumber,
          0x0001
        );
      }
    } catch (error) {
      logger.error(
        `Error handling ULV file discovery response: ${error.message}`
      );
      this.sendGeneralResponse(connection, message.messageSerialNumber, 0x0001);
    }
  }

  /**
   * Handle ULV File Metadata Response (0xB063) from terminal
   */
  handleULVFileMetadataResponse(message, connection, connectionId) {
    try {
      logger.info(`ULV File Metadata Response received from ${connectionId}`);

      if (message.body && message.body.length > 0) {
        const responseData = this.parseULVFileMetadataResponse(message.body);
        if (responseData) {
          logger.info(
            `ULV File Metadata Response parsed successfully:`,
            responseData
          );

          // Store the file metadata on the connection for later use
          connection.ulvFileMetadata = responseData;

          // Send acknowledgment
          this.sendGeneralResponse(
            connection,
            message.messageSerialNumber,
            0x0001
          );

          // Log file metadata summary
          if (responseData.paramData) {
            logger.info(
              `📄 ULV File Metadata for ${responseData.paramData.fileName} on terminal ${connection.terminalId}`
            );
            logger.info(
              `  File Size: ${
                responseData.paramData.fileSize || "Unknown"
              } bytes`
            );
            logger.info(
              `  File Type: ${responseData.paramData.fileType || "Unknown"}`
            );
            logger.info(
              `  Creation Time: ${
                responseData.paramData.creationTime || "Unknown"
              }`
            );
            logger.info(
              `  Modification Time: ${
                responseData.paramData.modificationTime || "Unknown"
              }`
            );
            logger.info(
              `  File Path: ${responseData.paramData.filePath || "Unknown"}`
            );
            if (responseData.paramData.metadata) {
              logger.info(
                `  Additional Metadata:`,
                responseData.paramData.metadata
              );
            }
          }
        } else {
          logger.warn(
            `Failed to parse ULV file metadata response from ${connectionId}`
          );
          this.sendGeneralResponse(
            connection,
            message.messageSerialNumber,
            0x0001
          );
        }
      } else {
        logger.warn(
          `ULV file metadata response from ${connectionId} has no body`
        );
        this.sendGeneralResponse(
          connection,
          message.messageSerialNumber,
          0x0001
        );
      }
    } catch (error) {
      logger.error(
        `Error handling ULV file metadata response: ${error.message}`
      );
      this.sendGeneralResponse(connection, message.messageSerialNumber, 0x0001);
    }
  }

  /**
   * Handle ULV File Access Response (0xB065) from terminal
   */
  handleULVFileAccessResponse(message, connection, connectionId) {
    try {
      logger.info(`ULV File Access Response received from ${connectionId}`);

      if (message.body && message.body.length > 0) {
        const responseData = this.parseULVFileAccessResponse(message.body);
        if (responseData) {
          logger.info(
            `ULV File Access Response parsed successfully:`,
            responseData
          );

          // Store the file access results on the connection for later use
          connection.ulvFileAccess = responseData;

          // Send acknowledgment
          this.sendGeneralResponse(
            connection,
            message.messageSerialNumber,
            0x0001
          );

          // Log file access summary
          if (responseData.paramData) {
            logger.info(
              `📁 ULV File Access for ${responseData.paramData.fileName} on terminal ${connection.terminalId}`
            );
            logger.info(
              `  File Size: ${
                responseData.paramData.fileSize || "Unknown"
              } bytes`
            );
            logger.info(
              `  Data Length: ${
                responseData.paramData.dataLength || "Unknown"
              } bytes`
            );
            logger.info(
              `  Start Offset: ${responseData.paramData.startOffset || 0}`
            );
            logger.info(
              `  Access Type: ${responseData.paramData.accessType || "Unknown"}`
            );
            if (responseData.paramData.fileData) {
              logger.info(
                `  File Data: ${responseData.paramData.fileData.length} bytes received`
              );
            }
          }
        } else {
          logger.warn(
            `Failed to parse ULV file access response from ${connectionId}`
          );
          this.sendGeneralResponse(
            connection,
            message.messageSerialNumber,
            0x0001
          );
        }
      } else {
        logger.warn(
          `ULV file access response from ${connectionId} has no body`
        );
        this.sendGeneralResponse(
          connection,
          message.messageSerialNumber,
          0x0001
        );
      }
    } catch (error) {
      logger.error(`Error handling ULV file access response: ${error.message}`);
      this.sendGeneralResponse(connection, message.messageSerialNumber, 0x0001);
    }
  }

  /**
   * Parse ULV Parameter Response (0xB051) message body
   */
  parseULVParameterResponse(body) {
    try {
      if (body.length < 6) {
        logger.warn(
          `ULV parameter response body too short: ${body.length} bytes`
        );
        return null;
      }

      let offset = 0;

      // Reply serial number
      const replySerial = body.readUInt16BE(offset);
      offset += 2;

      // Parameter length
      const paramLength = body.readUInt32LE(offset);
      offset += 4;

      // String parameter (JSON)
      if (offset + paramLength > body.length) {
        logger.warn(
          `ULV parameter response body too short for parameter length: ${paramLength}`
        );
        return null;
      }

      const paramString = body
        .slice(offset, offset + paramLength)
        .toString("utf8");

      try {
        const paramData = JSON.parse(paramString);
        return {
          replySerial,
          paramLength,
          paramData,
        };
      } catch (parseError) {
        logger.error(
          `Failed to parse ULV parameter JSON: ${parseError.message}`
        );
        return {
          replySerial,
          paramLength,
          rawParamString: paramString,
        };
      }
    } catch (error) {
      logger.error(`Error parsing ULV parameter response: ${error.message}`);
      return null;
    }
  }

  /**
   * Parse ULV File Discovery Response (0xB061) message body
   */
  parseULVFileDiscoveryResponse(body) {
    try {
      if (body.length < 6) {
        logger.warn(
          `ULV file discovery response body too short: ${body.length} bytes`
        );
        return null;
      }

      let offset = 0;

      // Reply serial number
      const replySerial = body.readUInt16BE(offset);
      offset += 2;

      // Parameter length
      const paramLength = body.readUInt32LE(offset);
      offset += 4;

      // String parameter (JSON)
      if (offset + paramLength > body.length) {
        logger.warn(
          `ULV file discovery response body too short for parameter length: ${paramLength}`
        );
        return null;
      }

      const paramString = body
        .slice(offset, offset + paramLength)
        .toString("utf8");

      try {
        const paramData = JSON.parse(paramString);
        return {
          replySerial,
          paramLength,
          paramData,
        };
      } catch (parseError) {
        logger.error(
          `Failed to parse ULV file discovery JSON: ${parseError.message}`
        );
        return {
          replySerial,
          paramLength,
          rawParamString: paramString,
        };
      }
    } catch (error) {
      logger.error(
        `Error parsing ULV file discovery response: ${error.message}`
      );
      return null;
    }
  }

  /**
   * Parse ULV File Metadata Response (0xB063) message body
   */
  parseULVFileMetadataResponse(body) {
    try {
      if (body.length < 6) {
        logger.warn(
          `ULV file metadata response body too short: ${body.length} bytes`
        );
        return null;
      }

      let offset = 0;

      // Reply serial number
      const replySerial = body.readUInt16BE(offset);
      offset += 2;

      // Parameter length
      const paramLength = body.readUInt32LE(offset);
      offset += 4;

      // String parameter (JSON)
      if (offset + paramLength > body.length) {
        logger.warn(
          `ULV file metadata response body too short for parameter length: ${paramLength}`
        );
        return null;
      }

      const paramString = body
        .slice(offset, offset + paramLength)
        .toString("utf8");

      try {
        const paramData = JSON.parse(paramString);
        return {
          replySerial,
          paramLength,
          paramData,
        };
      } catch (parseError) {
        logger.error(
          `Failed to parse ULV file metadata JSON: ${parseError.message}`
        );
        return {
          replySerial,
          paramLength,
          rawParamString: paramString,
        };
      }
    } catch (error) {
      logger.error(
        `Error parsing ULV file metadata response: ${error.message}`
      );
      return null;
    }
  }

  /**
   * Parse ULV File Access Response (0xB065) message body
   */
  parseULVFileAccessResponse(body) {
    try {
      if (body.length < 6) {
        logger.warn(
          `ULV file access response body too short: ${body.length} bytes`
        );
        return null;
      }

      let offset = 0;

      // Reply serial number
      const replySerial = body.readUInt16BE(offset);
      offset += 2;

      // Parameter length
      const paramLength = body.readUInt32LE(offset);
      offset += 4;

      // String parameter (JSON)
      if (offset + paramLength > body.length) {
        logger.warn(
          `ULV file access response body too short for parameter length: ${paramLength}`
        );
        return null;
      }

      const paramString = body
        .slice(offset, offset + paramLength)
        .toString("utf8");

      try {
        const paramData = JSON.parse(paramString);
        return {
          replySerial,
          paramLength,
          paramData,
        };
      } catch (parseError) {
        logger.error(
          `Failed to parse ULV file access JSON: ${parseError.message}`
        );
        return {
          replySerial,
          paramLength,
          rawParamString: paramString,
        };
      }
    } catch (error) {
      logger.error(`Error parsing ULV file access response: ${error.message}`);
      return null;
    }
  }

  /**
   * Send Enhanced Resource Query (0x9205) with ULV-specific parameters
   */
  sendEnhancedResourceQuery(
    terminalId,
    resourceType,
    streamType,
    memoryType,
    startTime,
    endTime,
    alarmSign,
    ulvEnhanced,
    fileType,
    channelMask,
    alarmTypes
  ) {
    logger.info(
      `sendEnhancedResourceQuery called with terminalId: ${terminalId}`
    );
    try {
      const connection = this.findConnectionByTerminalId(terminalId);
      if (!connection) {
        logger.error(
          `Terminal ${terminalId} not found for enhanced resource query`
        );
        return false;
      }

      // Convert ISO time strings to BCD format
      const startBCD = this.isoTimeToBCD(startTime);
      const endBCD = this.isoTimeToBCD(endTime);

      // Build message body according to ULV protocol Table 3.14.1
      const body = Buffer.concat([
        Buffer.alloc(2), // Response serial number (2 bytes)
        Buffer.from([1]), // Logical channel number (start from 1)
        startBCD, // Start time (BCD[6])
        endBCD, // End time (BCD[6])
        Buffer.alloc(8), // Alarm sign (64 bits = 8 bytes) - will be filled below
        Buffer.from([resourceType]), // Audio and video resource type
        Buffer.from([streamType]), // Stream type
        Buffer.from([memoryType]), // Memory type
      ]);

      // Write the 64-bit alarm sign
      body.writeBigUInt64BE(alarmSign, 13); // Offset 13 for alarm sign

      // Set response serial number
      body.writeUInt16BE(this.generateSerialNumber(), 0);

      const success = this.sendMessageToTerminal(connection, 0x9205, body);

      if (success) {
        logger.info(
          `🔍 Enhanced ULV Resource Query sent to terminal ${terminalId}`
        );
        logger.info(`  Channel: 1`);
        logger.info(`  Resource Type: ${resourceType}`);
        logger.info(`  Stream Type: ${streamType}`);
        logger.info(`  Memory Type: ${memoryType}`);
        logger.info(`  Time Range: ${startTime} to ${endTime}`);
        logger.info(`  Alarm Sign: 0x${alarmSign.toString(16)}`);
        logger.info(`  ULV Enhanced: ${ulvEnhanced}`);
        if (fileType !== null) logger.info(`  File Type: ${fileType}`);
        if (channelMask !== 255) logger.info(`  Channel Mask: ${channelMask}`);
        if (alarmTypes.length > 0)
          logger.info(`  Alarm Types: ${alarmTypes.join(", ")}`);
      }

      return success;
    } catch (error) {
      logger.error(`Error sending enhanced resource query: ${error.message}`);
      return false;
    }
  }

  /**
   * Send ULV File Discovery (0xB060) to terminal
   */
  sendULVFileDiscovery(
    terminalId,
    discoveryType,
    storageLocation,
    fileTypes,
    includeMetadata,
    maxResults
  ) {
    logger.info(`sendULVFileDiscovery called with terminalId: ${terminalId}`);
    try {
      const connection = this.findConnectionByTerminalId(terminalId);
      if (!connection) {
        logger.error(`Terminal ${terminalId} not found for ULV file discovery`);
        return false;
      }

      // Build JSON parameter string according to ULV protocol
      const paramString = JSON.stringify({
        CmdType: "Get",
        ParamType: "FileDiscovery",
        DiscoveryType: discoveryType,
        StorageLocation: storageLocation,
        FileTypes: fileTypes,
        IncludeMetadata: includeMetadata,
        MaxResults: maxResults,
      });

      // Build message body according to ULV protocol Table 3.17.1
      const body = Buffer.concat([
        Buffer.alloc(4), // Type (DWORD) - not used yet, fill with 0
        Buffer.alloc(4), // Parameter length (DWORD)
        Buffer.from(paramString, "utf8"), // String parameter (JSON)
      ]);

      // Set parameter length
      body.writeUInt32LE(paramString.length, 4);

      const success = this.sendMessageToTerminal(connection, 0xb060, body);

      if (success) {
        logger.info(`🔍 ULV File Discovery sent to terminal ${terminalId}`);
        logger.info(`  Discovery Type: ${discoveryType}`);
        logger.info(`  Storage Location: ${storageLocation}`);
        logger.info(`  File Types: ${fileTypes.join(", ")}`);
        logger.info(`  Include Metadata: ${includeMetadata}`);
        logger.info(`  Max Results: ${maxResults}`);
      }

      return success;
    } catch (error) {
      logger.error(`Error sending ULV file discovery: ${error.message}`);
      return false;
    }
  }

  /**
   * Send ULV File Metadata Query (0xB062) to terminal
   */
  sendULVFileMetadataQuery(terminalId, fileName, filePath, includeContent) {
    console.log(
      `📄 sendULVFileMetadataQuery called with terminalId: ${terminalId}`
    );
    try {
      const connection = this.findConnectionByTerminalId(terminalId);
      if (!connection) {
        logger.error(
          `Terminal ${terminalId} not found for ULV file metadata query`
        );
        return false;
      }

      // Build JSON parameter string according to ULV protocol
      const paramString = JSON.stringify({
        CmdType: "Get",
        ParamType: "FileMetadata",
        FileName: fileName,
        FilePath: filePath || "",
        IncludeContent: includeContent,
      });

      // Build message body according to ULV protocol Table 3.17.1
      const body = Buffer.concat([
        Buffer.alloc(4), // Type (DWORD) - not used yet, fill with 0
        Buffer.alloc(4), // Parameter length (DWORD)
        Buffer.from(paramString, "utf8"), // String parameter (JSON)
      ]);

      // Set parameter length
      body.writeUInt32LE(paramString.length, 4);

      const success = this.sendMessageToTerminal(connection, 0xb062, body);

      if (success) {
        logger.info(
          `📄 ULV File Metadata Query sent to terminal ${terminalId}`
        );
        logger.info(`  File Name: ${fileName}`);
        logger.info(`  File Name: ${fileName}`);
        logger.info(`  File Path: ${filePath || "Root"}`);
        logger.info(`  Include Content: ${includeContent}`);
      }

      return success;
    } catch (error) {
      logger.error(`Error sending ULV file metadata query: ${error.message}`);
      return false;
    }
  }

  /**
   * Send ULV File Access (0xB064) to terminal
   */
  sendULVFileAccess(
    terminalId,
    fileName,
    filePath,
    accessType,
    startOffset,
    maxBytes
  ) {
    console.log(`📁 sendULVFileAccess called with terminalId: ${terminalId}`);
    try {
      const connection = this.findConnectionByTerminalId(terminalId);
      if (!connection) {
        logger.error(`Terminal ${terminalId} not found for ULV file access`);
        return false;
      }

      // Build JSON parameter string according to ULV protocol
      const paramString = JSON.stringify({
        CmdType: "Get",
        ParamType: "FileAccess",
        FileName: fileName,
        FilePath: filePath || "",
        AccessType: accessType,
        StartOffset: startOffset,
        MaxBytes: maxBytes,
      });

      // Build message body according to ULV protocol Table 3.17.1
      const body = Buffer.concat([
        Buffer.alloc(4), // Type (DWORD) - not used yet, fill with 0
        Buffer.alloc(4), // Parameter length (DWORD)
        Buffer.from(paramString, "utf8"), // String parameter (JSON)
      ]);

      // Set parameter length
      body.writeUInt32LE(paramString.length, 4);

      const success = this.sendMessageToTerminal(connection, 0xb064, body);

      if (success) {
        logger.info(
          `📁 ULV File Access request sent to terminal ${terminalId}`
        );
        logger.info(`  File Name: ${fileName}`);
        logger.info(`  File Path: ${filePath || "Root"}`);
        logger.info(`  Access Type: ${accessType}`);
        logger.info(`  Start Offset: ${startOffset}`);
        logger.info(`  Max Bytes: ${maxBytes || "Full file"}`);
      }

      return success;
    } catch (error) {
      logger.error(`Error sending ULV file access request: ${error.message}`);
      return false;
    }
  }

  // ============================================================================
  // Audio/Video Streaming Implementation (ULV Protocol)
  // ============================================================================

  /**
   * Start Audio/Video Streaming (ULV Protocol)
   * Sends streaming request to device and manages stream session
   */
  startStreaming(terminalId, options = {}) {
    const connection = this.findConnectionByTerminalId(terminalId);
    if (!connection) {
      logger.error(
        `Cannot start streaming: Terminal ${terminalId} not connected`
      );
      return false;
    }

    const {
      channelNumber = 1,
      streamType = 0, // 0=All streams, 1=Main stream, 2=Sub stream
      quality = 0, // 0=Auto, 1=High, 2=Medium, 3=Low
      frameRate = 25, // FPS
      bitrate = 0, // 0=Auto, or specific bitrate
      audioEnabled = true,
      videoEnabled = true,
    } = options;

    try {
      logger.info(`🎥 Starting streaming for terminal ${terminalId}`);
      logger.info(
        `  Channel: ${channelNumber}, Stream: ${streamType}, Quality: ${quality}`
      );
      logger.info(
        `  Frame Rate: ${frameRate}, Audio: ${audioEnabled}, Video: ${videoEnabled}`
      );

      // Create streaming session
      const streamSession = {
        sessionId: `stream_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        terminalId,
        channelNumber,
        streamType,
        quality,
        frameRate,
        bitrate,
        audioEnabled,
        videoEnabled,
        startTime: new Date(),
        status: "starting",
        packets: [],
        totalBytes: 0,
      };

      // Store streaming session
      if (!connection.streamingSessions) {
        connection.streamingSessions = new Map();
      }
      connection.streamingSessions.set(streamSession.sessionId, streamSession);

      // Send streaming start command via ULV transparent data
      const streamingCommand = this.createStreamingCommand(streamSession);
      const success = this.sendMessageToTerminal(
        connection,
        0x0900,
        streamingCommand
      );

      if (success) {
        streamSession.status = "active";
        logger.info(
          `✅ Streaming session ${streamSession.sessionId} started successfully`
        );
        return streamSession.sessionId;
      } else {
        logger.error(
          `❌ Failed to start streaming session ${streamSession.sessionId}`
        );
        connection.streamingSessions.delete(streamSession.sessionId);
        return false;
      }
    } catch (error) {
      logger.error(`Error starting streaming: ${error.message}`);
      return false;
    }
  }

  /**
   * Stop Audio/Video Streaming
   * Terminates active streaming session
   */
  stopStreaming(terminalId, sessionId) {
    const connection = this.findConnectionByTerminalId(terminalId);
    if (!connection || !connection.streamingSessions) {
      logger.error(
        `Cannot stop streaming: No streaming sessions found for terminal ${terminalId}`
      );
      return false;
    }

    const session = connection.streamingSessions.get(sessionId);
    if (!session) {
      logger.error(`Cannot stop streaming: Session ${sessionId} not found`);
      return false;
    }

    try {
      logger.info(
        `🛑 Stopping streaming session ${sessionId} for terminal ${terminalId}`
      );

      // Send streaming stop command
      const stopCommand = this.createStreamingStopCommand(session);
      const success = this.sendMessageToTerminal(
        connection,
        0x0900,
        stopCommand
      );

      if (success) {
        session.status = "stopped";
        session.endTime = new Date();
        session.duration = session.endTime - session.startTime;

        logger.info(`✅ Streaming session ${sessionId} stopped successfully`);
        logger.info(
          `  Duration: ${Math.round(session.duration / 1000)}s, Total bytes: ${
            session.totalBytes
          }`
        );
        logger.info(
          `  Forwarded: ${session.totalPacketsForwarded || 0} packets, ${
            session.totalBytesForwarded || 0
          } bytes to SRS`
        );

        return true;
      } else {
        logger.error(`❌ Failed to stop streaming session ${sessionId}`);
        return false;
      }
    } catch (error) {
      logger.error(`Error stopping streaming: ${error.message}`);
      return false;
    }
  }

  /**
   * Get Streaming Status
   * Returns current streaming session information
   */
  getStreamingStatus(terminalId, sessionId = null) {
    const connection = this.findConnectionByTerminalId(terminalId);
    if (!connection || !connection.streamingSessions) {
      return null;
    }

    if (sessionId) {
      return connection.streamingSessions.get(sessionId) || null;
    }

    // Return all streaming sessions for this terminal
    return Array.from(connection.streamingSessions.values());
  }

  /**
   * Create Streaming Command for ULV Protocol
   * Builds ULV-specific streaming command message
   */
  createStreamingCommand(streamSession) {
    try {
      // ULV Protocol: Streaming command structure
      const command = {
        cmdType: "StartStreaming",
        sessionId: streamSession.sessionId,
        channelNumber: streamSession.channelNumber,
        streamType: streamSession.streamType,
        quality: streamSession.quality,
        frameRate: streamSession.frameRate,
        bitrate: streamSession.bitrate,
        audioEnabled: streamSession.audioEnabled ? 1 : 0,
        videoEnabled: streamSession.videoEnabled ? 1 : 0,
        timestamp: Date.now(),
      };

      // Convert to JSON string as per ULV protocol
      const commandString = JSON.stringify(command);
      logger.debug(`🎥 Created streaming command: ${commandString}`);

      // Create buffer with ULV format
      const buffer = Buffer.from(commandString, "utf8");
      return buffer;
    } catch (error) {
      logger.error(`Error creating streaming command: ${error.message}`);
      return Buffer.alloc(0);
    }
  }

  /**
   * Create Streaming Stop Command
   * Builds ULV-specific streaming stop message
   */
  createStreamingStopCommand(streamSession) {
    try {
      const command = {
        cmdType: "StopStreaming",
        sessionId: streamSession.sessionId,
        timestamp: Date.now(),
      };

      const commandString = JSON.stringify(command);
      logger.debug(`🛑 Created streaming stop command: ${commandString}`);

      const buffer = Buffer.from(commandString, "utf8");
      return buffer;
    } catch (error) {
      logger.error(`Error creating streaming stop command: ${error.message}`);
      return Buffer.alloc(0);
    }
  }

  /**
   * Handle Streaming Data from Device
   * Processes incoming streaming packets (0x0801 with streaming data)
   */
  handleStreamingData(message, connection, connectionId) {
    try {
      // Check if this is streaming data (multimedia data with streaming session)
      const multimediaData = this.parseMultimediaDataUpload(message.body);

      if (!multimediaData) {
        return false; // Not streaming data
      }

      // Look for active streaming sessions
      if (!connection.streamingSessions) {
        return false; // No streaming sessions
      }

      // Find matching streaming session (by data ID or other criteria)
      let activeSession = null;
      for (const [sessionId, session] of connection.streamingSessions) {
        if (
          session.status === "active" &&
          session.terminalId === connection.terminalId
        ) {
          activeSession = session;
          break;
        }
      }

      if (!activeSession) {
        return false; // No active streaming session
      }

      // Process streaming packet
      logger.debug(
        `🎥 Processing streaming data for session ${activeSession.sessionId}`
      );

      // Extract streaming data (skip multimedia header)
      const mediaDataStart = 36; // ULV protocol: 8 bytes header + 28 bytes location
      if (message.body.length > mediaDataStart) {
        const streamingData = message.body.slice(mediaDataStart);

        // Store streaming packet
        const packet = {
          dataId: multimediaData.dataId,
          timestamp: new Date(),
          size: streamingData.length,
          data: streamingData,
        };

        activeSession.packets.push(packet);
        activeSession.totalBytes += streamingData.length;

        logger.debug(
          `🎥 Streaming packet received: ${streamingData.length} bytes, total: ${activeSession.totalBytes} bytes`
        );

        // Send acknowledgment
        const response = this.createMultimediaPlatformResponse(
          message,
          0,
          0,
          []
        );
        connection.socket.write(response);

        return true; // Successfully processed streaming data
      }

      return false;
    } catch (error) {
      logger.error(`Error handling streaming data: ${error.message}`);
      return false;
    }
  }

  /**
   * Get Streaming Statistics
   * Returns streaming performance and quality metrics
   */
  getStreamingStatistics(terminalId, sessionId) {
    const session = this.getStreamingStatus(terminalId, sessionId);
    if (!session) {
      return null;
    }

    const stats = {
      sessionId: session.sessionId,
      terminalId: session.terminalId,
      status: session.status,
      startTime: session.startTime,
      endTime: session.endTime,
      duration: session.duration || Date.now() - session.startTime,
      totalPackets: session.packets.length,
      totalBytes: session.totalBytes,
      averagePacketSize:
        session.packets.length > 0
          ? Math.round(session.totalBytes / session.packets.length)
          : 0,
      bitrate: session.bitrate || "auto",
      frameRate: session.frameRate,
      quality: session.quality,
    };

    return stats;
  }

  /**
   * ULV Real-time Audio/Video Preview Request (0x9101)
   * Sends streaming request to device with media server details
   */
  sendULVStreamingRequest(terminalId, options = {}) {
    const connection = this.findConnectionByTerminalId(terminalId);
    if (!connection) {
      logger.error(
        `Cannot send streaming request: Terminal ${terminalId} not connected`
      );
      return false;
    }

    const {
      serverIP = "192.168.100.100", // SRS server IP
      tcpPort = 1935, // SRS RTMP port
      udpPort = 8000, // SRS RTP port
      channelNumber = 1,
      dataType = 0, // 0: Audio+Video, 1: Video, 2: Intercom, 3: Monitor
      streamType = 0, // 0: Main stream, 1: Sub stream
    } = options;

    try {
      // Build message body according to Table 3.11.1
      // Structure: IP length(1) + IP address(15) + TCP port(2) + UDP port(2) + Channel(1) + Data Type(1) + Stream Type(1) = 23 bytes
      const body = Buffer.alloc(23);
      let offset = 0;

      // Server IP length
      body.writeUInt8(serverIP.length, offset);
      offset += 1;

      // Server IP address
      body.write(serverIP, offset);
      offset += serverIP.length;

      // TCP port
      body.writeUInt16BE(tcpPort, offset);
      offset += 2;

      // UDP port
      body.writeUInt16BE(udpPort, offset);
      offset += 2;

      // Channel number
      body.writeUInt8(channelNumber, offset);
      offset += 1;

      // Data type
      body.writeUInt8(dataType, offset);
      offset += 1;

      // Stream type
      body.writeUInt8(streamType, offset);

      // Debug: Log the exact buffer contents
      logger.debug(`🔍 Buffer contents: ${body.toString("hex")}`);
      logger.debug(
        `🔍 Buffer length: ${body.length}, Offset after writing: ${offset + 1}`
      );
      logger.debug(
        `🔍 Expected values: IP=${serverIP}, TCP=${tcpPort}, UDP=${udpPort}, Ch=${channelNumber}, Type=${dataType}, Stream=${streamType}`
      );

      // Create streaming session
      const sessionId = `ulv_stream_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const streamSession = {
        sessionId,
        terminalId,
        channelNumber,
        dataType,
        streamType,
        serverIP,
        tcpPort,
        udpPort,
        status: "requested",
        startTime: new Date(),
        packets: [],
        totalBytes: 0,
      };

      // Store session
      if (!connection.streamingSessions) {
        connection.streamingSessions = new Map();
      }
      connection.streamingSessions.set(sessionId, streamSession);

      // Send 0x9101 message
      const sendResult = this.sendMessageToTerminal(connection, 0x9101, body);
      if (!sendResult) {
        logger.error(`Failed to send 0x9101 message to terminal ${terminalId}`);
        return false;
      }
      logger.debug(
        `✅ 0x9101 message sent successfully to terminal ${terminalId}`
      );

      logger.info(
        `🎥 ULV Streaming request sent to terminal ${terminalId}, session ${sessionId}`
      );
      logger.info(
        `   Server: ${serverIP}:${tcpPort}/${udpPort}, Channel: ${channelNumber}, Type: ${dataType}, Stream: ${streamType}`
      );

      return sessionId;
    } catch (error) {
      logger.error(`Error sending ULV streaming request: ${error.message}`);
      return false;
    }
  }

  /**
   * ULV Real-time Audio/Video Preview Transmission Control (0x9102)
   * Controls streaming: start/stop/pause/resume
   */
  sendULVStreamingControl(terminalId, sessionId, controlCommand, options = {}) {
    const connection = this.findConnectionByTerminalId(terminalId);
    if (!connection || !connection.streamingSessions) {
      logger.error(
        `Cannot control streaming: Terminal ${terminalId} not connected or no sessions`
      );
      return false;
    }

    const session = connection.streamingSessions.get(sessionId);
    if (!session) {
      logger.error(`Streaming session ${sessionId} not found`);
      return false;
    }

    try {
      // Build message body according to Table 3.12.1
      const body = Buffer.alloc(3);
      let offset = 0;

      // Channel number
      body.writeUInt8(session.channelNumber, offset);
      offset += 1;

      // Control instruction
      body.writeUInt8(controlCommand, offset);
      offset += 1;

      // Additional parameters based on control command
      switch (controlCommand) {
        case 0: // Turn off
          body.writeUInt8(options.audioVideoType || 0, offset);
          break;
        case 1: // Switch stream
          body.writeUInt8(options.newStreamType || 0, offset);
          break;
        case 2: // Pause
        case 3: // Resume
          // No additional parameters
          break;
        default:
          logger.warn(`Unknown control command: ${controlCommand}`);
          return false;
      }

      // Send 0x9102 message
      this.sendMessageToTerminal(connection, 0x9102, body);

      // Update session status
      switch (controlCommand) {
        case 0:
          session.status = "stopped";
          session.endTime = new Date();
          break;
        case 1:
          session.streamType = options.newStreamType || 0;
          break;
        case 2:
          session.status = "paused";
          break;
        case 3:
          session.status = "active";
          break;
      }

      logger.info(
        `🎮 ULV Streaming control sent to terminal ${terminalId}, session ${sessionId}`
      );
      logger.info(`   Command: ${controlCommand}, Status: ${session.status}`);

      return true;
    } catch (error) {
      logger.error(`Error sending ULV streaming control: ${error.message}`);
      return false;
    }
  }

  /**
   * Handle general response (0x8001) from device
   * This includes responses to our 0x9101 streaming requests
   */
  handleGeneralResponse(message, connection, connectionId) {
    try {
      logger.info(
        `📨 General response received from terminal ${
          connection.terminalId || "unknown"
        }`
      );

      // Parse general response according to JT808 protocol
      if (message.body.length >= 4) {
        const responseMessageId = message.body.readUInt16BE(0);
        const responseResult = message.body.readUInt8(2);

        logger.info(
          `📨 Response to message: 0x${responseMessageId.toString(
            16
          )}, Result: ${responseResult}`
        );

        // Check if this is a response to our streaming request
        if (responseMessageId === 0x9101) {
          if (responseResult === 0x00) {
            logger.info(
              `🎉 Device accepted streaming request! Starting RTP stream...`
            );
            // Update streaming session status
            this.updateStreamingSessionStatus(
              connection.terminalId,
              "accepted"
            );
          } else {
            logger.warn(
              `❌ Device rejected streaming request. Result: 0x${responseResult.toString(
                16
              )}`
            );
            this.updateStreamingSessionStatus(
              connection.terminalId,
              "rejected"
            );
          }
        }
      }

      // Send acknowledgment
      const response = this.createGeneralResponse(message, 0x00);
      connection.socket.write(response);
      logger.debug(
        `General response acknowledged for terminal ${
          connection.terminalId || "unknown"
        }`
      );
    } catch (error) {
      logger.error(`Error handling general response: ${error.message}`);
    }
  }

  /**
   * Handle alternative general response (0x0001) from device
   * This device uses 0x0001 instead of 0x8001 for general responses
   */
  handleAlternativeGeneralResponse(message, connection, connectionId) {
    try {
      logger.info(
        `📨 Alternative general response received from terminal ${
          connection.terminalId || "unknown"
        }`
      );

      // Parse alternative general response format
      // The device sends: 0x0001 + properties + terminal info + message body
      // We need to find the actual response data in the message body
      if (message.body.length >= 5) {
        // Look for the 0x9101 pattern in the message body
        const bodyHex = message.body.toString("hex");
        const responseIndex = bodyHex.indexOf("9101");

        logger.debug(
          `🔍 Debug parsing: bodyHex=${bodyHex}, responseIndex=${responseIndex}`
        );

        if (responseIndex !== -1 && responseIndex + 6 <= bodyHex.length) {
          // Found 0x9101, now get the result byte after it (according to ULV protocol Table 3.1.1)
          const resultByteIndex = Math.floor((responseIndex + 4) / 2);
          logger.debug(
            `🔍 Debug parsing: resultByteIndex=${resultByteIndex}, bodyLength=${message.body.length}`
          );
          if (resultByteIndex >= 0 && resultByteIndex < message.body.length) {
            const responseResult = message.body.readUInt8(resultByteIndex);
            logger.debug(
              `🔍 Debug parsing: responseResult=0x${responseResult.toString(
                16
              )}`
            );
            const responseMessageId = 0x9101;

            logger.info(
              `📨 Response to message: 0x${responseMessageId.toString(
                16
              )}, Result: 0x${responseResult.toString(16)}`
            );

            // Check if this is a response to our streaming request
            if (responseMessageId === 0x9101) {
              if (responseResult === 0x00) {
                logger.info(
                  `🎉 Device accepted streaming request! Starting RTP stream...`
                );
                logger.info(
                  `📡 Device should now connect to RTP server: 192.168.100.100:8000`
                );
                // Update streaming session status
                this.updateStreamingSessionStatus(
                  connection.terminalId,
                  "accepted"
                );
              } else {
                logger.warn(
                  `❌ Device rejected streaming request. Result: 0x${responseResult.toString(
                    16
                  )} (0=success, 1=failure, 2=error, 3=not supported)`
                );
                this.updateStreamingSessionStatus(
                  connection.terminalId,
                  "rejected"
                );
              }
            }
          }
        } else {
          logger.debug(`📨 Alternative general response body: ${bodyHex}`);
        }
      }

      // Send acknowledgment
      const response = this.createGeneralResponse(message, 0x00);
      connection.socket.write(response);
      logger.debug(
        `Alternative general response acknowledged for terminal ${
          connection.terminalId || "unknown"
        }`
      );
    } catch (error) {
      logger.error(
        `Error handling alternative general response: ${error.message}`
      );
    }
  }

  /**
   * Update streaming session status based on device response
   */
  updateStreamingSessionStatus(terminalId, status) {
    if (!terminalId) return;

    // Find active streaming session for this terminal
    for (const [connectionId, connection] of this.connections) {
      if (
        connection.terminalId === terminalId &&
        connection.streamingSessions
      ) {
        for (const [sessionId, session] of connection.streamingSessions) {
          if (session.status === "requested") {
            session.status = status;
            session.responseTime = new Date();
            logger.info(
              `📊 Streaming session ${sessionId} status updated to: ${status}`
            );
            break;
          }
        }
        break;
      }
    }
  }

  /**
   * Handle ULV Audio/Video Data Transmission (0x9103)
   * Processes RTP-formatted streaming data from device
   */
  handleULVStreamingData(message, connection, connectionId) {
    try {
      // Parse RTP-formatted data according to Table 3.13.1
      const body = message.body;
      if (body.length < 30) {
        logger.warn(`ULV streaming data too short: ${body.length} bytes`);
        return false;
      }

      let offset = 0;

      // Frame header (should be 0x30316364)
      const frameHeader = body.readUInt32BE(offset);
      if (frameHeader !== 0x30316364) {
        logger.warn(`Invalid ULV frame header: 0x${frameHeader.toString(16)}`);
        return false;
      }
      offset += 4;

      // RTP header fields
      const v = (body[offset] >> 6) & 0x03;
      const p = (body[offset] >> 5) & 0x01;
      const x = (body[offset] >> 4) & 0x01;
      const c = body[offset] & 0x0f;
      const m = (body[offset + 1] >> 7) & 0x01;
      const pt = body[offset + 1] & 0x7f;
      offset += 2;

      // Package serial number
      const sequenceNumber = body.readUInt16BE(offset);
      offset += 2;

      // SIM card number (BCD[6])
      const simCardNumber = body.slice(offset, offset + 6).toString("hex");
      offset += 6;

      // Channel number
      const channelNumber = body.readUInt8(offset);
      offset += 1;

      // Data type and multi-packet flags
      const dataType = (body[offset] >> 4) & 0x0f;
      const multiPacketFlags = body[offset] & 0x0f;
      offset += 1;

      // Timestamp (8 bytes)
      const timestamp = body.readBigUInt64BE(offset);
      offset += 8;

      // I frame interval
      const iFrameInterval = body.readUInt16BE(offset);
      offset += 2;

      // Frame interval
      const frameInterval = body.readUInt16BE(offset);
      offset += 2;

      // Data body length
      const dataBodyLength = body.readUInt16BE(offset);
      offset += 2;

      // Data body
      const dataBody = body.slice(offset, offset + dataBodyLength);

      // Find active streaming session for this channel
      let activeSession = null;
      if (connection.streamingSessions) {
        for (const [sessionId, session] of connection.streamingSessions) {
          if (
            session.channelNumber === channelNumber &&
            (session.status === "active" || session.status === "paused")
          ) {
            activeSession = session;
            break;
          }
        }
      }

      if (activeSession) {
        // Store packet data
        const packet = {
          sequenceNumber,
          dataType,
          timestamp: Number(timestamp),
          iFrameInterval,
          frameInterval,
          dataBody,
          receivedAt: new Date(),
        };

        activeSession.packets.push(packet);
        activeSession.totalBytes += dataBody.length;

        // Log streaming data
        const dataTypeNames = [
          "Video I",
          "Video P",
          "Video B",
          "Audio",
          "Transparent",
        ];
        const dataTypeName = dataTypeNames[dataType] || `Unknown(${dataType})`;

        logger.debug(
          `📡 ULV Streaming data from terminal ${connection.terminalId}, session ${activeSession.sessionId}`
        );
        logger.debug(
          `   Channel: ${channelNumber}, Type: ${dataTypeName}, Seq: ${sequenceNumber}, Size: ${dataBody.length} bytes`
        );
        logger.debug(
          `   Timestamp: ${Number(
            timestamp
          )}ms, I-Frame Interval: ${iFrameInterval}ms`
        );

        // Log streaming data for monitoring
        logger.debug(
          `📡 Streaming data received: ${dataBody.length} bytes, Channel: ${channelNumber}, Type: ${dataType}`
        );
      }

      return true;
    } catch (error) {
      logger.error(`Error handling ULV streaming data: ${error.message}`);
      return false;
    }
  }

  /**
   * Apply escape processing according to JT808 protocol
   * 0x7D -> 0x7D 0x01
   * 0x7E -> 0x7D 0x02
   */
  applyEscapeProcessing(buffer) {
    const result = [];

    for (let i = 0; i < buffer.length; i++) {
      const byte = buffer[i];

      // Don't escape the start and end markers
      if (i === 0 || i === buffer.length - 1) {
        result.push(byte);
      } else if (byte === 0x7d) {
        result.push(0x7d, 0x01);
      } else if (byte === 0x7e) {
        result.push(0x7d, 0x02);
      } else {
        result.push(byte);
      }
    }

    return Buffer.from(result);
  }

  /**
   * Get next serial number for messages
   */
  getNextSerialNumber() {
    if (!this.serialNumber) {
      this.serialNumber = 1;
    }
    return this.serialNumber++;
  }

  /**
   * Create generic JT808 message
   */
  createJT808Message(messageId, body, terminalId) {
    // Header + Body + Checksum (15 bytes header for JT808-2019)
    const messageLength = 15 + body.length + 1;
    const message = Buffer.alloc(messageLength);

    // Header according to Table 2.2.2
    message.writeUInt16BE(messageId, 0); // Message ID
    message.writeUInt16BE(0x4000 | body.length, 2); // Properties: Version ID (bit 14) = 1, body length
    message.writeUInt8(0x01, 4); // Protocol Version: Fixed to 1 for JTT808-2019

    // Terminal phone number in BCD format (6 bytes) - CRITICAL FIX
    if (terminalId) {
      const phoneNumber = terminalId.padStart(12, "0");
      for (let i = 0; i < 6; i++) {
        const digit1 = parseInt(phoneNumber[i * 2], 10);
        const digit2 = parseInt(phoneNumber[i * 2 + 1], 10);
        message[5 + i] = (digit1 << 4) | digit2;
      }
    }

    message.writeUInt16BE(this.getNextSerialNumber(), 11); // Message Serial Number

    // Message body
    body.copy(message, 13);

    // Calculate checksum according to 2.2.4
    let checksum = 0;
    for (let i = 0; i < messageLength; i++) {
      checksum ^= message[i];
    }
    message.writeUInt8(checksum, messageLength - 1);

    // Wrap with start/end markers (NO escape processing for now)
    const wrappedMessage = Buffer.alloc(messageLength + 2);
    wrappedMessage.writeUInt8(0x7e, 0);
    message.copy(wrappedMessage, 1);
    wrappedMessage.writeUInt8(0x7e, wrappedMessage.length - 1);

    // Return without escape processing to test
    return wrappedMessage;
  }

  /**
   * Set terminal parameters (0x8103)
   */
  setTerminalParameters(terminalId, parameters) {
    const connection = this.findConnectionByTerminalId(terminalId);
    if (!connection) {
      logger.error(
        `Cannot set parameters: Terminal ${terminalId} not connected`
      );
      return false;
    }

    try {
      // Calculate actual body length needed
      const paramCount = Object.keys(parameters).length;
      let actualBodyLength = 1; // Start with parameter count byte

      for (const [paramId, value] of Object.entries(parameters)) {
        actualBodyLength += 4; // Parameter ID (4 bytes)
        actualBodyLength += 1; // Parameter length (1 byte)

        // Calculate parameter value length
        if (typeof value === "string") {
          actualBodyLength += value.length;
        } else if (typeof value === "number") {
          if (value <= 0xff) actualBodyLength += 1;
          else if (value <= 0xffff) actualBodyLength += 2;
          else actualBodyLength += 4;
        }
      }

      logger.debug(
        `📏 Parameter message body length: ${actualBodyLength} bytes for ${paramCount} parameters`
      );
      const body = Buffer.alloc(actualBodyLength);
      let offset = 0;

      // Parameter count
      body.writeUInt8(paramCount, offset);
      offset += 1;

      // Write each parameter
      for (const [paramId, value] of Object.entries(parameters)) {
        if (offset >= body.length) {
          throw new Error(
            `Buffer overflow: offset ${offset} >= buffer length ${body.length}`
          );
        }

        // Parameter ID (4 bytes)
        const id = parseInt(paramId, 16);
        body.writeUInt32BE(id, offset);
        offset += 4;

        // Parameter value
        if (typeof value === "string") {
          if (offset + 1 + value.length > body.length) {
            throw new Error(
              `String parameter overflow: need ${
                1 + value.length
              } bytes at offset ${offset}`
            );
          }
          body.writeUInt8(value.length, offset);
          offset += 1;
          body.write(value, offset);
          offset += value.length;
        } else if (typeof value === "number") {
          if (value <= 0xff) {
            if (offset + 2 > body.length) {
              throw new Error(`Byte parameter overflow at offset ${offset}`);
            }
            body.writeUInt8(1, offset);
            offset += 1;
            body.writeUInt8(value, offset);
            offset += 1;
          } else if (value <= 0xffff) {
            if (offset + 3 > body.length) {
              throw new Error(`Word parameter overflow at offset ${offset}`);
            }
            body.writeUInt8(2, offset);
            offset += 1;
            body.writeUInt16BE(value, offset);
            offset += 2;
          } else {
            if (offset + 5 > body.length) {
              throw new Error(`DWord parameter overflow at offset ${offset}`);
            }
            body.writeUInt8(4, offset);
            offset += 1;
            body.writeUInt32BE(value, offset);
            offset += 4;
          }
        }

        logger.debug(
          `📝 Parameter ${paramId} = ${value} written at offset ${
            offset -
            (typeof value === "string"
              ? value.length + 1
              : typeof value === "number" && value <= 0xff
              ? 2
              : typeof value === "number" && value <= 0xffff
              ? 3
              : 5)
          }`
        );
      }

      const message = this.createJT808Message(
        0x8103,
        body,
        connection.terminalId
      );
      connection.socket.write(message);

      logger.info(
        `🔧 Terminal parameters set for ${terminalId}: ${Object.keys(
          parameters
        ).join(", ")}`
      );
      return true;
    } catch (error) {
      logger.error(`Error setting terminal parameters: ${error.message}`);
      return false;
    }
  }

  /**
   * Query terminal parameters (0x8104)
   */
  queryTerminalParameters(terminalId, parameterIds = []) {
    const connection = this.findConnectionByTerminalId(terminalId);
    if (!connection) {
      logger.error(
        `Cannot query parameters: Terminal ${terminalId} not connected`
      );
      return false;
    }

    try {
      let body;

      if (parameterIds.length === 0) {
        // Query all parameters
        body = Buffer.alloc(1);
        body.writeUInt8(0, 0);
      } else {
        // Query specific parameters
        body = Buffer.alloc(1 + parameterIds.length * 4);
        body.writeUInt8(parameterIds.length, 0);

        let offset = 1;
        for (const paramId of parameterIds) {
          const id =
            typeof paramId === "string" ? parseInt(paramId, 16) : paramId;
          body.writeUInt32BE(id, offset);
          offset += 4;
        }
      }

      const message = this.createJT808Message(
        0x8104,
        body,
        connection.terminalId
      );
      connection.socket.write(message);

      logger.info(`🔍 Terminal parameter query sent to ${terminalId}`);
      return true;
    } catch (error) {
      logger.error(`Error querying terminal parameters: ${error.message}`);
      return false;
    }
  }

  /**
   * Restart terminal (0x8105) - Now uses Command Manager
   */
  async restartTerminal(terminalId) {
    try {
      const result = await this.commandManager.restartTerminal(terminalId);
      return result.success;
    } catch (error) {
      logger.error(`Error in restartTerminal: ${error.message}`);
      return false;
    }
  }

  /**
   * Query terminal version (0x8001 with specific parameters)
   */
  queryTerminalVersion(terminalId) {
    const connection = this.findConnectionByTerminalId(terminalId);
    if (!connection) {
      logger.error(
        `Cannot query version: Terminal ${terminalId} not connected`
      );
      return false;
    }

    try {
      // Query terminal attributes (0x8107)
      const body = Buffer.alloc(0);
      const message = this.createJT808Message(
        0x8107,
        body,
        connection.terminalId
      );
      connection.socket.write(message);

      logger.info(`📋 Terminal version query sent to ${terminalId}`);
      return true;
    } catch (error) {
      logger.error(`Error querying terminal version: ${error.message}`);
      return false;
    }
  }

  /**
   * Alternative Configuration Methods from advanced-troubleshooting.md
   */

  /**
   * Set device parameters for video streaming (0x8103)
   */
  setVideoStreamingParameters(terminalId, parameters = {}) {
    const connection = this.findConnectionByTerminalId(terminalId);
    if (!connection) {
      logger.error(
        `Cannot set parameters: Terminal ${terminalId} not connected`
      );
      return false;
    }

    try {
      // Default parameters for video streaming
      const defaultParams = {
        0x0070: 1, // Enable video upload
        0x0064: 2, // Set 720P resolution
        0x0065: 5, // Set medium quality
      };

      const params = { ...defaultParams, ...parameters };

      // Create parameter setting message body
      const paramCount = Object.keys(params).length;
      let bodySize = 1; // Parameter count byte

      // Calculate body size
      for (const [paramId, value] of Object.entries(params)) {
        bodySize += 4; // Parameter ID (4 bytes)
        bodySize += 1; // Parameter length (1 byte)
        bodySize += 4; // Parameter value (assuming 4 bytes for most params)
      }

      const body = Buffer.alloc(bodySize);
      let offset = 0;

      // Write parameter count
      body.writeUInt8(paramCount, offset);
      offset += 1;

      // Write each parameter
      for (const [paramId, value] of Object.entries(params)) {
        const id = parseInt(paramId, 16);
        body.writeUInt32BE(id, offset);
        offset += 4;
        body.writeUInt8(4, offset);
        offset += 1; // Parameter length
        body.writeUInt32BE(value, offset);
        offset += 4;
      }

      // Use proper message sending method instead of direct socket write
      const success = this.sendMessageToTerminal(connection, 0x8103, body);

      if (success) {
        logger.info(
          `📹 Video streaming parameters set for ${terminalId}:`,
          params
        );
        return true;
      } else {
        logger.error(`❌ Parameter setting failed to send to ${terminalId}`);
        return false;
      }
    } catch (error) {
      logger.error(`Error setting video parameters: ${error.message}`);
      return false;
    }
  }

  /**
   * Alternative streaming request using JT1078 protocol (0x9101) - Now uses Command Manager
   */
  async requestJT1078LiveVideo(terminalId, channelId = 1, dataType = 0) {
    try {
      const result = await this.commandManager.startStreaming(
        terminalId,
        channelId,
        dataType
      );
      return result.success;
    } catch (error) {
      logger.error(`Error in requestJT1078LiveVideo: ${error.message}`);
      return false;
    }
  }

  /**
   * Alternative UDP streaming on different port
   */
  startAlternativeUDPStreaming(terminalId, port = 1935) {
    const connection = this.findConnectionByTerminalId(terminalId);
    if (!connection) {
      logger.error(
        `Cannot start alternative streaming: Terminal ${terminalId} not connected`
      );
      return false;
    }

    try {
      // Create UDP server on alternative port
      const dgram = require("dgram");
      const udpServer = dgram.createSocket("udp4");

      udpServer.on("message", (msg, rinfo) => {
        logger.info(
          `📡 Alternative UDP data from ${rinfo.address}:${rinfo.port} - ${msg.length} bytes`
        );

        // Log alternative streaming data
        logger.debug(
          `📡 Alternative streaming data: ${msg.length} bytes on port ${port}`
        );
      });

      udpServer.on("error", (err) => {
        logger.error(`Alternative UDP server error: ${err.message}`);
      });

      udpServer.bind(port, () => {
        logger.info(
          `🚀 Alternative UDP streaming server started on port ${port}`
        );
      });

      // Store server reference for cleanup
      if (!connection.alternativeServers) {
        connection.alternativeServers = [];
      }
      connection.alternativeServers.push(udpServer);

      // Send streaming request with alternative port
      this.requestVideoStreamingAlternative(terminalId, port);

      return true;
    } catch (error) {
      logger.error(
        `Error starting alternative UDP streaming: ${error.message}`
      );
      return false;
    }
  }

  /**
   * TCP streaming alternative
   */
  startTCPStreaming(terminalId, port = 1936) {
    const connection = this.findConnectionByTerminalId(terminalId);
    if (!connection) {
      logger.error(
        `Cannot start TCP streaming: Terminal ${terminalId} not connected`
      );
      return false;
    }

    try {
      const net = require("net");
      const tcpServer = net.createServer((socket) => {
        logger.info(
          `📡 TCP streaming connection from ${socket.remoteAddress}:${socket.remotePort}`
        );

        socket.on("data", (data) => {
          logger.info(`📹 TCP streaming data: ${data.length} bytes`);
          logger.debug(
            `📡 TCP streaming data: ${data.length} bytes on port ${port}`
          );
        });

        socket.on("error", (err) => {
          logger.error(`TCP streaming socket error: ${err.message}`);
        });

        socket.on("close", () => {
          logger.info(`TCP streaming connection closed`);
        });
      });

      tcpServer.listen(port, () => {
        logger.info(`🚀 TCP streaming server started on port ${port}`);
      });

      // Store server reference
      if (!connection.alternativeServers) {
        connection.alternativeServers = [];
      }
      connection.alternativeServers.push(tcpServer);

      // Send TCP streaming request
      this.requestTCPVideoStreaming(terminalId, port);

      return true;
    } catch (error) {
      logger.error(`Error starting TCP streaming: ${error.message}`);
      return false;
    }
  }

  /**
   * Request video streaming with alternative configuration
   */
  requestVideoStreamingAlternative(terminalId, port) {
    const connection = this.findConnectionByTerminalId(terminalId);
    if (!connection) return false;

    try {
      // Alternative streaming request with different parameters
      const body = Buffer.alloc(20);
      let offset = 0;

      // Server IP (4 bytes)
      const serverIP = Buffer.from([127, 0, 0, 1]);
      serverIP.copy(body, offset);
      offset += 4;

      // Alternative port
      body.writeUInt16BE(port, offset);
      offset += 2;

      // Channel ID
      body.writeUInt8(1, offset);
      offset += 1;

      // Data type (0=audio+video, 1=video only)
      body.writeUInt8(1, offset);
      offset += 1;

      // Stream type (0=main, 1=sub)
      body.writeUInt8(0, offset);
      offset += 1;

      // Additional parameters for alternative configuration
      body.writeUInt8(0x01, offset);
      offset += 1; // Enable flag
      body.writeUInt16BE(1280, offset);
      offset += 2; // Width
      body.writeUInt16BE(720, offset);
      offset += 2; // Height
      body.writeUInt8(25, offset);
      offset += 1; // FPS
      body.writeUInt8(5, offset);
      offset += 1; // Quality
      body.writeUInt16BE(2000, offset);
      offset += 2; // Bitrate
      body.writeUInt8(0, offset);
      offset += 1; // Reserved

      const message = this.createJT808Message(
        0x9102,
        body,
        connection.terminalId
      );
      connection.socket.write(message);

      logger.info(
        `🎥 Alternative video streaming request sent to ${terminalId} on port ${port}`
      );
      return true;
    } catch (error) {
      logger.error(`Error requesting alternative streaming: ${error.message}`);
      return false;
    }
  }

  /**
   * Request TCP video streaming
   */
  requestTCPVideoStreaming(terminalId, port) {
    const connection = this.findConnectionByTerminalId(terminalId);
    if (!connection) return false;

    try {
      const body = Buffer.alloc(16);
      let offset = 0;

      // Server IP
      const serverIP = Buffer.from([127, 0, 0, 1]);
      serverIP.copy(body, offset);
      offset += 4;

      // TCP port
      body.writeUInt16BE(port, offset);
      offset += 2;

      // Protocol type (1 = TCP)
      body.writeUInt8(1, offset);
      offset += 1;

      // Channel ID
      body.writeUInt8(1, offset);
      offset += 1;

      // Stream parameters
      body.writeUInt8(0, offset);
      offset += 1; // Data type
      body.writeUInt8(0, offset);
      offset += 1; // Stream type
      body.writeUInt16BE(1280, offset);
      offset += 2; // Width
      body.writeUInt16BE(720, offset);
      offset += 2; // Height
      body.writeUInt8(25, offset);
      offset += 1; // FPS
      body.writeUInt8(0, offset);
      offset += 1; // Reserved

      const message = this.createJT808Message(
        0x9104,
        body,
        connection.terminalId
      );
      connection.socket.write(message);

      logger.info(
        `🎥 TCP video streaming request sent to ${terminalId} on port ${port}`
      );
      return true;
    } catch (error) {
      logger.error(`Error requesting TCP streaming: ${error.message}`);
      return false;
    }
  }

  /**
   * Handle JT1078 live video request response
   */
  handleJT1078LiveVideoRequest(message, connection, connectionId) {
    logger.info(`🎥 JT1078 live video request from ${connectionId}`);

    // Send acknowledgment
    const response = this.createGeneralResponse(message, 0x00);
    connection.socket.write(response);
  }

  /**
   * Handle JT1078 live video response
   */
  handleJT1078LiveVideoResponse(message, connection, connectionId) {
    logger.info(`🎥 JT1078 live video response from ${connectionId}`);

    try {
      // Parse JT1078 response
      if (message.body.length >= 1) {
        const result = message.body.readUInt8(0);
        const resultText = result === 0 ? "Success" : "Failed";
        logger.info(`JT1078 video request result: ${resultText} (${result})`);
      }

      // Send acknowledgment
      const response = this.createGeneralResponse(message, 0x00);
      connection.socket.write(response);
    } catch (error) {
      logger.error(`Error handling JT1078 response: ${error.message}`);
    }
  }

  /**
   * Handle parameter setting response
   */
  handleParameterSettingResponse(message, connection, connectionId) {
    logger.info(`📋 Parameter setting response from ${connectionId}`);

    try {
      if (message.body.length >= 1) {
        const result = message.body.readUInt8(0);
        const resultText = result === 0 ? "Success" : "Failed";
        logger.info(`Parameter setting result: ${resultText} (${result})`);
      }

      // Send acknowledgment
      const response = this.createGeneralResponse(message, 0x00);
      connection.socket.write(response);
    } catch (error) {
      logger.error(`Error handling parameter response: ${error.message}`);
    }
  }

  /**
   * Handle terminal attributes response (0x0107)
   */
  handleTerminalAttributesResponse(message, connection, connectionId) {
    logger.info(`📋 Terminal attributes response from ${connectionId}`);

    try {
      if (message.body.length >= 20) {
        // Parse terminal attributes according to JT808 protocol
        let offset = 0;
        const terminalType = message.body.readUInt16BE(offset);
        offset += 2;
        const manufacturerId = message.body
          .slice(offset, offset + 5)
          .toString("ascii")
          .replace(/\0/g, "");
        offset += 5;
        const terminalModel = message.body
          .slice(offset, offset + 20)
          .toString("ascii")
          .replace(/\0/g, "");
        offset += 20;
        const terminalId = message.body
          .slice(offset, offset + 7)
          .toString("ascii")
          .replace(/\0/g, "");
        offset += 7;

        if (message.body.length >= offset + 4) {
          const iccid = message.body.slice(offset, offset + 10).toString("hex");
          offset += 10;
          const hardwareVersion = message.body
            .slice(offset, offset + 10)
            .toString("ascii")
            .replace(/\0/g, "");
          offset += 10;
          const firmwareVersion = message.body
            .slice(offset, offset + 10)
            .toString("ascii")
            .replace(/\0/g, "");
          offset += 10;

          logger.info(`Terminal Attributes:`);
          logger.info(`  Type: 0x${terminalType.toString(16)}`);
          logger.info(`  Manufacturer: ${manufacturerId}`);
          logger.info(`  Model: ${terminalModel}`);
          logger.info(`  Terminal ID: ${terminalId}`);
          logger.info(`  ICCID: ${iccid}`);
          logger.info(`  Hardware Version: ${hardwareVersion}`);
          logger.info(`  Firmware Version: ${firmwareVersion}`);

          // Store terminal attributes in connection
          connection.terminalAttributes = {
            type: terminalType,
            manufacturerId,
            terminalModel,
            terminalId,
            iccid,
            hardwareVersion,
            firmwareVersion,
          };
        }
      }

      // Send acknowledgment
      const response = this.createGeneralResponse(message, 0x00);
      connection.socket.write(response);
    } catch (error) {
      logger.error(
        `Error handling terminal attributes response: ${error.message}`
      );
    }
  }

  /**
   * Device hardware verification
   */
  verifyDeviceHardware(terminalId) {
    const connection = this.findConnectionByTerminalId(terminalId);
    if (!connection) {
      logger.error(
        `Cannot verify hardware: Terminal ${terminalId} not connected`
      );
      return false;
    }

    try {
      // Query device capabilities
      const body = Buffer.alloc(1);
      body.writeUInt8(0x01, 0); // Query hardware capabilities

      const message = this.createJT808Message(
        0x8108,
        body,
        connection.terminalId
      );
      connection.socket.write(message);

      logger.info(`🔧 Hardware verification request sent to ${terminalId}`);
      return true;
    } catch (error) {
      logger.error(`Error verifying device hardware: ${error.message}`);
      return false;
    }
  }

  /**
   * Cleanup alternative servers
   */
  cleanupAlternativeServers(connection) {
    if (connection.alternativeServers) {
      connection.alternativeServers.forEach((server) => {
        try {
          if (server.close) {
            server.close();
          }
        } catch (error) {
          logger.error(`Error closing alternative server: ${error.message}`);
        }
      });
      connection.alternativeServers = [];
    }
  }

  /**
   * Enhanced multimedia event logging for debugging
   */
  logMultimediaEvent(event, connection, connectionId) {
    try {
      logger.info(
        `📸 Multimedia Event: Terminal ${connection.terminalId || "Unknown"}`
      );
      logger.info(`   Event ID: ${event.multimediaDataId}`);
      logger.info(`   Type: ${event.type} (0x${event.type.toString(16)})`);
      logger.info(
        `   Format: ${event.format} (0x${event.format.toString(16)})`
      );
      logger.info(`   Channel: ${event.channelId}`);
      logger.info(`   Event: ${event.event} (0x${event.event.toString(16)})`);
      logger.info(
        `   Data Length: ${event.data ? event.data.length : 0} bytes`
      );

      // Log first 32 bytes of data for debugging
      if (event.data && event.data.length > 0) {
        const previewData = event.data.slice(0, 32);
        logger.info(`   Data Preview: ${previewData.toString("hex")}`);

        // Check for RTP-like patterns
        if (event.data.length >= 12) {
          const version = (event.data[0] >> 6) & 0x03;
          const padding = (event.data[0] >> 5) & 0x01;
          const extension = (event.data[0] >> 4) & 0x01;
          const csrcCount = event.data[0] & 0x0f;
          const marker = (event.data[1] >> 7) & 0x01;
          const payloadType = event.data[1] & 0x7f;

          logger.info(
            `   RTP Analysis: v${version}, p=${padding}, x=${extension}, cc=${csrcCount}, m=${marker}, pt=${payloadType}`
          );
        }
      }

      // Log connection details
      logger.info(`   Connection: ${connectionId}`);
      logger.info(
        `   Remote IP: ${connection.socket?.remoteAddress}:${connection.socket?.remotePort}`
      );
    } catch (error) {
      logger.error(`Error logging multimedia event: ${error.message}`);
    }
  }

  /**
   * Get multimedia debugging information
   */
  getMultimediaDebugInfo() {
    const debugInfo = {
      timestamp: new Date().toISOString(),
      totalConnections: this.connections.size,
      multimediaConnections: 0,
      totalMultimediaEvents: 0,
      activeStreams: 0,
      connections: [],
    };

    for (const [connectionId, connection] of this.connections) {
      const connectionInfo = {
        connectionId,
        terminalId: connection.terminalId,
        remoteAddress: connection.socket?.remoteAddress,
        remotePort: connection.socket?.remotePort,
        isAuthenticated: connection.isAuthenticated,
        isRegistered: connection.isRegistered,
        multimediaEvents: 0,
        lastActivity: connection.lastActivity,
      };

      if (connection.multimediaEvents && connection.multimediaEvents.size > 0) {
        connectionInfo.multimediaEvents = connection.multimediaEvents.size;
        debugInfo.totalMultimediaEvents += connection.multimediaEvents.size;
        debugInfo.multimediaConnections++;

        // Count active streams
        for (const [eventId, event] of connection.multimediaEvents) {
          if (event.isActive && event.lastDataTime) {
            const timeSinceLastData = Date.now() - event.lastDataTime;
            if (timeSinceLastData < 30000) {
              debugInfo.activeStreams++;
            }
          }
        }
      }

      debugInfo.connections.push(connectionInfo);
    }

    return debugInfo;
  }
}

module.exports = JT808Server;
