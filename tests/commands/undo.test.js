const UndoCommand = require('../../src/commands/undo');

describe('UndoCommand', () => {
  it('should revert a single file if a file is specified', async () => {
    const mockBackend = {
      revert: jest.fn(),
      diff: jest.fn().mockResolvedValue(''),
    };
    const dependencies = {
      getBackend: () => mockBackend,
      addMessage: jest.fn(),
      setDiff: jest.fn(),
    };
    const undoCommand = new UndoCommand(dependencies);
    await undoCommand.execute(['file1.js']);
    expect(mockBackend.revert).toHaveBeenCalledWith('file1.js');
    expect(dependencies.addMessage).toHaveBeenCalledWith({
      sender: 'system',
      text: 'Reverted changes to file1.js.',
    });
  });

  it('should revert all files if no file is specified', async () => {
    const mockBackend = {
      revertAll: jest.fn(),
      diff: jest.fn().mockResolvedValue(''),
    };
    const dependencies = {
      getBackend: () => mockBackend,
      addMessage: jest.fn(),
      setDiff: jest.fn(),
    };
    const undoCommand = new UndoCommand(dependencies);
    await undoCommand.execute([]);
    expect(mockBackend.revertAll).toHaveBeenCalled();
    expect(dependencies.addMessage).toHaveBeenCalledWith({
      sender: 'system',
      text: 'Reverted all changes.',
    });
  });
});
