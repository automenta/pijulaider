const PijulBackend = require('../../src/versioning/PijulBackend');
const execa = require('execa');

jest.mock('execa');

describe('PijulBackend', () => {
  let backend;
  beforeEach(() => {
    backend = new PijulBackend();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should add a file', async () => {
    await backend.add('file.txt');
    expect(execa).toHaveBeenCalledWith('pijul', ['add', 'file.txt']);
  });

  it('should record a patch', async () => {
    await backend.record('message');
    expect(execa).toHaveBeenCalledWith('pijul', ['record', '-m', 'message']);
  });

  it('should unrecord a patch', async () => {
    await backend.unrecord('hash');
    expect(execa).toHaveBeenCalledWith('pijul', ['unrecord', 'hash']);
  });

  it('should switch channels', async () => {
    await backend.channel('new-channel');
    expect(execa).toHaveBeenCalledWith('pijul', ['channel', 'switch', 'new-channel']);
  });

  it('should apply a patch', async () => {
    await backend.apply('patch.pijul');
    expect(execa).toHaveBeenCalledWith('pijul', ['apply', 'patch.pijul']);
  });

  it('should list conflicts', async () => {
    execa.mockResolvedValue({ stdout: 'C HASH author date' });
    const conflicts = await backend.conflicts();
    expect(execa).toHaveBeenCalledWith('pijul', ['credit']);
    expect(conflicts).toBe(JSON.stringify([{ hash: 'HASH', author: 'author', date: 'date' }], null, 2));
  });

  it('should show the diff', async () => {
    execa.mockResolvedValue({ stdout: 'diff --pijul a/file.txt b/file.txt' });
    const diff = await backend.diff();
    expect(execa).toHaveBeenCalledWith('pijul', ['diff']);
    expect(diff).toBe('diff --pijul a/file.txt b/file.txt');
  });
});
