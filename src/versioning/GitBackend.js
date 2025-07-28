const execa = require('execa');
const VersioningBackend = require('./VersioningBackend');

class GitBackend extends VersioningBackend {
  async add(file) {
    try {
      await execa('git', ['add', file]);
    } catch (error) {
      console.error(`Error adding file ${file} to Git:`, error);
    }
  }

  async commit(message) {
    try {
      await execa('git', ['commit', '-m', message]);
    } catch (error) {
      console.error('Error committing to Git:', error);
    }
  }

  async record(message) {
    return this.commit(message);
  }

  async unrecord(hash) {
    try {
      await execa('git', ['revert', '--no-edit', hash]);
    } catch (error) {
      console.error(`Error reverting commit ${hash} in Git:`, error);
    }
  }

  async channel(name) {
    try {
      await execa('git', ['checkout', '-b', name]);
    } catch (error) {
      console.error(`Error creating branch ${name} in Git:`, error);
    }
  }

  async apply(patch) {
    try {
      await execa('git', ['apply', patch]);
    } catch (error) {
      console.error(`Error applying patch in Git:`, error);
    }
  }

  async conflicts() {
    try {
      const { stdout } = await execa('git', ['status', '--porcelain']);
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
      await execa('git', ['checkout', 'HEAD', '--', file]);
    } catch (error) {
      console.error(`Error reverting file ${file} in Git:`, error);
    }
  }

  async diff() {
    try {
      const { stdout } = await execa('git', ['diff']);
      return stdout;
    } catch (error) {
      console.error('Error getting diff from Git:', error);
      return '';
    }
  }
}

module.exports = GitBackend;
