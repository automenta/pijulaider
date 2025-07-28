const { execa } = require('execa');
const VersioningBackend = require('./VersioningBackend');

class PijulBackend extends VersioningBackend {
  async add(file) {
    await execa('pijul', ['add', file]);
  }

  async record(message) {
    await execa('pijul', ['record', '-m', message]);
  }

  async commit(message) {
    return this.record(message);
  }

  async unrecord(hash) {
    await execa('pijul', ['unrecord', hash]);
  }

  async revert(file) {
    // Pijul doesn't have a direct equivalent of `git checkout -- <file>`
    // The closest is to unrecord the last patch that touched the file.
    // This is a simplified implementation. A more robust solution would involve
    // finding the last patch that modified the file and unrecording it.
    console.warn(
      'PijulBackend.revert is not fully implemented and may not work as expected.'
    );
    const { stdout } = await execa('pijul', ['log', '--', file]);
    const lastPatch = stdout.split('\n')[0].split(' ')[1];
    if (lastPatch) {
      await this.unrecord(lastPatch);
    }
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
    const { stdout } = await execa('pijul', ['diff', '--conflicts']);
    return stdout;
  }
}

module.exports = PijulBackend;
