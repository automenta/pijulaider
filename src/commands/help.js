const fs = require('fs');
const path = require('path');

class HelpCommand {
  constructor(dependencies) {
    this.dependencies = dependencies;
  }

  async execute() {
    const { addMessage } = this.dependencies;
    const commandsPath = path.join(__dirname);
    const files = fs.readdirSync(commandsPath);
    let helpMessage = 'Available commands:\n';
    for (const file of files) {
      if (file.endsWith('.js') && file !== 'index.js' && file !== 'help.js') {
        const commandName = file.slice(0, -3);
        helpMessage += `  /${commandName}\n`;
      }
    }
    addMessage({ sender: 'system', text: helpMessage });
  }
}

module.exports = HelpCommand;
