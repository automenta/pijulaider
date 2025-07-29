const MvCommand = require('../../src/commands/mv');
const fs = require('fs');

jest.mock('fs', () => ({
  promises: {
    rename: jest.fn(),
  },
}));

describe('MvCommand', () => {
  let mvCommand;
  let dependencies;

  beforeEach(() => {
    dependencies = {
      addMessage: jest.fn(),
    };
    mvCommand = new MvCommand(dependencies);
  });

  it('should move a file when given a source and destination', async () => {
    const args = ['old-file.txt', 'new-file.txt'];
    await mvCommand.execute(args);
    expect(fs.promises.rename).toHaveBeenCalledWith('old-file.txt', 'new-file.txt');
    expect(dependencies.addMessage).toHaveBeenCalledWith({
      sender: 'system',
      text: 'Moved old-file.txt to new-file.txt',
    });
  });

  it('should show a usage message if source or destination is missing', async () => {
    const args = ['old-file.txt'];
    await mvCommand.execute(args);
    expect(dependencies.addMessage).toHaveBeenCalledWith({
      sender: 'system',
      text: 'Usage: /mv <source> <destination>',
    });
  });

  it('should show an error message if fs.promises.rename fails', async () => {
    const args = ['old-file.txt', 'new-file.txt'];
    const error = new Error('File not found');
    fs.promises.rename.mockRejectedValue(error);
    await mvCommand.execute(args);
    expect(dependencies.addMessage).toHaveBeenCalledWith({
      sender: 'system',
      text: 'Error: File not found',
    });
  });
});
