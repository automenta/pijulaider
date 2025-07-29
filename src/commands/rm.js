const fs = require('fs');

class RmCommand {
  constructor(dependencies) {
    this.dependencies = dependencies;
  }

  async execute(args) {
    const { addMessage } = this.dependencies;
    const file = args[0];
    if (!file) {
      addMessage({ sender: 'system', text: 'Usage: /rm <file>' });
      return;
    }
    try {
      await fs.promises.unlink(file);
      addMessage({ sender: 'system', text: `Removed file: ${file}` });
    } catch (error) {
      addMessage({ sender: 'system', text: `Error: ${error.message}` });
    }
  }
}

module.exports = RmCommand;
