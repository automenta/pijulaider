class StatusCommand {
  constructor(dependencies) {
    this.dependencies = dependencies;
  }

  async execute() {
    const { getBackend, addMessage } = this.dependencies;
    const status = await getBackend().status();
    addMessage({ sender: 'system', text: status });
  }
}

module.exports = StatusCommand;
