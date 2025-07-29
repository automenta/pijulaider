const { runCommand } = require('../util');
const VersioningBackend = require('./VersioningBackend');

class GitBackend extends VersioningBackend {
  async add(file) {
    await runCommand('git', ['add', file]);
  }

  async commit(message) {
    await runCommand('git', ['commit', '-m', message]);
  }

  async record(message) {
    return this.commit(message);
  }

  async unrecord(hash) {
    await runCommand('git', ['revert', '--no-edit', hash]);
  }

  async channel(subcommand, name) {
    if (subcommand === 'new') {
      await runCommand('git', ['checkout', '-b', name]);
    } else if (subcommand === 'switch') {
      try {
        await runCommand('git', ['checkout', name]);
      } catch (error) {
        if (error.message.includes('did not match any file(s) known to git')) {
          await runCommand('git', ['checkout', '-b', name]);
        } else {
          throw error;
        }
      }
    } else if (subcommand === 'list') {
      const { stdout } = await runCommand('git', ['branch']);
      return stdout;
    }
  }

  async patch(subcommand, name) {
    if (subcommand === 'list') {
      const { stdout } = await runCommand('git', ['log', '--oneline']);
      return stdout;
    } else if (subcommand === 'apply') {
      const { stdout } = await runCommand('git', ['show', name]);
      await this.apply(stdout);
    }
  }

  async apply(patch) {
    await runCommand('git', ['apply', '--check'], { input: patch });
    await runCommand('git', ['apply'], { input: patch });
  }

  async conflicts() {
    const { stdout } = await runCommand('git', ['status', '--porcelain']);
    const conflicts = stdout
      .split('\n')
      .filter((line) => line.startsWith('U'))
      .map((line) => line.split(' ')[1]);
    return JSON.stringify(conflicts, null, 2);
  }

  async revert(file) {
    await runCommand('git', ['checkout', 'HEAD', '--', file]);
  }

  async diff() {
    const { stdout } = await runCommand('git', ['diff']);
    return stdout;
  }

  async status() {
    const { stdout } = await runCommand('git', ['status']);
    return stdout;
  }

  async undo() {
    await this.unrecord('HEAD');
  }
}

module.exports = GitBackend;
