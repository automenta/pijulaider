class UnrecordCommand {
  constructor(dependencies) {
    this.dependencies = dependencies;
  }

  async execute(args) {
    const { getBackend, addMessage } = this.dependencies;
    const backend = getBackend();
    if (typeof backend.unrecord === 'function') {
      await backend.unrecord(args[0]);
      addMessage({ sender: 'system', text: `Unrecorded change ${args[0]}` });
    } else {
      addMessage({ sender: 'system', text: 'This backend does not support unrecord.' });
    }
  }
}

module.exports = UnrecordCommand;
