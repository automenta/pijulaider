class DropCommand {
  constructor(aider) {
    this.aider = aider;
  }

  async execute(args) {
    for (const file of args) {
      const fileRegex = new RegExp(`--- ${file} ---\\n[\\s\\S]*?\\n\\n`);
      if (this.aider.codebase.match(fileRegex)) {
        this.aider.codebase = this.aider.codebase.replace(fileRegex, '');
        this.aider.addMessage({ sender: 'system', text: `Removed ${file} from the chat.` });
      } else {
        this.aider.addMessage({ sender: 'system', text: `File ${file} not found in the chat.` });
      }
    }
  }
}

module.exports = DropCommand;
