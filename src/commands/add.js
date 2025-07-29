class AddCommand {
  constructor(dependencies) {
    this.dependencies = dependencies;
  }

  async execute(args) {
    const { getBackend, addMessage, fs, getCodebase, setCodebase } = this.dependencies;
    for (const file of args) {
      await getBackend().add(file);
      const content = await fs.readFile(file, 'utf-8');
      let codebase = getCodebase();
      codebase += `--- ${file} ---\n${content}\n\n`;
      setCodebase(codebase);
      addMessage({ sender: 'system', text: `Added and staged ${file}.` });
    }
  }
}

module.exports = AddCommand;
