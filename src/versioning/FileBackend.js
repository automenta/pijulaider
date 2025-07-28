const fs = require('fs');
const path = require('path');
const execa = require('execa');
const VersioningBackend = require('./VersioningBackend');

class FileBackend extends VersioningBackend {
  constructor() {
    super();
    this.files = new Map();
  }

  add(file) {
    try {
      if (!this.files.has(file)) {
        const backupFile = `${file}.${Date.now()}.bak`;
        fs.copyFileSync(file, backupFile);
        this.files.set(file, backupFile);
      }
    } catch (error) {
      console.error(error);
    }
  }

  unstage(file) {
    try {
      const backupFile = this.files.get(file);
      if (backupFile) {
        fs.unlinkSync(backupFile);
        this.files.delete(file);
      }
    } catch (error) {
      console.error(error);
    }
  }

  commit(message) {
    for (const backupFile of this.files.values()) {
      try {
        fs.unlinkSync(backupFile);
      } catch (error) {
        console.error(error);
      }
    }
    this.files.clear();
  }

  record(message) {
    return this.commit(message);
  }

  revert(file) {
    try {
      const backupFile = this.files.get(file);
      if (backupFile) {
        fs.copyFileSync(backupFile, file);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async diff() {
    let diff = '';
    for (const [file, backupFile] of this.files) {
      try {
        const { stdout } = await execa('diff', ['-u', backupFile, file], { reject: false });
        diff += stdout;
      } catch (error) {
        console.error(error);
      }
    }
    return diff;
  }

  clear() {
    for (const backupFile of this.files.values()) {
      try {
        fs.unlinkSync(backupFile);
      } catch (error) {
        console.error(error);
      }
    }
    this.files.clear();
  }
}

module.exports = FileBackend;
