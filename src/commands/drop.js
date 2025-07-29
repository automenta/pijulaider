class DropCommand {
  constructor(dependencies) {
    this.dependencies = dependencies;
  }

  async execute(args) {
    const { getCodebase, setCodebase, addMessage } = this.dependencies;
    let codebase = getCodebase();
    for (const file of args) {
      const fileRegex = new RegExp(`--- ${file} ---\\n[\\s\\S]*?\\n\\n`);
      if (codebase.match(fileRegex)) {
        codebase = codebase.replace(fileRegex, '');
        setCodebase(codebase);
        addMessage({ sender: 'system', text: `Removed ${file} from the chat.` });
      } else {
        addMessage({ sender: 'system', text: `File ${file} not found in the chat.` });
      }
    }
  }
}

module.exports = DropCommand;
