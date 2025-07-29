class DiffCommand {
  constructor(aider) {
    this.aider = aider;
  }

  async execute() {
    this.aider.diff = await this.aider.backend.diff();
    this.aider.addMessage({ sender: 'system', text: 'Diff updated.' });
  }
}

module.exports = DiffCommand;
