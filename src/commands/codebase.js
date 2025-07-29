class CodebaseCommand {
  constructor(dependencies) {
    this.dependencies = dependencies;
  }

  async execute() {
    const { getCodebase, addMessage } = this.dependencies;
    const codebase = getCodebase();
    if (codebase) {
      addMessage({ sender: 'system', text: codebase });
    } else {
      addMessage({ sender: 'system', text: 'Codebase is empty.' });
    }
  }
}

module.exports = CodebaseCommand;
