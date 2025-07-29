class ChannelCommand {
  constructor(dependencies) {
    this.dependencies = dependencies;
  }

  async execute(args) {
    const { getBackend, addMessage } = this.dependencies;
    const backend = getBackend();
    if (typeof backend.channel === 'function') {
      const subcommand = args[0];
      const name = args[1];
      if (subcommand === 'new') {
        await backend.channel(subcommand, name);
        addMessage({ sender: 'system', text: `Created channel ${name}` });
      } else if (subcommand === 'switch') {
        await backend.channel(subcommand, name);
        addMessage({ sender: 'system', text: `Switched to channel ${name}` });
      } else if (subcommand === 'list') {
        const channels = await backend.channel(subcommand);
        addMessage({ sender: 'system', text: `Channels:\n${channels}` });
      } else {
        addMessage({ sender: 'system', text: 'Usage: /channel [new|switch|list] [name]' });
      }
    } else {
      addMessage({ sender: 'system', text: 'This backend does not support channels.' });
    }
  }
}

module.exports = ChannelCommand;
