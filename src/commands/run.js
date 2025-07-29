const pty = require('node-pty');
const os = require('os');

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

    const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
    const term = pty.spawn(shell, [], {
      name: 'xterm-color',
      cols: 80,
      rows: 30,
      cwd: process.cwd(),
      env: process.env,
    });

    setTerminal(term);

    term.on('data', function (data) {
      addMessage({ sender: 'system', text: data });
    });

    term.on('exit', () => {
      setTerminal(null);
    });

    if (args.length > 0) {
      term.write(args.join(' ') + '\r');
    }
  }
}

module.exports = RunCommand;
