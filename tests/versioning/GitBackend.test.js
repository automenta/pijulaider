const GitBackend = require('../../src/versioning/GitBackend');
const { runCommand } = require('../util');

jest.mock('../util');

describe('GitBackend', () => {
  let backend;

  beforeEach(() => {
    runCommand.mockClear();
    backend = new GitBackend();
  });

  it('should add a file', async () => {
    const file = 'test.txt';
    await backend.add(file);
    expect(runCommand).toHaveBeenCalledWith('git', ['add', file]);
  });

  it('should record changes', async () => {
    const message = 'test commit';
    await backend.record(message);
    expect(runCommand).toHaveBeenCalledWith('git', ['commit', '-m', message]);
  });

  it('should undo a commit', async () => {
    await backend.unrecord();
    expect(runCommand).toHaveBeenCalledWith('git', ['reset', 'HEAD~']);
  });

  it('should switch to an existing branch', async () => {
    const name = 'test-branch';
    runCommand.mockResolvedValue({ stdout: name });
    await backend.channel('switch', name);
    expect(runCommand).toHaveBeenCalledWith('git', ['branch', '--list', name]);
    expect(runCommand).toHaveBeenCalledWith('git', ['checkout', name]);
  });

  it('should create a new branch if it does not exist', async () => {
    const name = 'test-branch';
    runCommand.mockResolvedValue({ stdout: '' });
    await backend.channel('switch', name);
    expect(runCommand).toHaveBeenCalledWith('git', ['branch', '--list', name]);
    expect(runCommand).toHaveBeenCalledWith('git', ['checkout', '-b', name]);
  });

  it('should apply a patch safely', async () => {
    const patch = 'test.patch';
    await backend.apply(patch);
    expect(runCommand).toHaveBeenCalledWith('git', ['apply', '--check'], { input: patch });
    expect(runCommand).toHaveBeenCalledWith('git', ['apply'], { input: patch });
  });

  it('should get conflicts', async () => {
    runCommand.mockResolvedValue({ stdout: 'UU file1.txt\n' });
    const conflicts = await backend.conflicts();
    expect(JSON.parse(conflicts)).toEqual(['file1.txt']);
  });

  it('should get a diff', async () => {
    runCommand.mockResolvedValue({ stdout: 'diff --git a/test.txt b/test.txt\n--- a/test.txt\n+++ b/test.txt\n@@ -1 +1 @@\n-original\n+modified' });
    const diff = await backend.diff();
    expect(diff).toContain('-original');
    expect(diff).toContain('+modified');
    expect(runCommand).toHaveBeenCalledWith('git', ['diff']);
  });
});
