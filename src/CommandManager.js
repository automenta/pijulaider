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
    const commandFiles = fs.readdirSync(commandsPath);

    for (const file of commandFiles) {
      if (file.endsWith('.js')) {
        const commandName = path.basename(file, '.js');
        const CommandClass = require(path.join(commandsPath, file));
        this.commands[commandName] = new CommandClass(this.dependencies);
      }
    }
  }

  async handleCommand(command, args) {
    try {
      if (this.commands[command]) {
        await this.commands[command].execute(args);
      } else {
        this.dependencies.addMessage({
          sender: 'system',
          text: `Unknown command: /${command}`,
        });
      }
    } catch (error) {
      this.dependencies.addMessage({
        sender: 'system',
        text: `An error occurred while executing the /${command} command:\n${error.stack}`,
      });
    }
  }
}

module.exports = CommandManager;
