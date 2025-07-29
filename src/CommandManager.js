const commands = require('./commands');

class CommandManager {
  constructor(aider) {
    this.aider = aider;
    this.commands = {};
    for (const commandName in commands) {
      const CommandClass = commands[commandName];
      this.commands[commandName] = new CommandClass(this.aider);
    }
  }

  async handleCommand(command, args) {
    try {
      if (this.commands[command]) {
        await this.commands[command].execute(args);
      } else {
        this.aider.addMessage({ sender: 'system', text: `Unknown command: ${command}` });
      }
    } catch (error) {
      this.aider.addMessage({ sender: 'system', text: `Error executing command ${command}: ${error.message}` });
    }
  }
}

module.exports = CommandManager;
