class UnrecordCommand {
  constructor(aider) {
    this.aider = aider;
  }

  async execute(args) {
    if (typeof this.aider.backend.unrecord === 'function') {
      await this.aider.backend.unrecord(args[0]);
      this.aider.addMessage({ sender: 'system', text: `Unrecorded change ${args[0]}` });
    } else {
      this.aider.addMessage({ sender: 'system', text: 'This backend does not support unrecord.' });
    }
  }
}

module.exports = UnrecordCommand;
