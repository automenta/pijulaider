class DiffCommand {
  constructor(dependencies) {
    this.dependencies = dependencies;
  }

  async execute() {
    const { getBackend, addMessage, setDiff } = this.dependencies;
    try {
      const diff = await getBackend().diff();
      setDiff(diff);
      addMessage({ sender: 'system', text: diff });
    } catch (error) {
      addMessage({ sender: 'system', text: `Error: ${error.message}` });
    }
  }
}

module.exports = DiffCommand;
