const GrepCommand = require('../../src/commands/grep');
const { exec } = require('child_process');

jest.mock('child_process', () => ({
  exec: jest.fn(),
}));

describe('GrepCommand', () => {
  let grepCommand;
  let dependencies;

  beforeEach(() => {
    dependencies = {
      addMessage: jest.fn(),
    };
    grepCommand = new GrepCommand(dependencies);
  });

  it('should call exec with the correct command', async () => {
    const args = ['pattern', 'file1.txt', 'file2.txt'];
    await grepCommand.execute(args);
    expect(exec).toHaveBeenCalledWith('grep -r "pattern" file1.txt file2.txt', expect.any(Function));
  });

  it('should show a usage message if pattern is missing', async () => {
    const args = [];
    await grepCommand.execute(args);
    expect(dependencies.addMessage).toHaveBeenCalledWith({
      sender: 'system',
      text: 'Usage: /grep <pattern> [files...]',
    });
  });

  it('should show the stdout on success', async () => {
    const args = ['pattern', 'file1.txt'];
    const stdout = 'file1.txt: pattern';
    exec.mockImplementation((command, callback) => {
      callback(null, stdout, '');
    });
    await grepCommand.execute(args);
    expect(dependencies.addMessage).toHaveBeenCalledWith({
      sender: 'system',
      text: stdout,
    });
  });

  it('should show the stderr on error', async () => {
    const args = ['pattern', 'file1.txt'];
    const stderr = 'grep: file1.txt: No such file or directory';
    const error = new Error('Command failed');
    exec.mockImplementation((command, callback) => {
      callback(error, '', stderr);
    });
    await grepCommand.execute(args);
    expect(dependencies.addMessage).toHaveBeenCalledWith({
      sender: 'system',
      text: `Error: ${stderr}`,
    });
  });
});
