const pty = require('node-pty');
const os = require('os');

class Terminal {
  constructor(onData) {
    const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
    this.ptyProcess = pty.spawn(shell, [], {
      name: 'xterm-color',
      cols: 80,
      rows: 30,
      cwd: process.cwd(),
      env: process.env
    });

    this.ptyProcess.on('data', function (data) {
      onData(data);
    });
  }

  write(data) {
    this.ptyProcess.write(data);
  }
}

module.exports = Terminal;
