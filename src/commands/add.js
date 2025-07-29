class AddCommand {
  constructor(dependencies) {
    this.dependencies = dependencies;
  }

  async execute(args) {
    const { getBackend, addMessage, fs } = this.dependencies;
    for (const file of args) {
      await getBackend().add(file);
      const content = await fs.readFile(file, 'utf-8');
      this.dependencies.codebase += `--- ${file} ---\n${content}\n\n`;
      addMessage({ sender: 'system', text: `Added ${file} to the chat.` });
    }
  }
}

module.exports = AddCommand;
