const fs = require('fs').promises;
const path = require('path');
const execa = require('execa');
const VersioningBackend = require('./VersioningBackend');

class FileBackend extends VersioningBackend {
  constructor(execa) {
    super();
    this.files = new Map();
    this.execa = execa;
  }

  async add(file) {
    try {
      await fs.access(file);
      if (!this.files.has(file)) {
        const backupFile = `${file}.${Date.now()}.bak`;
        await fs.copyFile(file, backupFile);
        this.files.set(file, backupFile);
      }
    } catch (error) {
      throw new Error(`File not found: ${file}`);
    }
  }

  async unstage(file) {
    try {
      const backupFile = this.files.get(file);
      if (backupFile) {
        await fs.unlink(backupFile);
        this.files.delete(file);
      }
    } catch (error) {
      console.error(`Error unstaging file ${file}:`, error);
    }
  }

  async record(message) {
    // No-op for file backend
  }

  async unrecord(hash) {
    // No-op for file backend
  }

  async channel(name) {
    // No-op for file backend
  }

  async patch(subcommand, name) {
    // No-op for file backend
  }

  async apply(patch) {
    // No-op for file backend
  }

  async conflicts() {
    return '[]';
  }

  async revert(file) {
    try {
      const backupFile = this.files.get(file);
      if (backupFile) {
        await fs.copyFile(backupFile, file);
      }
    } catch (error) {
      console.error(`Error reverting file ${file}:`, error);
    }
  }

  async undo() {
    for (const file of this.files.keys()) {
      await this.revert(file);
    }
  }

  async diff() {
    let diff = '';
    for (const [file, backupFile] of this.files) {
      try {
        const { stdout } = await this.execa('diff', ['-u', backupFile, file], { reject: false });
        diff += stdout;
      } catch (error) {
        console.error(`Error getting diff for file ${file}:`, error);
      }
    }
    return diff;
  }

  async clear() {
    for (const backupFile of this.files.values()) {
      try {
        await fs.unlink(backupFile);
      } catch (error) {
        console.error(`Error clearing backups:`, error);
      }
    }
    this.files.clear();
  }
}

module.exports = FileBackend;
