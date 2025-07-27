const fs = require('fs');
const path = require('path');
const execa = require('execa');
const VersioningBackend = require('./VersioningBackend');

class FileBackend extends VersioningBackend {
  constructor() {
    super();
    this.files = new Map();
  }

  /**
   * @param {string} file
   */
  add(file) {
    if (!this.files.has(file)) {
      const backupFile = `${file}.${Date.now()}.bak`;
      fs.copyFileSync(file, backupFile);
      this.files.set(file, backupFile);
    }
  }

  /**
   * @param {string} message
   */
  commit(message) {
    this.files.clear();
  }

  /**
   * @param {string} file
   */
  revert(file) {
    const backupFile = this.files.get(file);
    if (backupFile) {
      fs.copyFileSync(backupFile, file);
    }
  }

  /**
   * @returns {string}
   */
  async diff() {
    let diff = '';
    for (const [file, backupFile] of this.files) {
      const { stdout } = await execa('diff', ['-u', backupFile, file], { reject: false });
      diff += stdout;
    }
    return diff;
  }
}

module.exports = FileBackend;
