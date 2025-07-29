class ClearCommand {
  constructor(dependencies) {
    this.dependencies = dependencies;
  }

  async execute() {
    const { setCodebase, addMessage } = this.dependencies;
    setCodebase('');
    addMessage({ sender: 'system', text: 'Codebase cleared.' });
  }
}

module.exports = ClearCommand;
