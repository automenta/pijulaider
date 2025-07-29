const LsCommand = require('../../src/commands/ls');
const fs = require('fs');

jest.mock('fs', () => ({
  promises: {
    readdir: jest.fn(),
  },
}));

describe('LsCommand', () => {
  it('should list files in the current directory', async () => {
    const dependencies = {
      addMessage: jest.fn(),
    };
    fs.promises.readdir.mockResolvedValue([
      { name: 'file1.js', isDirectory: () => false },
      { name: 'dir1', isDirectory: () => true },
    ]);
    const lsCommand = new LsCommand(dependencies);
    await lsCommand.execute([]);
    expect(dependencies.addMessage).toHaveBeenCalledWith({
      sender: 'system',
      text: 'file1.js\ndir1/',
    });
  });
});
