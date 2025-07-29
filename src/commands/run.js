const Terminal = require('../tui/Terminal');

class RunCommand {
  constructor(dependencies) {
    this.dependencies = dependencies;
  }

  async execute(args) {
    const { addMessage, setTerminal, getTerminal } = this.dependencies;

    if (getTerminal()) {
      getTerminal().write(args.join(' ') + '\r');
      return;
    }

    const terminal = new Terminal((data) => {
      addMessage({ sender: 'system', text: data });
    });

    setTerminal(terminal);

    if (args.length > 0) {
      terminal.write(args.join(' ') + '\r');
    }
  }
}

module.exports = RunCommand;
