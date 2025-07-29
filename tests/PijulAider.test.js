const PijulAider = require('../src/PijulAider');
const FileBackend = require('../src/versioning/FileBackend');
const GitBackend = require('../src/versioning/GitBackend');
const PijulBackend = require('../src/versioning/PijulBackend');
const BackendManager = require('../src/BackendManager');
const UIManager = require('../src/UIManager');
const CommandManager = require('../src/CommandManager');
const LLMChain = require('../src/LLMChain');
const FileManager = require('../src/FileManager');

jest.mock('react-syntax-highlighter', () => ({ children }) => <text>{children}</text>);
const MessageHandler = require('../src/MessageHandler');
const bootstrap = require('../src/bootstrap');

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
jest.mock('../src/LLMManager');
jest.mock('../src/BackendManager');
jest.mock('../src/UIManager');
jest.mock('../src/CommandManager');
jest.mock('../src/LLMChain');
jest.mock('../src/FileManager');
jest.mock('../src/MessageHandler');
jest.mock('glob', () => require('./mocks/glob'));

describe('PijulAider', () => {
  let container;
  let aider;
  let backendManager;
  let uiManager;
  let commandManager;
  let llmChain;
  let fileManager;
  let messageHandler;

  beforeEach(() => {
    container = bootstrap({ provider: 'openai', model: 'gpt-4o' });
    backendManager = new BackendManager();
    container.register('backendManager', backendManager);
    uiManager = new UIManager();
    uiManager.onSendMessage = jest.fn();
    container.register('uiManager', uiManager);
    commandManager = new CommandManager();
    commandManager.handleCommand = jest.fn();
    container.register('commandManager', commandManager);
    llmChain = new LLMChain();
    llmChain.handleQuery = jest.fn();
    container.register('llmChain', llmChain);
    fileManager = new FileManager();
    fileManager.loadFiles = jest.fn();
    fileManager.getCodebase = jest.fn();
    container.register('fileManager', fileManager);
    messageHandler = new MessageHandler();
    messageHandler.getMessages = jest.fn();
    messageHandler.addMessage = jest.fn();
    container.register('messageHandler', messageHandler);
    container.register('diff', '');
    aider = new PijulAider(container);
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('should create a file backend by default', async () => {
      jest.spyOn(backendManager, 'initialize').mockResolvedValue(new FileBackend());
      await aider.initialize();
      expect(container.get('backend')).toBeInstanceOf(FileBackend);
    });

    it('should create a git backend when git is detected', async () => {
      jest.spyOn(backendManager, 'initialize').mockResolvedValue(new GitBackend());
      await aider.initialize();
      expect(container.get('backend')).toBeInstanceOf(GitBackend);
    });

    it('should create a pijul backend when pijul is detected', async () => {
      jest.spyOn(backendManager, 'initialize').mockResolvedValue(new PijulBackend());
      await aider.initialize();
      expect(container.get('backend')).toBeInstanceOf(PijulBackend);
    });
  });

  describe('start', () => {
    it('should load files into the codebase', async () => {
      jest.spyOn(aider, 'initialize').mockResolvedValue();
      container.register('backend', { diff: () => Promise.resolve('') });
      await aider.start([]);
      expect(fileManager.loadFiles).toHaveBeenCalled();
    });
  });

  describe('onSendMessage', () => {
    it('should delegate to the command manager', async () => {
      await aider.onSendMessage('/add file.js');
      expect(commandManager.handleCommand).toHaveBeenCalledWith('add', ['file.js']);
    });
  });

  describe('handleQuery', () => {
    it('should call the LLM and apply the diff', async () => {
      llmChain.handleQuery.mockResolvedValue('some diff');
      fileManager.getCodebase.mockReturnValue('some codebase');
      container.register('diff', 'old diff');
      await aider.handleQuery('test query');
      expect(llmChain.handleQuery).toHaveBeenCalledWith('test query', 'some codebase', 'old diff');
      expect(container.get('diff')).toBe('some diff');
    });
  });
});
