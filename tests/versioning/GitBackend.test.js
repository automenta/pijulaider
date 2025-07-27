const fs = require('fs');
const path = require('path');
const execa = require('execa');
const GitBackend = require('../../src/versioning/GitBackend');

describe('GitBackend', () => {
  const testFile = 'test.txt';
  const testFileContent = 'hello world';

  beforeEach(async () => {
    await execa('git', ['init']);
    fs.writeFileSync(testFile, testFileContent);
    await execa('git', ['add', testFile]);
    await execa('git', ['commit', '-m', 'initial commit']);
  });

  afterEach(async () => {
    fs.unlinkSync(testFile);
    await execa('rm', ['-rf', '.git']);
  });

  it('should add a file to the index', async () => {
    const backend = new GitBackend();
    const newFile = 'new.txt';
    fs.writeFileSync(newFile, 'new file');
    await backend.add(newFile);
    const { stdout } = await execa('git', ['status', '--porcelain']);
    expect(stdout).toContain('A  new.txt');
    fs.unlinkSync(newFile);
  });

  it('should commit a file', async () => {
    const backend = new GitBackend();
    const newContent = 'goodbye world';
    fs.writeFileSync(testFile, newContent);
    await backend.add(testFile);
    await backend.commit('new commit');
    const { stdout } = await execa('git', ['log', '-1', '--pretty=%B']);
    expect(stdout).toContain('new commit');
  });

  it('should revert a file', async () => {
    const backend = new GitBackend();
    const newContent = 'goodbye world';
    fs.writeFileSync(testFile, newContent);
    await backend.revert(testFile);
    const revertedContent = fs.readFileSync(testFile, 'utf-8');
    expect(revertedContent).toBe(testFileContent);
  });

  it('should show the diff', async () => {
    const backend = new GitBackend();
    const newContent = 'goodbye world';
    fs.writeFileSync(testFile, newContent);
    const diff = await backend.diff();
    expect(diff).toContain('-hello world');
    expect(diff).toContain('+goodbye world');
  });
});
