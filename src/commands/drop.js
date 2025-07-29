class DropCommand {
  constructor(dependencies) {
    this.dependencies = dependencies;
  }

  async execute() {
    const { getBackend, addMessage, setDiff } = this.dependencies;
    const backend = getBackend();
    if (typeof backend.drop !== 'function') {
      addMessage({ sender: 'system', text: 'This backend does not support drop.' });
      return;
    }
    await backend.drop();
    const diff = await backend.diff();
    setDiff(diff);
    addMessage({ sender: 'system', text: 'All changes have been dropped.' });
  }
}

module.exports = DropCommand;
