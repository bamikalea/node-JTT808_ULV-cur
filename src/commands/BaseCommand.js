/**
 * Base Command Class for JT808 Commands
 * Provides common functionality and debugging for all commands
 */

const logger = require("../utils/logger");

class BaseCommand {
  constructor(server) {
    this.server = server;
    this.commandName = this.constructor.name;
  }

  /**
   * Debug logging with consistent format
   */
  debug(stage, message, data = null) {
    const timestamp = new Date().toISOString();
    const debugInfo = {
      timestamp,
      command: this.commandName,
      stage,
      message,
      data,
    };

    logger.debug(`[${this.commandName}] ${stage}: ${message}`, debugInfo);
  }

  /**
   * Error logging with consistent format
   */
  error(stage, message, error = null) {
    const timestamp = new Date().toISOString();
    const errorInfo = {
      timestamp,
      command: this.commandName,
      stage,
      message,
      error: error?.message || error,
    };

    logger.error(`[${this.commandName}] ${stage}: ${message}`, errorInfo);
  }

  /**
   * Success logging with consistent format
   */
  success(stage, message, data = null) {
    const timestamp = new Date().toISOString();
    const successInfo = {
      timestamp,
      command: this.commandName,
      stage,
      message,
      data,
    };

    logger.info(`[${this.commandName}] ${stage}: ${message}`, successInfo);
  }

  /**
   * Find connection by terminal ID
   */
  findConnection(terminalId) {
    this.debug(
      "CONNECTION_LOOKUP",
      `Looking for connection with terminal ID: ${terminalId}`
    );

    const connection = this.server.findConnectionByTerminalId(terminalId);

    if (!connection) {
      this.error("CONNECTION_LOOKUP", `Terminal ${terminalId} not connected`);
      return null;
    }

    this.success(
      "CONNECTION_LOOKUP",
      `Found connection for terminal ${terminalId}`
    );
    return connection;
  }

  /**
   * Validate terminal ID format
   */
  validateTerminalId(terminalId) {
    this.debug("VALIDATION", `Validating terminal ID: ${terminalId}`);

    if (!terminalId || typeof terminalId !== "string") {
      this.error("VALIDATION", `Invalid terminal ID format: ${terminalId}`);
      return false;
    }

    // Check if terminal ID is numeric
    if (!/^\d+$/.test(terminalId)) {
      this.error("VALIDATION", `Terminal ID must be numeric: ${terminalId}`);
      return false;
    }

    this.success(
      "VALIDATION",
      `Terminal ID validated successfully: ${terminalId}`
    );
    return true;
  }

  /**
   * Execute command with proper error handling
   */
  async execute(terminalId, ...args) {
    try {
      // Validate terminal ID
      if (!this.validateTerminalId(terminalId)) {
        throw new Error(`Invalid terminal ID: ${terminalId}`);
      }

      // Find connection
      const connection = this.findConnection(terminalId);
      if (!connection) {
        throw new Error(`Terminal ${terminalId} not connected`);
      }

      // Execute command
      return await this.executeCommand(connection, ...args);
    } catch (error) {
      this.error(
        "COMMAND_EXECUTION",
        `Failed to execute ${this.commandName}: ${error.message}`,
        error
      );
      throw error;
    }
  }

  /**
   * Send message to terminal
   */
  sendMessage(connection, messageId, body) {
    try {
      if (!connection || !connection.socket) {
        this.error("MESSAGE_TRANSMISSION", "Invalid connection or socket");
        return false;
      }

      if (connection.socket.destroyed) {
        this.error("MESSAGE_TRANSMISSION", "Socket is destroyed");
        return false;
      }

      // Use server's sendMessage method
      const result = this.server.sendMessage(connection, messageId, body);

      if (result) {
        this.success(
          "MESSAGE_TRANSMISSION",
          `Message 0x${messageId.toString(16).toUpperCase()} sent successfully`
        );
      } else {
        this.error("MESSAGE_TRANSMISSION", "Failed to send message");
      }

      return result;
    } catch (error) {
      this.error(
        "MESSAGE_TRANSMISSION",
        `Error sending message: ${error.message}`,
        error
      );
      return false;
    }
  }

  /**
   * Get command protocol specifications
   */
  getProtocolSpec() {
    return {
      commandName: this.commandName,
      messageId: this.messageId
        ? `0x${this.messageId.toString(16).toUpperCase()}`
        : "N/A",
      description: "Base command implementation",
    };
  }
}

module.exports = BaseCommand;
