const execa = require('execa');
const fs = require('fs');
const path = require('path');
const PijulBackend = require('../../src/versioning/PijulBackend');

describe('PijulBackend', () => {
  const testDir = 'pijul-test-repo';
  const backend = new PijulBackend();
  const testFile = path.join(testDir, 'test.txt');
  const initialContent = 'initial content';

  beforeEach(async () => {
    fs.mkdirSync(testDir, { recursive: true });
    await execa('pijul', ['init'], { cwd: testDir });
    fs.writeFileSync(testFile, initialContent);
    await backend.add(testFile);
    await backend.record('Initial commit');
  });

  afterEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  it('should show the diff', async () => {
    const newContent = 'new content';
    fs.writeFileSync(testFile, newContent);
    const diff = await backend.diff();
    expect(diff).toContain(`+${newContent}`);
  });

  it('should record a patch', async () => {
    const newContent = 'new content';
    fs.writeFileSync(testFile, newContent);
    await backend.record('New patch');
    const { stdout } = await execa('pijul', ['log', '--hash-only'], { cwd: testDir });
    expect(stdout.split('\n').length).toBe(2);
  });

  it('should unrecord a patch', async () => {
    const newContent = 'new content';
    fs.writeFileSync(testFile, newContent);
    await backend.record('New patch');
    const { stdout: hash } = await execa('pijul', ['log', '--hash-only', '-n1'], { cwd: testDir });
    await backend.unrecord(hash);
    const { stdout: log } = await execa('pijul', ['log', '--hash-only'], { cwd: testDir });
    expect(log.split('\n').length).toBe(1);
  });

  it('should switch channels', async () => {
    await backend.channel('new-channel');
    const { stdout } = await execa('pijul', ['channel'], { cwd: testDir });
    expect(stdout).toContain('* new-channel');
  });

  it('should apply a patch', async () => {
    const newContent = 'new content';
    fs.writeFileSync(testFile, newContent);
    await backend.record('New patch');
    await backend.revert(testFile);
    const { stdout: hash } = await execa('pijul', ['log', '--hash-only', '-n1'], { cwd: testDir });
    await backend.apply(hash);
    const content = fs.readFileSync(testFile, 'utf-8');
    expect(content).toBe(newContent);
  });
});
