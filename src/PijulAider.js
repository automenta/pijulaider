const { ChatOpenAI } = require('@langchain/openai');
const { ChatAnthropic } = require('@langchain/anthropic');
const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { ChatPromptTemplate } = require('@langchain/core/prompts');
const { StringOutputParser } = require('@langchain/core/output_parsers');
const FileBackend = require('./versioning/FileBackend');
const GitBackend = require('./versioning/GitBackend');
const PijulBackend = require('./versioning/PijulBackend');
const { execa } = require('execa');
const inquirer = require('inquirer');
const { parseDiff, applyDiff } = require('./diffUtils');
const fs = require('fs').promises;
const CommandManager = require('./CommandManager');
const UIManager = require('./UIManager');

class PijulAider {
  constructor(options) {
    this.options = options;
    this.execa = require('execa');
    this.llm = this.createLlm(options.provider, options.model);
    this.prompt = ChatPromptTemplate.fromTemplate(
      `You are a helpful AI assistant that helps with coding.

Here is the current codebase:
{codebase}

Here is the current diff:
{diff}

Here is the output of the last command:
{lastCommandOutput}

Here is the user's query:
{input}`
    );
    this.outputParser = new StringOutputParser();
    this.chain = this.prompt.pipe(this.llm).pipe(this.outputParser);
    this.backend = null;
    this.messages = [];
    this.diff = '';
    this.codebase = '';
    this.commandManager = new CommandManager(this);
    this.uiManager = new UIManager(this);
  }

  createLlm(provider, model) {
    switch (provider) {
      case 'openai':
        return new ChatOpenAI({ modelName: model });
      case 'anthropic':
        return new ChatAnthropic({ modelName: model });
      case 'google':
        return new ChatGoogleGenerativeAI({ modelName: model });
      default:
        throw new Error(`Unknown LLM provider: ${provider}`);
    }
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
      if (currentBackend !== 'pijul' && !this.options.backend) {
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
          this.backend = await this.createBackend('pijul');
          this.messages.push({ sender: 'system', text: 'Successfully migrated to Pijul.' });
        } else {
          this.backend = await this.createBackend(currentBackend);
        }
      } else {
        this.backend = await this.createBackend(this.options.backend || currentBackend);
      }
    } catch (error) {
      this.messages.push({ sender: 'system', text: `Error initializing backend: ${error.message}` });
      throw error;
    }
  }

  async loadFiles(files, globFn) {
    const { glob } = globFn ? { glob: globFn } : require('glob');
    const allFiles = files.length > 0 ? files : await glob('**/*', { nodir: true });
    for (const file of allFiles) {
      try {
        await this.backend.add(file);
        const content = await fs.readFile(file, 'utf-8');
        this.codebase += `--- ${file} ---\n${content}\n\n`;
      } catch (error) {
        this.messages.push({ sender: 'system', text: `Error loading file ${file}: ${error.message}` });
      }
    }
    this.diff = await this.backend.diff();
  }


  async handleQuery(query) {
    try {
      const lastCommandOutput = this.messages.length > 0 ? this.messages[this.messages.length - 1].text : '';
      const response = await this.chain.invoke({
        input: query,
        chat_history: this.messages,
        codebase: this.codebase,
        diff: this.diff,
        lastCommandOutput,
      });
      this.messages.push({ sender: 'ai', text: response });

      const parsedDiff = parseDiff(response);
      if (parsedDiff) {
        try {
          await applyDiff(parsedDiff);
          this.diff = await this.backend.diff();
          this.messages.push({ sender: 'system', text: 'Diff applied successfully.' });
          if (this.options.autoCommit) {
            await this.backend.record('Auto-commit');
            this.messages.push({ sender: 'system', text: 'Changes auto-committed.' });
          }
        } catch (error) {
          this.messages.push({
            sender: 'system',
            text: `Error applying diff: ${error.message}`,
          });
        }
      }
    } catch (error) {
      this.messages.push({
        sender: 'system',
        text: `Error invoking LLM: ${error.message}`,
      });
    }
  }

  addMessage(message) {
    this.messages.push(message);
    if (this.uiManager.rerender) {
      this.uiManager.rerender();
    }
  }

  async start(files, globFn) {
    try {
      await this.initialize();
      await this.loadFiles(files, globFn);
    } catch (error) {
      // Errors are already pushed to this.messages in the respective methods
      if (this.uiManager.rerender) {
        this.uiManager.rerender();
      }
      return;
    }

    this.uiManager.start();
  }

  async run(files, globFn) {
    await this.start(files, globFn);
  }
}

module.exports = PijulAider;
