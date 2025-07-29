class ChannelCommand {
  constructor(aider) {
    this.aider = aider;
  }

  async execute(args) {
    if (typeof this.aider.backend.channel === 'function') {
      const subcommand = args[0];
      const name = args[1];
      if (subcommand === 'new') {
        await this.aider.backend.channel(subcommand, name);
        this.aider.addMessage({ sender: 'system', text: `Created channel ${name}` });
      } else if (subcommand === 'switch') {
        await this.aider.backend.channel(subcommand, name);
        this.aider.addMessage({ sender: 'system', text: `Switched to channel ${name}` });
      } else if (subcommand === 'list') {
        const channels = await this.aider.backend.channel(subcommand);
        this.aider.addMessage({ sender: 'system', text: `Channels:\n${channels}` });
      } else {
        this.aider.addMessage({ sender: 'system', text: 'Usage: /channel [new|switch|list] [name]' });
      }
    } else {
      this.aider.addMessage({ sender: 'system', text: 'This backend does not support channels.' });
    }
  }
}

module.exports = ChannelCommand;
