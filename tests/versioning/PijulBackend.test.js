const assert = require('assert');
const execa = require('execa');
const fs = require('fs');
const path = require('path');
const PijulBackend = require('../../src/versioning/PijulBackend');

describe('PijulBackend', () => {
  const testDir = 'pijul-test-repo';
  const backend = new PijulBackend();
  const testFile = path.join(testDir, 'test.txt');

  before(async () => {
    fs.mkdirSync(testDir, { recursive: true });
    await execa('pijul', ['init'], { cwd: testDir });
    fs.writeFileSync(testFile, 'initial content');
    await backend.add(testFile);
    await backend.commit('Initial commit');
  });

  after(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  it('should diff', async () => {
    fs.writeFileSync(testFile, 'new content');
    const diff = await backend.diff();
    assert.ok(diff.includes('+new content'));
  });

  it('should revert', async () => {
    fs.writeFileSync(testFile, 'new content');
    await backend.revert(testFile);
    const content = fs.readFileSync(testFile, 'utf-8');
    assert.strictEqual(content, 'initial content');
  });
});
