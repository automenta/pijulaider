const fs = require('fs');
const path = require('path');

class MvCommand {
  constructor(dependencies) {
    this.dependencies = dependencies;
  }

  async execute(args) {
    const { addMessage } = this.dependencies;
    const [source, destination] = args;

    if (!source || !destination) {
      addMessage({ sender: 'system', text: 'Usage: /mv <source> <destination>' });
      return;
    }

    try {
      await fs.promises.rename(source, destination);
      addMessage({ sender: 'system', text: `Moved ${source} to ${destination}` });
    } catch (error) {
      addMessage({ sender: 'system', text: `Error: ${error.message}` });
    }
  }
}

module.exports = MvCommand;
