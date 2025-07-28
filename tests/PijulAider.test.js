const PijulAider = require('../src/PijulAider');
const FileBackend = require('../src/versioning/FileBackend');
const GitBackend = require('../src/versioning/GitBackend');
const PijulBackend = require('../src/versioning/PijulBackend');

jest.mock('execa');
const { execa } = require('execa');

jest.mock('inquirer');
const inquirer = require('inquirer');

describe('PijulAider', () => {
  let aider;

  beforeEach(() => {
    aider = new PijulAider({ model: 'test-model' });
  });

  describe('backend selection', () => {
    it('should use file backend by default', () => {
      expect(aider.backend).toBeInstanceOf(FileBackend);
    });

    it('should use git backend when in a git repo', async () => {
      execa.mockResolvedValue({ stdout: 'true' });
      const newAider = new PijulAider({ model: 'test-model' });
      await newAider.run([]);
      expect(newAider.backend).toBeInstanceOf(GitBackend);
    });

    it('should use pijul backend when in a pijul repo', async () => {
      execa.mockRejectedValue(new Error()); // git check fails
      jest.spyOn(require('fs'), 'existsSync').mockReturnValue(true);
      const newAider = new PijulAider({ model: 'test-model' });
      await newAider.run([]);
      expect(newAider.backend).toBeInstanceOf(PijulBackend);
    });
  });

  describe('graceful fallbacks', () => {
    it('should handle unrecord on file backend', async () => {
      aider.backend = new FileBackend();
      const messageSpy = jest.spyOn(aider.messages, 'push');
      await aider.onSendMessage('/unrecord foo');
      expect(messageSpy).toHaveBeenCalledWith({ sender: 'system', text: 'This backend does not support unrecord.' });
    });

    it('should handle channel on git backend', async () => {
      aider.backend = new GitBackend();
      const messageSpy = jest.spyOn(aider.messages, 'push');
      await aider.onSendMessage('/channel foo');
      expect(messageSpy).toHaveBeenCalledWith({ sender: 'system', text: 'This backend does not support channels.' });
    });
  });

  describe('migration', () => {
    it('should prompt for migration when git is detected', async () => {
      execa.mockResolvedValue({ stdout: 'true' });
      inquirer.prompt.mockResolvedValue({ switchToPijul: true });
      const migrateSpy = jest.spyOn(aider, 'migrate');
      await aider.run([]);
      expect(migrateSpy).toHaveBeenCalledWith('git', 'pijul');
    });
  });
});
