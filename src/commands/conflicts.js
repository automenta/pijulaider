class ConflictsCommand {
  constructor(aider) {
    this.aider = aider;
  }

  async execute() {
    if (typeof this.aider.backend.conflicts === 'function') {
      const conflicts = await this.aider.backend.conflicts();
      try {
        const parsedConflicts = JSON.parse(conflicts);
        if (Array.isArray(parsedConflicts) && parsedConflicts.length > 0) {
          let conflictMessage = 'Conflicts:\n';
          for (const conflict of parsedConflicts) {
            if (typeof conflict === 'string') {
              conflictMessage += `- ${conflict}\n`;
            } else if (typeof conflict === 'object' && conflict.hash) {
              conflictMessage += `- ${conflict.hash}\n`;
            }
          }
          this.aider.addMessage({ sender: 'system', text: conflictMessage });
        } else {
          this.aider.addMessage({ sender: 'system', text: 'No conflicts found.' });
        }
      } catch (error) {
        this.aider.addMessage({ sender: 'system', text: conflicts });
      }
    } else {
      this.aider.addMessage({ sender: 'system', text: 'This backend does not support conflicts.' });
    }
  }
}

module.exports = ConflictsCommand;
