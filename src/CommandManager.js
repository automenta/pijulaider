const fs = require('fs');
const path = require('path');

class CommandManager {
  constructor(dependencies) {
    this.dependencies = dependencies;
    this.commands = {};
    this.loadCommands();
  }

  loadCommands() {
    const commandsPath = path.join(__dirname, 'commands');
    fs.readdirSync(commandsPath).forEach((file) => {
      if (file.endsWith('.js') && file !== 'index.js') {
        const commandName = file.slice(0, -3);
        const CommandClass = require(path.join(commandsPath, file));
        this.commands[commandName] = new CommandClass(this.dependencies);
      }
    });
  }

  async handleCommand(command, args) {
    try {
      if (this.commands[command]) {
        await this.commands[command].execute(args);
      } else {
        this.dependencies.addMessage({ sender: 'system', text: `Unknown command: ${command}` });
      }
    } catch (error) {
      this.dependencies.addMessage({ sender: 'system', text: `Error executing command ${command}: ${error.message}` });
    }
  }
}

module.exports = CommandManager;
