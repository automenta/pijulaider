const GitBackend = require('../../src/versioning/GitBackend');
const execa = require('execa');

jest.mock('execa');

describe('GitBackend', () => {
  let backend;

  beforeEach(() => {
    backend = new GitBackend();
  });

  it('should add a file', async () => {
    const file = 'test.txt';
    await backend.add(file);
    expect(execa).toHaveBeenCalledWith('git', ['add', file]);
  });

  it('should commit changes', async () => {
    const message = 'test commit';
    await backend.commit(message);
    expect(execa).toHaveBeenCalledWith('git', ['commit', '-m', message]);
  });

  it('should revert a commit', async () => {
    const hash = '12345';
    await backend.unrecord(hash);
    expect(execa).toHaveBeenCalledWith('git', ['revert', '--no-edit', hash]);
  });

  it('should create a branch', async () => {
    const name = 'test-branch';
    await backend.channel(name);
    expect(execa).toHaveBeenCalledWith('git', ['checkout', '-b', name]);
  });

  it('should apply a patch', async () => {
    const patch = 'test.patch';
    await backend.apply(patch);
    expect(execa).toHaveBeenCalledWith('git', ['apply', patch]);
  });

  it('should get a diff', async () => {
    execa.mockResolvedValue({ stdout: 'diff --git a/test.txt b/test.txt\n--- a/test.txt\n+++ b/test.txt\n@@ -1 +1 @@\n-original\n+modified' });
    const diff = await backend.diff();
    expect(diff).toContain('-original');
    expect(diff).toContain('+modified');
    expect(execa).toHaveBeenCalledWith('git', ['diff']);
  });
});
