class UndoCommand {
  constructor(dependencies) {
    this.dependencies = dependencies;
  }

  async execute(args) {
    const { getBackend, addMessage, setDiff } = this.dependencies;
    const backend = getBackend();
    const file = args[0];

    if (file) {
      await backend.revert(file);
      addMessage({ sender: 'system', text: `Reverted changes to ${file}.` });
    } else {
      await backend.revertAll();
      addMessage({ sender: 'system', text: 'Reverted all changes.' });
    }

    const diff = await backend.diff();
    setDiff(diff);
  }
}

module.exports = UndoCommand;
