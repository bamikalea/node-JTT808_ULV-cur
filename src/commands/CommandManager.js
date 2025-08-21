/**
 * Command Manager - Consolidates all JT808 Commands
 * Provides unified interface for all terminal commands
 */

const RestartTerminalCommand = require("./RestartTerminalCommand");
const JT1078StreamingCommand = require("./JT1078StreamingCommand");
const SetParametersCommand = require("./SetParametersCommand");
const logger = require("../utils/logger");

class CommandManager {
  constructor(server) {
    this.server = server;
    this.commands = {
      restart: new RestartTerminalCommand(server),
      streaming: new JT1078StreamingCommand(server),
      setParams: new SetParametersCommand(server),
    };

    logger.info(
      "Command Manager initialized with commands: " +
        Object.keys(this.commands).join(", ")
    );
  }

  /**
   * Execute restart terminal command
   */
  async restartTerminal(terminalId) {
    logger.info(`Executing restart command for terminal ${terminalId}`);
    return await this.commands.restart.execute(terminalId);
  }

  /**
   * Execute JT1078 streaming command
   */
  async startStreaming(terminalId, channelId = 1, dataType = 0) {
    logger.info(`Executing streaming command for terminal ${terminalId}`);
    return await this.commands.streaming.execute(
      terminalId,
      channelId,
      dataType
    );
  }

  /**
   * Execute parameter setting command
   */
  async setParameters(terminalId, parameters = {}) {
    logger.info(
      `Executing parameter setting command for terminal ${terminalId}`
    );
    return await this.commands.setParams.execute(terminalId, parameters);
  }

  /**
   * Get all available commands
   */
  getAvailableCommands() {
    return Object.keys(this.commands);
  }

  /**
   * Get command protocol specifications
   */
  getProtocolSpecs() {
    const specs = {};
    for (const [name, command] of Object.entries(this.commands)) {
      if (command.getProtocolSpec) {
        specs[name] = command.getProtocolSpec();
      }
    }
    return specs;
  }

  /**
   * Test all commands for a terminal
   */
  async testAllCommands(terminalId) {
    logger.info(`Testing all commands for terminal ${terminalId}`);

    const results = {};

    try {
      // Test restart command
      logger.info("Testing Restart Command...");
      results.restart = await this.restartTerminal(terminalId);

      // Wait a bit between commands
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Test streaming command
      logger.info("Testing Streaming Command...");
      results.streaming = await this.startStreaming(terminalId, 1, 0);

      // Wait a bit between commands
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Test parameter setting command
      logger.info("Testing Parameter Setting Command...");
      results.setParams = await this.setParameters(terminalId, { "0x0070": 1 });
    } catch (error) {
      logger.error("Error during command testing: " + error.message);
      results.error = error.message;
    }

    return results;
  }
}

module.exports = CommandManager;
