class StatusCommand {
  constructor(dependencies) {
    this.dependencies = dependencies;
  }

  async execute() {
    const { getBackend, addMessage } = this.dependencies;
    try {
      const status = await getBackend().status();
      addMessage({ sender: 'system', text: status });
    } catch (error) {
      addMessage({ sender: 'system', text: `Error: ${error.message}` });
    }
  }
}

module.exports = StatusCommand;
