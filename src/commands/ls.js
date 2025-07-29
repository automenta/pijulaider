const fs = require('fs');
const path = require('path');

class LsCommand {
  constructor(dependencies) {
    this.dependencies = dependencies;
  }

  async execute(args) {
    const { addMessage } = this.dependencies;
    const dir = args[0] || '.';
    try {
      const files = await fs.promises.readdir(dir, { withFileTypes: true });
      const fileList = files.map(file => {
        return file.isDirectory() ? `${file.name}/` : file.name;
      }).join('\n');
      addMessage({ sender: 'system', text: fileList });
    } catch (error) {
      addMessage({ sender: 'system', text: `Error: ${error.message}` });
    }
  }
}

module.exports = LsCommand;
