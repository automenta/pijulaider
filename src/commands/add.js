const fs = require('fs').promises;

class AddCommand {
  constructor(aider) {
    this.aider = aider;
  }

  async execute(args) {
    for (const file of args) {
      await this.aider.backend.add(file);
      const content = await fs.readFile(file, 'utf-8');
      this.aider.codebase += `--- ${file} ---\n${content}\n\n`;
      this.aider.addMessage({ sender: 'system', text: `Added ${file} to the chat.` });
    }
  }
}

module.exports = AddCommand;
