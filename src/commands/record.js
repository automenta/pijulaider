class RecordCommand {
  constructor(aider) {
    this.aider = aider;
  }

  async execute(args) {
    await this.aider.backend.record(args.join(' '));
    this.aider.addMessage({ sender: 'system', text: 'Changes recorded.' });
  }
}

module.exports = RecordCommand;
