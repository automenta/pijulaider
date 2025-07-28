const fs = require('fs').promises;
const FileBackend = require('../../src/versioning/FileBackend');
const execa = require('execa');

jest.mock('execa');

describe('FileBackend', () => {
  let backend;

  beforeEach(() => {
    execa.mockClear();
    backend = new FileBackend(execa);
  });

  it('should backup a file when adding it', async () => {
    const file = 'test.txt';
    await fs.writeFile(file, 'test');
    await backend.add(file);
    expect(backend.files.has(file)).toBe(true);
    await fs.unlink(file);
    await fs.unlink(backend.files.get(file));
  });

  it('should restore a file when reverting it', async () => {
    const file = 'test.txt';
    const originalContent = 'original';
    const modifiedContent = 'modified';
    await fs.writeFile(file, originalContent);
    await backend.add(file);
    await fs.writeFile(file, modifiedContent);
    await backend.revert(file);
    const revertedContent = await fs.readFile(file, 'utf-8');
    expect(revertedContent).toBe(originalContent);
    await fs.unlink(file);
    await fs.unlink(backend.files.get(file));
  });

  it('should get a diff', async () => {
    const file = 'test.txt';
    const backupFile = 'test.txt.123.bak';
    const originalContent = 'original';
    const modifiedContent = 'modified';
    await fs.writeFile(backupFile, originalContent);
    await fs.writeFile(file, modifiedContent);
    backend.files.set(file, backupFile);
    execa.mockResolvedValue({ stdout: 'diff --git a/test.txt b/test.txt\n--- a/test.txt\n+++ b/test.txt\n@@ -1 +1 @@\n-original\n+modified' });
    const diff = await backend.diff();
    expect(diff).toContain('-original');
    expect(diff).toContain('+modified');
    await fs.unlink(file);
    await fs.unlink(backupFile);
  });

  it('should not throw an error when unrecording', async () => {
    await expect(backend.unrecord('123')).resolves.not.toThrow();
  });

  it('should not throw an error when switching channels', async () => {
    await expect(backend.channel('test')).resolves.not.toThrow();
  });

  it('should not throw an error when applying a patch', async () => {
    await expect(backend.apply('test.patch')).resolves.not.toThrow();
  });

  it('should return an empty array when getting conflicts', async () => {
    const conflicts = await backend.conflicts();
    expect(conflicts).toBe('[]');
  });
});
