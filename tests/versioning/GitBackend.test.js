const GitBackend = require('../../src/versioning/GitBackend');
const execa = require('execa');
const fs = require('fs');

jest.mock('execa');

describe('GitBackend', () => {
  let backend;
  beforeEach(() => {
    backend = new GitBackend();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should add a file', async () => {
    await backend.add('file.txt');
    expect(execa).toHaveBeenCalledWith('git', ['add', 'file.txt']);
  });

  it('should commit a file', async () => {
    await backend.commit('message');
    expect(execa).toHaveBeenCalledWith('git', ['commit', '-m', 'message']);
  });

  it('should revert a commit', async () => {
    await backend.unrecord('hash');
    expect(execa).toHaveBeenCalledWith('git', ['revert', '--no-edit', 'hash']);
  });

  it('should create a branch', async () => {
    await backend.channel('new-branch');
    expect(execa).toHaveBeenCalledWith('git', ['checkout', '-b', 'new-branch']);
  });

  it('should apply a patch', async () => {
    await backend.apply('patch.diff');
    expect(execa).toHaveBeenCalledWith('git', ['apply', 'patch.diff']);
  });

  it('should list conflicts', async () => {
    execa.mockResolvedValue({ stdout: 'U file1.txt\nU file2.txt' });
    const conflicts = await backend.conflicts();
    expect(execa).toHaveBeenCalledWith('git', ['status', '--porcelain']);
    expect(conflicts).toBe(JSON.stringify(['file1.txt', 'file2.txt'], null, 2));
  });

  it('should revert a file', async () => {
    await backend.revert('file.txt');
    expect(execa).toHaveBeenCalledWith('git', ['checkout', 'HEAD', '--', 'file.txt']);
  });

  it('should show the diff', async () => {
    execa.mockResolvedValue({ stdout: 'diff --git a/file.txt b/file.txt' });
    const diff = await backend.diff();
    expect(execa).toHaveBeenCalledWith('git', ['diff']);
    expect(diff).toBe('diff --git a/file.txt b/file.txt');
  });
});
