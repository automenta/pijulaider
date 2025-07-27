const fs = require('fs');
const path = require('path');
const VersioningBackend = require('./VersioningBackend');

class FileBackend extends VersioningBackend {
  constructor() {
    super();
    this.files = new Set();
  }

  /**
   * @param {string} file
   */
  add(file) {
    this.files.add(file);
  }

  /**
   * @param {string} message
   */
  commit(message) {
    for (const file of this.files) {
      const backupFile = `${file}.${new Date().toISOString()}.bak`;
      fs.copyFileSync(file, backupFile);
    }
    this.files.clear();
  }

  /**
   * @param {string} file
   */
  revert(file) {
    // Not implemented for FileBackend
  }

  /**
   * @returns {string}
   */
  diff() {
    // Not implemented for FileBackend
    return '';
  }
}

module.exports = FileBackend;
