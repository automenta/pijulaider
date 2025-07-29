const fs = require('fs');
const path = require('path');

class LsCommand {
  constructor(dependencies) {
    this.dependencies = dependencies;
  }

  async execute(args) {
    const { addMessage } = this.dependencies;
    const targetPath = args[0] || '.';
    try {
      const files = fs.readdirSync(targetPath);
      let fileList = '';
      for (const file of files) {
        const filePath = path.join(targetPath, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
          fileList += `${file}/\n`;
        } else {
          fileList += `${file}\n`;
        }
      }
      addMessage({ sender: 'system', text: fileList });
    } catch (error) {
      addMessage({ sender: 'system', text: `Error: ${error.message}` });
    }
  }
}

module.exports = LsCommand;
