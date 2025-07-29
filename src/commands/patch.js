class PatchCommand {
  constructor(dependencies) {
    this.dependencies = dependencies;
  }

  async execute(args) {
    const { getBackend, addMessage } = this.dependencies;
    const backend = getBackend();
    if (typeof backend.patch === 'function') {
      const subcommand = args[0];
      const name = args[1];
      if (subcommand === 'list') {
        const patches = await backend.patch(subcommand);
        addMessage({ sender: 'system', text: `Patches:\n${patches}` });
      } else if (subcommand === 'apply') {
        await backend.apply(name);
        addMessage({ sender: 'system', text: `Applied patch ${name}` });
      } else {
        addMessage({ sender: 'system', text: 'Usage: /patch [list|apply] [hash]' });
      }
    } else {
      addMessage({ sender: 'system', text: 'This backend does not support patches.' });
    }
  }
}

module.exports = PatchCommand;
