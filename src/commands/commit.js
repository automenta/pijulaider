class CommitCommand {
  constructor(dependencies) {
    this.dependencies = dependencies;
  }

  async execute(args) {
    const { getBackend, addMessage } = this.dependencies;
    await getBackend().commit(args.join(' '));
    addMessage({ sender: 'system', text: 'Changes committed.' });
  }
}

module.exports = CommitCommand;
