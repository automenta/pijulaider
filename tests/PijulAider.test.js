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
jest.mock('langchain/agents', () => ({
  createOpenAIToolsAgent: jest.fn(),
  AgentExecutor: jest.fn().mockImplementation(() => ({
    invoke: jest.fn(),
  })),
}));

const fs = require('fs').promises;

describe('PijulAider', () => {
  let aider;

  beforeEach(() => {
    const execa = jest.fn().mockResolvedValue({ stdout: '' });
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
    fs.readFile.mockImplementation((file) => Promise.resolve(contents[file]));
    jest.spyOn(aider.agentExecutor, 'invoke').mockResolvedValue({ output: '' });
    const inquirer = require('inquirer');
    inquirer.prompt = jest.fn().mockResolvedValue({ switchToPijul: false });

    await aider.run(files, () => Promise.resolve(files));

    expect(aider.codebase).toContain('--- file1.js ---\nconsole.log("file1");');
    expect(aider.codebase).toContain('--- file2.js ---\nconsole.log("file2");');
  });

  it('should auto-commit changes', async () => {
    aider.options.autoCommit = true;
    const { parseDiff, applyDiff } = require('../src/diffUtils');
    parseDiff.mockReturnValue({/* a parsed diff object */});
    applyDiff.mockResolvedValue(undefined);
    jest.spyOn(aider.agentExecutor, 'invoke').mockResolvedValue({ output: '```diff\n ' });

    const inquirer = require('inquirer');
    inquirer.prompt = jest.fn().mockResolvedValue({ switchToPijul: false });

    await aider.run([], () => Promise.resolve([]));
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

  it('should handle test failures', async () => {
    const error = new Error('Tests failed');
    error.stdout = 'Error: test failed';
    aider.execa.mockRejectedValue(error);
    jest.spyOn(aider.agentExecutor, 'invoke').mockResolvedValue({ output: 'fixed the tests' });
    const { parseDiff, applyDiff } = require('../src/diffUtils');
    parseDiff.mockReturnValue({/* a parsed diff object */});
    applyDiff.mockResolvedValue(undefined);

    const inquirer = require('inquirer');
    inquirer.prompt = jest.fn().mockResolvedValue({ switchToPijul: false });

    await aider.run([], jest.fn().mockResolvedValue([]));
    const onSendMessage = aider.getOnSendMessage();
    await onSendMessage('/test');

    expect(aider.messages).toContainEqual({
      sender: 'system',
      text: `Tests failed. Attempting to fix...\n${error.stdout}`,
    });
    expect(aider.agentExecutor.invoke).toHaveBeenCalledWith({
      input: `The tests failed with the following output:\n${error.stdout}\nPlease fix the tests.`,
      chat_history: expect.any(Array),
      codebase: expect.any(String),
      tools: 'apply_diff, run_test, ask_user',
    });
    expect(aider.messages).toContainEqual({
      sender: 'ai',
      text: 'fixed the tests',
    });
  });

  it('should detect the pijul backend', async () => {
    aider.execa.mockResolvedValue(undefined);
    const backend = await aider.detectBackend();
    expect(backend).toBe('pijul');
  });

  it('should detect the git backend', async () => {
    aider.execa.mockImplementation((command) => {
      if (command === 'pijul') {
        return Promise.reject();
      }
      return Promise.resolve();
    });
    const backend = await aider.detectBackend();
    expect(backend).toBe('git');
  });

  it('should fall back to the file backend', async () => {
    aider.execa.mockRejectedValue(new Error());
    const backend = await aider.detectBackend();
    expect(backend).toBe('file');
  });

  describe('commands', () => {
    beforeEach(async () => {
      const inquirer = require('inquirer');
      inquirer.prompt = jest.fn().mockResolvedValue({ switchToPijul: false });
      await aider.run([], jest.fn().mockResolvedValue([]));
    });

    it('should add a file to the context', async () => {
      const onSendMessage = aider.getOnSendMessage();
      await onSendMessage('/add file1.js');
      expect(aider.filesInContext).toEqual(['file1.js']);
      expect(aider.messages).toContainEqual({
        sender: 'system',
        text: 'Added file1.js to the context.',
      });
    });

    it('should drop a file from the context', async () => {
      aider.filesInContext = ['file1.js', 'file2.js'];
      const onSendMessage = aider.getOnSendMessage();
      await onSendMessage('/drop file1.js');
      expect(aider.filesInContext).toEqual(['file2.js']);
      expect(aider.messages).toContainEqual({
        sender: 'system',
        text: 'Dropped file1.js from the context.',
      });
    });

    it('should list the files in the context', async () => {
      aider.filesInContext = ['file1.js', 'file2.js'];
      const onSendMessage = aider.getOnSendMessage();
      await onSendMessage('/ls');
      expect(aider.messages).toContainEqual({
        sender: 'system',
        text: 'Files in context:\nfile1.js\nfile2.js',
      });
    });
  });

  describe('agent', () => {
    beforeEach(async () => {
      const inquirer = require('inquirer');
      inquirer.prompt = jest.fn().mockResolvedValue({ switchToPijul: false });
      await aider.run([], () => Promise.resolve([]));
    });

    it('should call the agent executor', async () => {
      const invokeSpy = jest.spyOn(aider.agentExecutor, 'invoke').mockResolvedValue({ output: '' });
      const onSendMessage = aider.getOnSendMessage();
      await onSendMessage('test query');
      expect(invokeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          input: 'test query',
        })
      );
    });
  });
});
