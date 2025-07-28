const execa = require('execa');
const VersioningBackend = require('./VersioningBackend');

class PijulBackend extends VersioningBackend {
  async add(file) {
    try {
      await execa('pijul', ['add', file]);
    } catch (error) {
      console.error(`Error adding file ${file} to Pijul:`, error);
    }
  }

  async record(message) {
    try {
      await execa('pijul', ['record', '-m', message]);
    } catch (error) {
      console.error('Error recording changes in Pijul:', error);
    }
  }

  async unrecord(hash) {
    try {
      await execa('pijul', ['unrecord', hash]);
    } catch (error) {
      console.error(`Error unrecording change ${hash} in Pijul:`, error);
    }
  }

  async diff() {
    try {
      const { stdout } = await execa('pijul', ['diff']);
      return stdout;
    } catch (error) {
      console.error('Error gettings diff from Pijul:', error);
      return '';
    }
  }

  async channel(name) {
    try {
      await execa('pijul', ['channel', 'switch', name]);
    } catch (error) {
      console.error(`Error switching to channel ${name} in Pijul:`, error);
    }
  }

  async patch(name) {
    try {
      await execa('pijul', ['patch', 'add', name]);
    } catch (error) {
      console.error(`Error creating patch ${name} in Pijul:`, error);
    }
  }

  async apply(patch) {
    try {
      await execa('pijul', ['apply', patch]);
    } catch (error) {
      console.error(`Error applying patch ${patch} in Pijul:`, error);
    }
  }

  async conflicts() {
    try {
      const { stdout } = await execa('pijul', ['credit']);
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
}

module.exports = PijulBackend;
