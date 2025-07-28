const PijulBackend = require('../../src/versioning/PijulBackend');
const execa = require('execa');

jest.mock('execa');

describe('PijulBackend', () => {
  let backend;

  beforeEach(() => {
    backend = new PijulBackend();
  });

  it('should add a file', async () => {
    const file = 'test.txt';
    await backend.add(file);
    expect(execa).toHaveBeenCalledWith('pijul', ['add', file]);
  });

  it('should record changes', async () => {
    const message = 'test record';
    await backend.record(message);
    expect(execa).toHaveBeenCalledWith('pijul', ['record', '-m', message]);
  });

  it('should unrecord a change', async () => {
    const hash = '12345';
    await backend.unrecord(hash);
    expect(execa).toHaveBeenCalledWith('pijul', ['unrecord', hash]);
  });

  it('should switch to a channel', async () => {
    const name = 'test-channel';
    await backend.channel(name);
    expect(execa).toHaveBeenCalledWith('pijul', ['channel', 'switch', name]);
  });

  it('should apply a patch', async () => {
    const patch = 'test.patch';
    await backend.apply(patch);
    expect(execa).toHaveBeenCalledWith('pijul', ['apply', patch]);
  });

  it('should get a diff', async () => {
    execa.mockResolvedValue({ stdout: 'diff --git a/test.txt b/test.txt\n--- a/test.txt\n+++ b/test.txt\n@@ -1 +1 @@\n-original\n+modified' });
    const diff = await backend.diff();
    expect(diff).toContain('-original');
    expect(diff).toContain('+modified');
    expect(execa).toHaveBeenCalledWith('pijul', ['diff']);
  });

  it('should revert a file', async () => {
    const file = 'test.txt';
    await backend.revert(file);
    expect(execa).toHaveBeenCalledWith('pijul', ['reset', file]);
  });
});
