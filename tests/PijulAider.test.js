const PijulAider = require('../src/PijulAider');
const execa = require('execa');
const fs = require('fs');
const inquirer = require('inquirer');

jest.mock('execa');
jest.mock('fs');
jest.mock('inquirer');

describe('PijulAider', () => {
  let aider;
  beforeEach(() => {
    aider = new PijulAider({ backend: 'file' });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should detect git backend', async () => {
    execa.mockResolvedValue({ stdout: 'true' });
    const backend = await aider.detectBackend();
    expect(backend).toBe('git');
  });

  it('should detect pijul backend', async () => {
    execa.mockRejectedValue(new Error());
    fs.existsSync.mockReturnValue(true);
    const backend = await aider.detectBackend();
    expect(backend).toBe('pijul');
  });

  it('should detect file backend', async () => {
    execa.mockRejectedValue(new Error());
    fs.existsSync.mockReturnValue(false);
    const backend = await aider.detectBackend();
    expect(backend).toBe('file');
  });

  it('should migrate from git to pijul', async () => {
    execa.mockResolvedValue({ stdout: 'pijul-git version 0.1.0' });
    await aider.migrate('git', 'pijul');
    expect(execa).toHaveBeenCalledWith('pijul-git', ['import']);
  });

  it('should migrate from file to pijul', async () => {
    await aider.migrate('file', 'pijul');
    expect(execa).toHaveBeenCalledWith('pijul', ['init']);
  });

  it('should prompt to switch to pijul', async () => {
    execa.mockRejectedValue(new Error());
    fs.existsSync.mockReturnValue(false);
    inquirer.prompt.mockResolvedValue({ switchToPijul: true });
    await aider.run([]);
    expect(inquirer.prompt).toHaveBeenCalled();
    expect(execa).toHaveBeenCalledWith('pijul', ['init']);
  });
});
