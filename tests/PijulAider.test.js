const PijulAider = require('../src/PijulAider');
const FileBackend = require('../src/versioning/FileBackend');
const GitBackend = require('../src/versioning/GitBackend');
const PijulBackend = require('../src/versioning/PijulBackend');
const inquirer = require('inquirer');
const { editFile } = require('edit-file');
const { render } = require('ink');
const { parseDiff, applyDiff } = require('../src/diffUtils');
const fs = require('fs').promises;
const filePicker = require('file-picker');

jest.mock('inquirer');
jest.mock('edit-file');
jest.mock('ink');
jest.mock('../src/diffUtils');
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    access: jest.fn(),
    copyFile: jest.fn(),
    unlink: jest.fn(),
  },
}));
jest.mock('file-picker');
jest.mock('../src/versioning/FileBackend');
jest.mock('../src/versioning/GitBackend');
jest.mock('../src/versioning/PijulBackend');

describe('PijulAider', () => {
  let aider;
  let execa;

  beforeEach(() => {
    execa = jest.fn();
    aider = new PijulAider({ model: 'gpt-4o' }, execa);
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('should create a file backend by default', async () => {
      execa.mockRejectedValue(new Error());
      inquirer.prompt.mockResolvedValue({ switchToPijul: false });
      await aider.initialize();
      expect(aider.backend).toBeInstanceOf(FileBackend);
    });

    it('should create a git backend when git is detected', async () => {
      execa.mockImplementation((command) => {
        if (command === 'pijul') return Promise.reject(new Error());
        if (command === 'git') return Promise.resolve({ stdout: 'true' });
        return Promise.resolve();
      });
      inquirer.prompt.mockResolvedValue({ switchToPijul: false });
      await aider.initialize();
      expect(aider.backend).toBeInstanceOf(GitBackend);
    });

    it('should create a pijul backend when pijul is detected', async () => {
      execa.mockResolvedValue({ stdout: 'pijul version 1.0.0' });
      inquirer.prompt.mockResolvedValue({ switchToPijul: false });
      await aider.initialize();
      expect(aider.backend).toBeInstanceOf(PijulBackend);
    });

    it('should prompt to switch to pijul', async () => {
      execa.mockRejectedValue(new Error());
      inquirer.prompt.mockResolvedValue({ switchToPijul: true });
      execa.mockResolvedValueOnce({ stdout: 'pijul version 1.0.0' });
      await aider.initialize();
      expect(inquirer.prompt).toHaveBeenCalled();
      expect(aider.backend).toBeInstanceOf(PijulBackend);
    });
  });

  describe('loadFiles', () => {
    it('should load files into the codebase', async () => {
      const files = ['file1.js', 'file2.js'];
      const contents = {
        'file1.js': 'console.log("file1");',
        'file2.js': 'console.log("file2");',
      };
      const globFn = jest.fn().mockResolvedValue(files);
      fs.readFile.mockImplementation((file) => Promise.resolve(contents[file]));
      aider.backend = new FileBackend();
      await aider.loadFiles([], globFn);
      expect(aider.codebase).toContain('--- file1.js ---\nconsole.log("file1");');
      expect(aider.codebase).toContain('--- file2.js ---\nconsole.log("file2");');
    });
  });

  describe('handleCommand', () => {
    beforeEach(() => {
      aider.backend = new FileBackend();
    });

    it('should add a file', async () => {
      fs.readFile.mockResolvedValue('console.log("hello");');
      await aider.handleCommand('add', ['newfile.js']);
      expect(aider.backend.add).toHaveBeenCalledWith('newfile.js');
      expect(aider.codebase).toContain('--- newfile.js ---\nconsole.log("hello");');
      expect(aider.messages).toContainEqual({
        sender: 'system',
        text: 'Added newfile.js to the chat.',
      });
    });

    it('should drop a file', async () => {
      aider.codebase = '--- existing.js ---\nconsole.log("hello");\n\n';
      await aider.handleCommand('drop', ['existing.js']);
      expect(aider.codebase).not.toContain('--- existing.js ---');
      expect(aider.messages).toContainEqual({
        sender: 'system',
        text: 'Removed existing.js from the chat.',
      });
    });

    it('should run a command', async () => {
      execa.mockResolvedValue({ stdout: 'hello from command' });
      await aider.handleCommand('run', ['echo', 'hello from command']);
      expect(execa).toHaveBeenCalledWith('echo', ['hello from command']);
      expect(aider.messages).toContainEqual({
        sender: 'system',
        text: '`/run echo hello from command`\nhello from command',
      });
    });

    it('should undo the last change', async () => {
      await aider.handleCommand('undo', []);
      expect(aider.backend.undo).toHaveBeenCalled();
      expect(aider.messages).toContainEqual({
        sender: 'system',
        text: 'Undid the last change.',
      });
    });

    it('should run tests and handle success', async () => {
      execa.mockResolvedValue({ stdout: 'All tests passed!' });
      await aider.handleCommand('test', []);
      expect(execa).toHaveBeenCalledWith('npm', ['test']);
      expect(aider.messages).toContainEqual({
        sender: 'system',
        text: 'All tests passed!',
      });
    });

    it('should run tests and handle failure', async () => {
      const error = new Error('Tests failed');
      error.stdout = 'Error: test failed';
      execa.mockRejectedValue(error);
      jest.spyOn(aider, 'handleQuery').mockResolvedValue();
      await aider.handleCommand('test', []);
      expect(execa).toHaveBeenCalledWith('npm', ['test']);
      expect(aider.messages).toContainEqual({
        sender: 'system',
        text: `Tests failed. Attempting to fix...\n${error.stdout}`,
      });
      expect(aider.handleQuery).toHaveBeenCalledWith(`The tests failed with the following output:\n${error.stdout}\nPlease fix the tests.`);
    });
  });

  describe('handleQuery', () => {
    beforeEach(() => {
      aider.backend = new FileBackend();
    });

    it('should call the LLM and apply the diff', async () => {
      jest.spyOn(aider.chain, 'invoke').mockResolvedValue('some diff');
      parseDiff.mockReturnValue({/* a parsed diff object */});
      applyDiff.mockResolvedValue(undefined);
      await aider.handleQuery('test query');
      expect(aider.chain.invoke).toHaveBeenCalled();
      expect(parseDiff).toHaveBeenCalledWith('some diff');
      expect(applyDiff).toHaveBeenCalled();
      expect(aider.messages).toContainEqual({
        sender: 'ai',
        text: 'some diff',
      });
      expect(aider.messages).toContainEqual({
        sender: 'system',
        text: 'Diff applied successfully.',
      });
    });

    it('should auto-commit changes', async () => {
      aider.options.autoCommit = true;
      jest.spyOn(aider.chain, 'invoke').mockResolvedValue('some diff');
      parseDiff.mockReturnValue({/* a parsed diff object */});
      applyDiff.mockResolvedValue(undefined);
      await aider.handleQuery('test query');
      expect(aider.backend.record).toHaveBeenCalledWith('Auto-commit');
      expect(aider.messages).toContainEqual({
        sender: 'system',
        text: 'Changes auto-committed.',
      });
    });
  });
});
