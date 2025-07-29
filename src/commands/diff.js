class DiffCommand {
  constructor(dependencies) {
    this.dependencies = dependencies;
  }

  async execute() {
    const { getBackend, addMessage, setDiff } = this.dependencies;
    const diff = await getBackend().diff();
    setDiff(diff);
    addMessage({ sender: 'system', text: 'Diff updated.' });
  }
}

module.exports = DiffCommand;
