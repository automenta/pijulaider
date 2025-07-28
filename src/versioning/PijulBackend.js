const execa = require('execa');
const VersioningBackend = require('./VersioningBackend');

class PijulBackend extends VersioningBackend {
  constructor(execa) {
    super();
    this.execa = execa;
  }

  async add(file) {
    try {
      await this.execa('pijul', ['add', file]);
    } catch (error) {
      console.error(`Error adding file ${file} to Pijul:`, error);
    }
  }

  async record(message) {
    try {
      await this.execa('pijul', ['record', '-m', message]);
    } catch (error) {
      console.error('Error recording changes in Pijul:', error);
    }
  }

  async unrecord(hash) {
    try {
      await this.execa('pijul', ['unrecord', hash]);
    } catch (error) {
      console.error(`Error unrecording change ${hash} in Pijul:`, error);
    }
  }

  async diff() {
    try {
      const { stdout } = await this.execa('pijul', ['diff']);
      return stdout;
    } catch (error) {
      console.error('Error gettings diff from Pijul:', error);
      return '';
    }
  }

  async channel(subcommand, name) {
    try {
      if (subcommand === 'new') {
        await this.execa('pijul', ['channel', 'new', name]);
      } else if (subcommand === 'switch') {
        await this.execa('pijul', ['channel', 'switch', name]);
      } else if (subcommand === 'list') {
        const { stdout } = await this.execa('pijul', ['channel']);
        return stdout;
      }
    } catch (error) {
      console.error(`Error with channel command in Pijul:`, error);
      throw error;
    }
  }

  async patch(subcommand, name) {
    try {
      if (subcommand === 'add') {
        await this.execa('pijul', ['patch', 'add', name]);
      } else if (subcommand === 'list') {
        const { stdout } = await this.execa('pijul', ['log']);
        return stdout;
      }
    } catch (error) {
      console.error(`Error with patch command in Pijul:`, error);
      throw error;
    }
  }

  async apply(patch) {
    try {
      await this.execa('pijul', ['apply', patch]);
    } catch (error) {
      console.error(`Error applying patch ${patch} in Pijul:`, error);
    }
  }

  async conflicts() {
    try {
      const { stdout } = await this.execa('pijul', ['credit']);
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
    } catch (error) {
      console.error('Error getting conflicts from Pijul:', error);
      return '';
    }
  }

  async revert(file) {
    try {
      await this.execa('pijul', ['reset', file]);
    } catch (error) {
      console.error(`Error reverting file ${file} in Pijul:`, error);
    }
  }

  async undo() {
    try {
      const { stdout } = await this.execa('pijul', ['log', '--limit', '1', '--hash-only']);
      const hash = stdout.trim();
      if (hash) {
        await this.unrecord(hash);
      }
    } catch (error) {
      console.error('Error undoing last change in Pijul:', error);
    }
  }
}

module.exports = PijulBackend;
