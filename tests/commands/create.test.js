const CreateCommand = require('../../src/commands/create');
const fs = require('fs');

jest.mock('fs', () => ({
  promises: {
    writeFile: jest.fn(),
  },
}));

describe('CreateCommand', () => {
  it('should create a file', async () => {
    const dependencies = {
      addMessage: jest.fn(),
    };
    fs.promises.writeFile.mockResolvedValue();
    const createCommand = new CreateCommand(dependencies);
    await createCommand.execute(['file1.js']);
    expect(fs.promises.writeFile).toHaveBeenCalledWith('file1.js', '');
    expect(dependencies.addMessage).toHaveBeenCalledWith({
      sender: 'system',
      text: 'Created file: file1.js',
    });
  });
});
