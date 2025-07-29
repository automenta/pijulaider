const glob = require('glob');
const { fs } = require('./dependencies');

class FileManager {
  constructor(backend, messageHandler) {
    this.backend = backend;
    this.messageHandler = messageHandler;
    this.codebase = '';
  }

  async loadFiles(files, globFn) {
    const allFiles = files.length > 0 ? files : await (globFn || glob.glob)('**/*', { nodir: true });
    for (const file of allFiles) {
      try {
        await this.backend.add(file);
        const content = await fs.readFile(file, 'utf-8');
        this.codebase += `--- ${file} ---\n${content}\n\n`;
      } catch (error) {
        this.messageHandler.addMessage({ sender: 'system', text: `Error loading file ${file}: ${error.message}` });
      }
    }
  }

  getCodebase() {
    return this.codebase;
  }

  setCodebase(codebase) {
    this.codebase = codebase;
  }
}

module.exports = FileManager;
