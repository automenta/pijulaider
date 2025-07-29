class UndoCommand {
  constructor(dependencies) {
    this.dependencies = dependencies;
  }

  async execute() {
    const { getBackend, addMessage, setDiff } = this.dependencies;
    const backend = getBackend();
    await backend.undo();
    const diff = await backend.diff();
    setDiff(diff);
    addMessage({ sender: 'system', text: 'Undid the last change.' });
  }
}

module.exports = UndoCommand;
