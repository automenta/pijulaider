const RmCommand = require('../../src/commands/rm');
const fs = require('fs');

jest.mock('fs', () => ({
  promises: {
    unlink: jest.fn(),
  },
}));

describe('RmCommand', () => {
  it('should remove a file', async () => {
    const dependencies = {
      addMessage: jest.fn(),
    };
    fs.promises.unlink.mockResolvedValue();
    const rmCommand = new RmCommand(dependencies);
    await rmCommand.execute(['file1.js']);
    expect(fs.promises.unlink).toHaveBeenCalledWith('file1.js');
    expect(dependencies.addMessage).toHaveBeenCalledWith({
      sender: 'system',
      text: 'Removed file: file1.js',
    });
  });
});
