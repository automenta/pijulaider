const { runCommand } = require('../util');
const VersioningBackend = require('./VersioningBackend');

class PijulBackend extends VersioningBackend {
  async add(file) {
    await runCommand('pijul', ['add', file]);
  }

  async record(message) {
    await runCommand('pijul', ['record', '-m', message]);
  }

  async unrecord(hash) {
    await runCommand('pijul', ['unrecord', hash]);
  }

  async diff() {
    const { stdout } = await runCommand('pijul', ['diff']);
    return stdout;
  }

  async channel(subcommand, name) {
    if (subcommand === 'new') {
      await runCommand('pijul', ['channel', 'new', name]);
    } else if (subcommand === 'switch') {
      await runCommand('pijul', ['channel', 'switch', name]);
    } else if (subcommand === 'list') {
      const { stdout } = await runCommand('pijul', ['channel']);
      return stdout;
    }
  }

  async patch(subcommand, name) {
    if (subcommand === 'add') {
      await runCommand('pijul', ['patch', 'add', name]);
    } else if (subcommand === 'list') {
      const { stdout } = await runCommand('pijul', ['log']);
      return stdout;
    }
  }

  async apply(patch) {
    await runCommand('pijul', ['apply', patch]);
  }

  async conflicts() {
    const { stdout } = await runCommand('pijul', ['credit']);
    const conflicts = stdout
      .split('\n')
      .filter((line) => line.startsWith('C'))
      .map((line) => {
        const parts = line.split(' ');
        return {
          hash: parts[1],
          author: parts[2],
          date: parts[3],
        };
      });
    return JSON.stringify(conflicts, null, 2);
  }

  async revert(file) {
    await runCommand('pijul', ['reset', file]);
  }

  async undo() {
    const { stdout } = await runCommand('pijul', ['log', '--limit', '1', '--hash-only']);
    const hash = stdout.trim();
    if (hash) {
      await this.unrecord(hash);
    }
  }
}

module.exports = PijulBackend;
