const execa = require('execa');
const VersioningBackend = require('./VersioningBackend');

class GitBackend extends VersioningBackend {
  async add(file) {
    await execa('git', ['add', file]);
  }

  async commit(message) {
    await execa('git', ['commit', '-m', message]);
  }

  async revert(file) {
    await execa('git', ['checkout', 'HEAD', '--', file]);
  }

  async diff() {
    const { stdout } = await execa('git', ['diff']);
    return stdout;
  }
}

module.exports = GitBackend;
