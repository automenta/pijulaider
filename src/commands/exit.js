class ExitCommand {
  constructor(dependencies) {
    this.dependencies = dependencies;
  }

  async execute() {
    const { getTerminal, setTerminal, addMessage } = this.dependencies;
    const terminal = getTerminal();
    if (terminal) {
      terminal.ptyProcess.kill();
      setTerminal(null);
      addMessage({ sender: 'system', text: 'Terminal session ended.' });
    }
  }
}

module.exports = ExitCommand;
