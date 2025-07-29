import FileBackend from './versioning/FileBackend';
import GitBackend from './versioning/GitBackend';
import PijulBackend from './versioning/PijulBackend';
import inquirer from 'inquirer';

class BackendManager {
  constructor({ execa, addMessage, getOptions, setBackend }) {
    this.execa = execa;
    this.addMessage = addMessage;
    this.getOptions = getOptions;
    this.setBackend = setBackend;
    this.backendMap = {
      file: FileBackend,
      git: GitBackend,
      pijul: PijulBackend,
    };
  }

  async detectBackend() {
    const backends = ['pijul', 'git'];
    for (const backend of backends) {
      try {
        await this.execa(backend, ['status']);
        return backend;
      } catch (error) {
        // Not this backend
      }
    }
    return 'file';
  }

  async migrate(from, to) {
    if (from === 'git' && to === 'pijul') {
      try {
        await this.execa('pijul-git', ['--version']);
        this.addMessage({ sender: 'system', text: 'Importing Git repository to Pijul...' });
        await this.execa('pijul-git', ['import']);
        this.addMessage({ sender: 'system', text: 'Migration successful.' });
      } catch (error) {
        throw new Error('pijul-git is not installed. Please install it by running `cargo install pijul-git`.');
      }
    } else if (from === 'file' && to === 'pijul') {
      this.addMessage({ sender: 'system', text: 'Initializing Pijul repository...' });
      await this.execa('pijul', ['init']);
      this.addMessage({ sender: 'system', text: 'Pijul repository initialized.' });
    } else {
      this.addMessage({
        sender: 'system',
        text: `Migration from ${from} to ${to} is not supported.`,
      });
    }
  }

  async createBackend(backend) {
    if (this.backendMap[backend]) {
      try {
        await this.execa(backend, ['--version']);
        return new this.backendMap[backend](this.execa);
      } catch (error) {
        throw new Error(`${backend} is not installed. Please install it to use the ${backend} backend.`);
      }
    }
    throw new Error(`Unknown backend: ${backend}`);
  }

  async initialize() {
    const options = this.getOptions();
    let backendType = options.backend || (await this.detectBackend());

    if (backendType !== 'pijul' && !options.backend) {
      const { switchToPijul } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'switchToPijul',
          message: 'Pijul is the recommended versioning backend. Would you like to switch to Pijul?',
          default: true,
        },
      ]);

      if (switchToPijul) {
        await this.migrate(backendType, 'pijul');
        backendType = 'pijul';
      }
    }

    try {
      const backend = await this.createBackend(backendType);
      this.setBackend(backend);
      return backend;
    } catch (error) {
      this.addMessage({ sender: 'system', text: `Error initializing backend: ${error.message}` });
      throw error;
    }
  }
}

export default BackendManager;
