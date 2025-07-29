const fs = require('fs').promises;
const path = require('path');
const { runCommand } = require('../util');
const VersioningBackend = require('./VersioningBackend');

class FileBackend extends VersioningBackend {
  constructor() {
    super();
    this.files = new Map();
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
    const backupFile = this.files.get(file);
    if (backupFile) {
      await fs.unlink(backupFile);
      this.files.delete(file);
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
    const backupFile = this.files.get(file);
    if (backupFile) {
      await fs.copyFile(backupFile, file);
    }
  }

  async undo() {
    for (const file of this.files.keys()) {
      await this.revert(file);
    }
  }

  async diff() {
    const diffs = [];
    for (const [file, backupFile] of this.files) {
      const { stdout } = await runCommand('diff', ['-u', backupFile, file], { reject: false });
      diffs.push(stdout);
    }
    return diffs.join('\n');
  }

  async clear() {
    for (const backupFile of this.files.values()) {
      await fs.unlink(backupFile);
    }
    this.files.clear();
  }

  async listTrackedFiles() {
    return Array.from(this.files.keys());
  }

  async listUntrackedFiles() {
    return [];
  }
}

module.exports = FileBackend;
