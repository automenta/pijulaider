const FileBackend = require('./versioning/FileBackend');
const GitBackend = require('./versioning/GitBackend');
const PijulBackend = require('./versioning/PijulBackend');
const { execa } = require('execa');
const inquirer = require('inquirer');

class BackendManager {
  constructor(aider) {
    this.aider = aider;
    this.execa = execa;
  }

  async detectBackend() {
    try {
      await this.execa('pijul', ['status']);
      return 'pijul';
    } catch (error) {
      // Not a pijul repository
    }

    try {
      await this.execa('git', ['rev-parse', '--is-inside-work-tree']);
      return 'git';
    } catch (error) {
      // Not a git repository
    }

    return 'file';
  }

  async migrate(from, to) {
    if (from === 'git' && to === 'pijul') {
      try {
        await this.execa('pijul-git', ['--version']);
      } catch (error) {
        throw new Error('pijul-git is not installed. Please install it by running `cargo install pijul-git`.');
      }

      try {
        console.log('Importing Git repository to Pijul...');
        await this.execa('pijul-git', ['import']);
        console.log('Migration successful.');
      } catch (error) {
        throw new Error(`Error migrating from Git to Pijul: ${error.message}`);
      }
    } else if (from === 'file' && to === 'pijul') {
      try {
        console.log('Initializing Pijul repository...');
        await this.execa('pijul', ['init']);
        console.log('Pijul repository initialized.');
      } catch (error) {
        console.error('Error initializing Pijul repository:', error);
      }
    } else {
      console.log(`Migration from ${from} to ${to} is not supported.`);
    }
  }

  async createBackend(backend) {
    switch (backend) {
      case 'file':
        return new FileBackend(this.execa);
      case 'git':
        try {
          await this.execa('git', ['--version']);
          return new GitBackend(this.execa);
        } catch (error) {
          throw new Error('Git is not installed. Please install it to use the Git backend.');
        }
      case 'pijul':
        try {
          await this.execa('pijul', ['--version']);
          return new PijulBackend(this.execa);
        } catch (error) {
          throw new Error('Pijul is not installed. Please install it to use the Pijul backend.');
        }
      default:
        throw new Error(`Unknown backend: ${backend}`);
    }
  }

  async initialize() {
    const currentBackend = await this.detectBackend();
    try {
      if (currentBackend !== 'pijul' && !this.aider.options.backend) {
        const { switchToPijul } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'switchToPijul',
            message: 'Pijul is the recommended versioning backend. Would you like to switch to Pijul?',
            default: true,
          },
        ]);

        if (switchToPijul) {
          await this.migrate(currentBackend, 'pijul');
          this.aider.backend = await this.createBackend('pijul');
          this.aider.addMessage({ sender: 'system', text: 'Successfully migrated to Pijul.' });
        } else {
          this.aider.backend = await this.createBackend(currentBackend);
        }
      } else {
        this.aider.backend = await this.createBackend(this.aider.options.backend || currentBackend);
      }
    } catch (error) {
      this.aider.addMessage({ sender: 'system', text: `Error initializing backend: ${error.message}` });
      throw error;
    }
  }
}

module.exports = BackendManager;
