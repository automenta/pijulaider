class ConflictsCommand {
  constructor(dependencies) {
    this.dependencies = dependencies;
  }

  async execute() {
    const { getBackend, addMessage } = this.dependencies;
    const backend = getBackend();
    if (typeof backend.conflicts === 'function') {
      const conflicts = await backend.conflicts();
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
          addMessage({ sender: 'system', text: conflictMessage });
        } else {
          addMessage({ sender: 'system', text: 'No conflicts found.' });
        }
      } catch (error) {
        addMessage({ sender: 'system', text: conflicts });
      }
    } else {
      addMessage({ sender: 'system', text: 'This backend does not support conflicts.' });
    }
  }
}

module.exports = ConflictsCommand;
