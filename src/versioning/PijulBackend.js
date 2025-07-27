const execa = require('execa');
const VersioningBackend = require('./VersioningBackend');

class PijulBackend extends VersioningBackend {
  async add(file) {
    await execa('pijul', ['add', file]);
  }

  async record(message) {
    await execa('pijul', ['record', '-m', message]);
  }

  async unrecord(hash) {
    await execa('pijul', ['unrecord', hash]);
  }

  async diff() {
    const { stdout } = await execa('pijul', ['diff']);
    return stdout;
  }

  async channel(name) {
    await execa('pijul', ['channel', 'switch', name]);
  }

  async patch(name) {
    await execa('pijul', ['patch', 'add', name]);
  }

  async apply(patch) {
    await execa('pijul', ['apply', patch]);
  }

  async conflicts() {
    const { stdout } = await execa('pijul', ['credit']);
    return stdout;
  }
}

module.exports = PijulBackend;
