class UndoCommand {
  constructor(aider) {
    this.aider = aider;
  }

  async execute() {
    await this.aider.backend.undo();
    this.aider.diff = await this.aider.backend.diff();
    this.aider.addMessage({ sender: 'system', text: 'Undid the last change.' });
  }
}

module.exports = UndoCommand;
