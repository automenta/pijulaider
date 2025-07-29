const PijulAider = require('../src/PijulAider');
const FileBackend = require('../src/versioning/FileBackend');
const GitBackend = require('../src/versioning/GitBackend');
const PijulBackend = require('../src/versioning/PijulBackend');
const inquirer = require('inquirer');
const { parseDiff, applyDiff } = require('../src/diffUtils');
const fs = require('fs').promises;
const CommandManager = require('../src/CommandManager');
const LLMManager = require('../src/LLMManager');
const LLMChain = require('../src/LLMChain');
const FileManager = require('../src/FileManager');

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
jest.mock('../src/LLMChain');
jest.mock('../src/FileManager');
jest.mock('glob', () => require('./mocks/glob'));

describe('PijulAider', () => {
  let aider;
  let execa;

  beforeEach(() => {
    aider = new PijulAider({ provider: 'openai', model: 'gpt-4o' });
    execa = aider.backendManager.execa = jest.fn();
    aider.uiManager.onSendMessage = jest.fn();
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('should create a file backend by default', async () => {
      execa.mockRejectedValue(new Error());
      inquirer.prompt.mockResolvedValue({ switchToPijul: false });
      jest.spyOn(aider.backendManager, 'createBackend').mockResolvedValue(new FileBackend());
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
      jest.spyOn(aider.backendManager, 'createBackend').mockResolvedValue(new GitBackend());
      await aider.initialize();
      expect(aider.backend).toBeInstanceOf(GitBackend);
    });

    it('should create a pijul backend when pijul is detected', async () => {
      execa.mockResolvedValue({ stdout: 'pijul version 1.0.0' });
      inquirer.prompt.mockResolvedValue({ switchToPijul: false });
      jest.spyOn(aider.backendManager, 'createBackend').mockResolvedValue(new PijulBackend());
      await aider.initialize();
      expect(aider.backend).toBeInstanceOf(PijulBackend);
    });

    it('should prompt to switch to pijul', async () => {
      execa.mockRejectedValue(new Error());
      inquirer.prompt.mockResolvedValue({ switchToPijul: true });
      const migrate = jest.spyOn(aider.backendManager, 'migrate').mockResolvedValue();
      jest.spyOn(aider.backendManager, 'createBackend').mockResolvedValue(new PijulBackend());
      await aider.initialize();
      expect(inquirer.prompt).toHaveBeenCalled();
      expect(migrate).toHaveBeenCalledWith('file', 'pijul');
    });
  });

  describe('start', () => {
    it('should load files into the codebase', async () => {
      jest.spyOn(aider, 'initialize').mockResolvedValue();
      aider.backend = new FileBackend();
      const fileManager = new FileManager(aider.backend, aider.messageHandler);
      aider.fileManager = fileManager;
      const loadFiles = jest.spyOn(fileManager, 'loadFiles').mockResolvedValue();
      await aider.start([]);
      expect(loadFiles).toHaveBeenCalled();
    });
  });


  describe('onSendMessage', () => {
    it('should delegate to the command manager', async () => {
      const handleCommand = jest.spyOn(aider.commandManager, 'handleCommand').mockResolvedValue();
      await aider.onSendMessage('/add file.js');
      expect(handleCommand).toHaveBeenCalledWith('add', ['file.js']);
    });
  });

  describe('handleQuery', () => {
    it('should call the LLM and apply the diff', async () => {
      aider.llmChain = new LLMChain();
      const handleQuery = jest.spyOn(aider.llmChain, 'handleQuery').mockResolvedValue('some diff');
      aider.fileManager = new FileManager();
      jest.spyOn(aider.fileManager, 'getCodebase').mockReturnValue('some codebase');
      await aider.handleQuery('test query');
      expect(handleQuery).toHaveBeenCalledWith('test query', 'some codebase', '');
      expect(aider.diff).toBe('some diff');
    });
  });
});
