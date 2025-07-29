const fs = require('fs');

class CreateCommand {
  constructor(dependencies) {
    this.dependencies = dependencies;
  }

  async execute(args) {
    const { addMessage } = this.dependencies;
    const file = args[0];
    if (!file) {
      addMessage({ sender: 'system', text: 'Usage: /create <file>' });
      return;
    }
    try {
      await fs.promises.writeFile(file, '');
      addMessage({ sender: 'system', text: `Created file: ${file}` });
    } catch (error) {
      addMessage({ sender: 'system', text: `Error: ${error.message}` });
    }
  }
}

module.exports = CreateCommand;
