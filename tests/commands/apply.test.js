const ApplyCommand = require('../../src/commands/apply');
const fs = require('fs');
const { applyPatch } = require('diff');

jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
  },
}));

jest.mock('diff', () => ({
  applyPatch: jest.fn(),
}));

describe('ApplyCommand', () => {
  let applyCommand;
  let dependencies;

  beforeEach(() => {
    dependencies = {
      addMessage: jest.fn(),
      getDiff: jest.fn(),
      setDiff: jest.fn(),
    };
    applyCommand = new ApplyCommand(dependencies);
  });

  it('should apply a patch to a file', async () => {
    const args = ['file.txt'];
    const diff = '--- a/file.txt\n+++ b/file.txt\n@@ -1 +1 @@\n-old\n+new';
    const originalContent = 'old';
    const patchedContent = 'new';

    dependencies.getDiff.mockReturnValue(diff);
    fs.promises.readFile.mockResolvedValue(originalContent);
    applyPatch.mockReturnValue(patchedContent);

    await applyCommand.execute(args);

    expect(fs.promises.writeFile).toHaveBeenCalledWith('file.txt', patchedContent);
    expect(dependencies.addMessage).toHaveBeenCalledWith({
      sender: 'system',
      text: 'Applied patch to file.txt',
    });
    expect(dependencies.setDiff).toHaveBeenCalledWith(null);
  });

  it('should show a message if there is no diff to apply', async () => {
    dependencies.getDiff.mockReturnValue(null);
    await applyCommand.execute([]);
    expect(dependencies.addMessage).toHaveBeenCalledWith({
      sender: 'system',
      text: 'No diff to apply.',
    });
  });

  it('should show an error message if applying the patch fails', async () => {
    const args = ['file.txt'];
    const diff = '--- a/file.txt\n+++ b/file.txt\n@@ -1 +1 @@\n-old\n+new';
    const originalContent = 'old';

    dependencies.getDiff.mockReturnValue(diff);
    fs.promises.readFile.mockResolvedValue(originalContent);
    applyPatch.mockReturnValue(false);

    await applyCommand.execute(args);

    expect(dependencies.addMessage).toHaveBeenCalledWith({
      sender: 'system',
      text: 'Failed to apply patch.',
    });
  });
});
