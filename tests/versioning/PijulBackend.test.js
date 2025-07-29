const PijulBackend = require('../../src/versioning/PijulBackend');
const { runCommand } = require('../util');

jest.mock('../util');

describe('PijulBackend', () => {
  let backend;

  beforeEach(() => {
    runCommand.mockClear();
    backend = new PijulBackend();
  });

  it('should add a file', async () => {
    const file = 'test.txt';
    await backend.add(file);
    expect(runCommand).toHaveBeenCalledWith('pijul', ['add', file]);
  });

  it('should record changes', async () => {
    const message = 'test record';
    await backend.record(message);
    expect(runCommand).toHaveBeenCalledWith('pijul', ['record', '-m', message]);
  });

  it('should unrecord a change', async () => {
    const hash = '12345';
    await backend.unrecord(hash);
    expect(runCommand).toHaveBeenCalledWith('pijul', ['unrecord', hash]);
  });

  it('should switch to a channel', async () => {
    const name = 'test-channel';
    await backend.channel('switch', name);
    expect(runCommand).toHaveBeenCalledWith('pijul', ['channel', 'switch', name]);
  });

  it('should apply a patch', async () => {
    const patch = 'test.patch';
    await backend.apply(patch);
    expect(runCommand).toHaveBeenCalledWith('pijul', ['apply', patch]);
  });

  it('should get a diff', async () => {
    runCommand.mockResolvedValue({ stdout: 'diff --git a/test.txt b/test.txt\n--- a/test.txt\n+++ b/test.txt\n@@ -1 +1 @@\n-original\n+modified' });
    const diff = await backend.diff();
    expect(diff).toContain('-original');
    expect(diff).toContain('+modified');
    expect(runCommand).toHaveBeenCalledWith('pijul', ['diff']);
  });

  it('should revert a file', async () => {
    const file = 'test.txt';
    await backend.revert(file);
    expect(runCommand).toHaveBeenCalledWith('pijul', ['reset', file]);
  });
});
