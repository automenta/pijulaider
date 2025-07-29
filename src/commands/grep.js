const { exec } = require('child_process');

class GrepCommand {
  constructor(dependencies) {
    this.dependencies = dependencies;
  }

  async execute(args) {
    const { addMessage } = this.dependencies;
    const [pattern, ...files] = args;

    if (!pattern) {
      addMessage({ sender: 'system', text: 'Usage: /grep <pattern> [files...]' });
      return;
    }

    const command = `grep -r "${pattern}" ${files.join(' ')}`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        addMessage({ sender: 'system', text: `Error: ${stderr}` });
        return;
      }
      addMessage({ sender: 'system', text: stdout });
    });
  }
}

module.exports = GrepCommand;
