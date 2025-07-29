const RunCommand = require('../../src/commands/run');
const pty = require('node-pty');

jest.mock('node-pty', () => ({
  spawn: jest.fn(() => ({
    on: jest.fn(),
    write: jest.fn(),
  })),
}));

describe('RunCommand', () => {
  beforeEach(() => {
    pty.spawn.mockClear();
  });

  it('should create a new terminal if one does not exist', async () => {
    const dependencies = {
      addMessage: jest.fn(),
      setTerminal: jest.fn(),
      getTerminal: jest.fn(() => null),
    };
    const runCommand = new RunCommand(dependencies);
    await runCommand.execute(['ls']);
    expect(pty.spawn).toHaveBeenCalledTimes(1);
    expect(dependencies.setTerminal).toHaveBeenCalledTimes(1);
  });

  it('should write to the existing terminal if one exists', async () => {
    const mockTerminal = {
      write: jest.fn(),
    };
    const dependencies = {
      addMessage: jest.fn(),
      setTerminal: jest.fn(),
      getTerminal: jest.fn(() => mockTerminal),
    };
    const runCommand = new RunCommand(dependencies);
    await runCommand.execute(['ls']);
    expect(mockTerminal.write).toHaveBeenCalledWith('ls\r');
  });
});
