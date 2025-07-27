const fs = require('fs');
const path = require('path');
const FileBackend = require('../../src/versioning/FileBackend');

describe('FileBackend', () => {
  const testFile = 'test.txt';
  const testFileContent = 'hello world';

  beforeEach(() => {
    fs.writeFileSync(testFile, testFileContent);
  });

  afterEach(() => {
    fs.unlinkSync(testFile);
    const backupFile = fs.readdirSync('.').find(f => f.startsWith(testFile) && f.endsWith('.bak'));
    if (backupFile) {
      fs.unlinkSync(backupFile);
    }
  });

  it('should create a backup when adding a file', () => {
    const backend = new FileBackend();
    backend.add(testFile);
    const backupFile = fs.readdirSync('.').find(f => f.startsWith(testFile) && f.endsWith('.bak'));
    expect(backupFile).toBeDefined();
    const backupContent = fs.readFileSync(backupFile, 'utf-8');
    expect(backupContent).toBe(testFileContent);
  });

  it('should revert a file to its backup', () => {
    const backend = new FileBackend();
    backend.add(testFile);
    const newContent = 'goodbye world';
    fs.writeFileSync(testFile, newContent);
    backend.revert(testFile);
    const revertedContent = fs.readFileSync(testFile, 'utf-8');
    expect(revertedContent).toBe(testFileContent);
  });

  it('should show the diff between a file and its backup', async () => {
    const backend = new FileBackend();
    backend.add(testFile);
    const newContent = 'goodbye world';
    fs.writeFileSync(testFile, newContent);
    const diff = await backend.diff();
    expect(diff).toContain('-hello world');
    expect(diff).toContain('+goodbye world');
  });
});
