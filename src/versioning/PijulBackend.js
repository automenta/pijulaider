const execa = require('execa');
const VersioningBackend = require('./VersioningBackend');

class PijulBackend extends VersioningBackend {
  async add(file) {
    try {
      await execa('pijul', ['add', file]);
    } catch (error) {
      console.error(error);
    }
  }

  async record(message) {
    try {
      await execa('pijul', ['record', '-m', message]);
    } catch (error) {
      console.error(error);
    }
  }

  async unrecord(hash) {
    try {
      await execa('pijul', ['unrecord', hash]);
    } catch (error) {
      console.error(error);
    }
  }

  async diff() {
    try {
      const { stdout } = await execa('pijul', ['diff']);
      return stdout;
    } catch (error) {
      console.error(error);
      return '';
    }
  }

  async channel(name) {
    try {
      await execa('pijul', ['channel', 'switch', name]);
    } catch (error) {
      console.error(error);
    }
  }

  async patch(name) {
    try {
      await execa('pijul', ['patch', 'add', name]);
    } catch (error) {
      console.error(error);
    }
  }

  async apply(patch) {
    try {
      await execa('pijul', ['apply', patch]);
    } catch (error) {
      console.error(error);
    }
  }

  async conflicts() {
    try {
      const { stdout } = await execa('pijul', ['credit']);
      return stdout;
    } catch (error) {
      console.error(error);
      return '';
    }
  }
}

module.exports = PijulBackend;
