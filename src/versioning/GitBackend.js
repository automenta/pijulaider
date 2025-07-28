const execa = require('execa');
const VersioningBackend = require('./VersioningBackend');

class GitBackend extends VersioningBackend {
  constructor(execa) {
    super();
    this.execa = execa;
  }

  async add(file) {
    try {
      await this.execa('git', ['add', file]);
    } catch (error) {
      console.error(`Error adding file ${file} to Git:`, error);
    }
  }

  async commit(message) {
    try {
      await this.execa('git', ['commit', '-m', message]);
    } catch (error) {
      console.error('Error committing to Git:', error);
    }
  }

  async record(message) {
    return this.commit(message);
  }

  async unrecord(hash) {
    try {
      await this.execa('git', ['revert', '--no-edit', hash]);
    } catch (error) {
      console.error(`Error reverting commit ${hash} in Git:`, error);
    }
  }

  async channel(subcommand, name) {
    try {
      if (subcommand === 'new') {
        await this.execa('git', ['checkout', '-b', name]);
      } else if (subcommand === 'switch') {
        try {
          await this.execa('git', ['checkout', name]);
        } catch (error) {
          if (error.stderr.includes('did not match any file(s) known to git')) {
            await this.execa('git', ['checkout', '-b', name]);
          } else {
            throw error;
          }
        }
      } else if (subcommand === 'list') {
        const { stdout } = await this.execa('git', ['branch']);
        return stdout;
      }
    } catch (error) {
      console.error(`Error with channel command in Git:`, error);
      throw error;
    }
  }

  async patch(subcommand, name) {
    try {
      if (subcommand === 'list') {
        const { stdout } = await this.execa('git', ['log', '--oneline']);
        return stdout;
      } else if (subcommand === 'apply') {
        const { stdout } = await this.execa('git', ['show', name]);
        await this.apply(stdout);
      }
    } catch (error) {
      console.error(`Error with patch command in Git:`, error);
      throw error;
    }
  }

  async apply(patch) {
    try {
      await this.execa('git', ['apply', '--check', patch]);
      await this.execa('git', ['apply', patch]);
    } catch (error) {
      console.error(`Error applying patch in Git:`, error);
    }
  }

  async conflicts() {
    try {
      const { stdout } = await this.execa('git', ['status', '--porcelain']);
      const conflicts = stdout
        .split('\n')
        .filter((line) => line.startsWith('U'))
        .map((line) => line.split(' ')[1]);
      return JSON.stringify(conflicts, null, 2);
    } catch (error) {
      console.error('Error getting conflicts from Git:', error);
      return '';
    }
  }

  async revert(file) {
    try {
      await this.execa('git', ['checkout', 'HEAD', '--', file]);
    } catch (error) {
      console.error(`Error reverting file ${file} in Git:`, error);
    }
  }

  async diff() {
    try {
      const { stdout } = await this.execa('git', ['diff']);
      return stdout;
    } catch (error) {
      console.error('Error getting diff from Git:', error);
      return '';
    }
  }

  async undo() {
    await this.unrecord('HEAD');
  }
}

module.exports = GitBackend;
