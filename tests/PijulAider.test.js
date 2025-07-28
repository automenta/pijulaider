const PijulAider = require('../src/PijulAider');
const FileBackend = require('../src/versioning/FileBackend');
const GitBackend = require('../src/versioning/GitBackend');
const PijulBackend = require('../src/versioning/PijulBackend');

jest.mock('execa');
jest.mock('inquirer');
jest.mock('edit-file');

describe('PijulAider', () => {
  let aider;

  beforeEach(() => {
    aider = new PijulAider({ model: 'gpt-4o' });
  });

  it('should create a file backend by default', () => {
    const backend = aider.createBackend('file');
    expect(backend).toBeInstanceOf(FileBackend);
  });

  it('should create a git backend', () => {
    const backend = aider.createBackend('git');
    expect(backend).toBeInstanceOf(GitBackend);
  });

  it('should create a pijul backend', () => {
    const backend = aider.createBackend('pijul');
    expect(backend).toBeInstanceOf(PijulBackend);
  });
});
