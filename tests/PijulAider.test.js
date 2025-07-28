const PijulAider = require('../src/PijulAider');
const FileBackend = require('../src/versioning/FileBackend');
const GitBackend = require('../src/versioning/GitBackend');
const PijulBackend = require('../src/versioning/PijulBackend');

jest.mock('inquirer');
jest.mock('edit-file');
jest.mock('ink', () => ({
  render: jest.fn(),
}));
jest.mock('../src/diffUtils', () => ({
  parseDiff: jest.fn(),
  applyDiff: jest.fn(),
}));
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
  },
}));

const fs = require('fs').promises;

describe('PijulAider', () => {
  let aider;

  beforeEach(() => {
    const execa = jest.fn();
    aider = new PijulAider({ model: 'gpt-4o' }, execa);
    jest.clearAllMocks();
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

  it('should load the codebase', async () => {
    const files = ['file1.js', 'file2.js'];
    const contents = {
      'file1.js': 'console.log("file1");',
      'file2.js': 'console.log("file2");',
    };
    const globFn = jest.fn().mockResolvedValue(files);
    fs.readFile.mockImplementation((file) => Promise.resolve(contents[file]));
    jest.spyOn(aider.chain, 'invoke').mockResolvedValue('');
    const inquirer = require('inquirer');
    inquirer.prompt = jest.fn().mockResolvedValue({ switchToPijul: false });

    await aider.run([], globFn);

    expect(aider.codebase).toContain('--- file1.js ---\nconsole.log("file1");');
    expect(aider.codebase).toContain('--- file2.js ---\nconsole.log("file2");');
  });

  it('should auto-commit changes', async () => {
    aider.options.autoCommit = true;
    const { parseDiff, applyDiff } = require('../src/diffUtils');
    parseDiff.mockReturnValue({/* a parsed diff object */});
    applyDiff.mockResolvedValue(undefined);

    const inquirer = require('inquirer');
    inquirer.prompt = jest.fn().mockResolvedValue({ switchToPijul: false });

    await aider.run([], jest.fn().mockResolvedValue([]));
    const recordSpy = jest.spyOn(aider.backend, 'record');
    const onSendMessage = aider.getOnSendMessage();
    await onSendMessage('test query');

    expect(recordSpy).toHaveBeenCalledWith('Auto-commit');
  });

  it('should run tests', async () => {
    aider.execa.mockResolvedValue({ stdout: 'All tests passed!' });
    const inquirer = require('inquirer');
    inquirer.prompt = jest.fn().mockResolvedValue({ switchToPijul: false });

    await aider.run([], jest.fn().mockResolvedValue([]));
    const onSendMessage = aider.getOnSendMessage();
    await onSendMessage('/test');

    expect(aider.execa).toHaveBeenCalledWith('npm', ['test']);
    expect(aider.messages).toContainEqual({
      sender: 'system',
      text: 'All tests passed!',
    });
  });
});
