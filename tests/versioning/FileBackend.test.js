const assert = require('assert');
const fs = require('fs');
const path = require('path');
const FileBackend = require('../../src/versioning/FileBackend');

const TEST_FILE = 'test.txt';

describe('FileBackend', () => {
  beforeEach(() => {
    fs.writeFileSync(TEST_FILE, 'initial content');
  });

  afterEach(() => {
    fs.unlinkSync(TEST_FILE);
    const backupFiles = fs.readdirSync('.').filter(f => f.startsWith(TEST_FILE));
    for (const file of backupFiles) {
      fs.unlinkSync(file);
    }
  });

  it('should create a backup of the file on commit', () => {
    const backend = new FileBackend();
    backend.add(TEST_FILE);
    backend.commit('test commit');

    const backupFiles = fs.readdirSync('.').filter(f => f.startsWith(TEST_FILE) && f.endsWith('.bak'));
    assert.strictEqual(backupFiles.length, 1);

    const backupContent = fs.readFileSync(backupFiles[0], 'utf-8');
    assert.strictEqual(backupContent, 'initial content');
  });
});
