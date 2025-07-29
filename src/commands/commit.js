class CommitCommand {
  constructor(dependencies) {
    this.dependencies = dependencies;
  }

  async execute(args) {
    const { getBackend, addMessage } = this.dependencies;
    const message = args.join(' ');

    if (!message) {
      addMessage({ sender: 'system', text: 'Error: A commit message is required.' });
      return;
    }

    try {
      await getBackend().record(message);
      addMessage({ sender: 'system', text: 'Changes committed.' });
    } catch (error) {
      addMessage({ sender: 'system', text: `Error: ${error.message}` });
    }
  }
}

module.exports = CommitCommand;
