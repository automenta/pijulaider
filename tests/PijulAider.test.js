const PijulAider = require('../src/PijulAider');
const FileBackend = require('../src/versioning/FileBackend');
const GitBackend = require('../src/versioning/GitBackend');
const PijulBackend = require('../src/versioning/PijulBackend');
const inquirer = require('inquirer');
const { parseDiff, applyDiff } = require('../src/diffUtils');
const fs = require('fs').promises;
const CommandManager = require('../src/CommandManager');
const LLMManager = require('../src/LLMManager');

jest.mock('inquirer', () => ({
  prompt: jest.fn(),
}));
jest.mock('../src/diffUtils');
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
  },
}));
jest.mock('../src/versioning/FileBackend');
jest.mock('../src/versioning/GitBackend');
jest.mock('../src/versioning/PijulBackend');
jest.mock('../src/CommandManager');
jest.mock('../src/LLMManager');

describe('PijulAider', () => {
  let aider;
  let execa;

  beforeEach(() => {
    aider = new PijulAider({ provider: 'openai', model: 'gpt-4o' });
    execa = aider.execa = jest.fn();
    aider.backendManager.execa = execa;
    aider.uiManager.onSendMessage = jest.fn();
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
      aider.backendManager.migrate = jest.fn();
      aider.backendManager.createBackend = jest.fn();
      await aider.initialize();
      expect(inquirer.prompt).toHaveBeenCalled();
      expect(aider.backendManager.migrate).toHaveBeenCalledWith('file', 'pijul');
      expect(aider.backendManager.createBackend).toHaveBeenCalledWith('pijul');
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
    it('should delegate to the command manager', async () => {
      aider.uiManager.start();
      aider.uiManager.rerender = jest.fn();
      await aider.onSendMessage('/add file.js');
      expect(aider.commandManager.handleCommand).toHaveBeenCalledWith('add', ['file.js']);
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
