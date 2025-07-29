class PatchCommand {
  constructor(aider) {
    this.aider = aider;
  }

  async execute(args) {
    if (typeof this.aider.backend.patch === 'function') {
      const subcommand = args[0];
      const name = args[1];
      if (subcommand === 'list') {
        const patches = await this.aider.backend.patch(subcommand);
        this.aider.addMessage({ sender: 'system', text: `Patches:\n${patches}` });
      } else if (subcommand === 'apply') {
        await this.aider.backend.apply(name);
        this.aider.addMessage({ sender: 'system', text: `Applied patch ${name}` });
      } else {
        this.aider.addMessage({ sender: 'system', text: 'Usage: /patch [list|apply] [hash]' });
      }
    } else {
      this.aider.addMessage({ sender: 'system', text: 'This backend does not support patches.' });
    }
  }
}

module.exports = PatchCommand;
