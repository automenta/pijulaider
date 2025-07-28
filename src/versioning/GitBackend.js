const execa = require('execa');
const VersioningBackend = require('./VersioningBackend');

class GitBackend extends VersioningBackend {
  async add(file) {
    try {
      await execa('git', ['add', file]);
    } catch (error) {
      console.error(error);
    }
  }

  async commit(message) {
    try {
      await execa('git', ['commit', '-m', message]);
    } catch (error) {
      console.error(error);
    }
  }

  async record(message) {
    return this.commit(message);
  }

  async revert(file) {
    try {
      await execa('git', ['checkout', 'HEAD', '--', file]);
    } catch (error) {
      console.error(error);
    }
  }

  async diff() {
    try {
      const { stdout } = await execa('git', ['diff']);
      return stdout;
    } catch (error) {
      console.error(error);
      return '';
    }
  }
}

module.exports = GitBackend;
