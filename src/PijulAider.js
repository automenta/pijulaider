const { ChatOpenAI } = require('@langchain/openai');
const { ChatAnthropic } = require('@langchain/anthropic');
const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { ChatPromptTemplate } = require('@langchain/core/prompts');
const { StringOutputParser } = require('@langchain/core/output_parsers');
const FileBackend = require('./versioning/FileBackend');
const GitBackend = require('./versioning/GitBackend');
const PijulBackend = require('./versioning/PijulBackend');
const { execa } = require('execa');
const React = require('react');
const { render } = require('ink');
const Chat = require('./tui/Chat');
const { editFile } = require('edit-file');
const inquirer = require('inquirer');
const { parseDiff, applyDiff } = require('./diffUtils');
const filePicker = require('file-picker');
const fs = require('fs').promises;

const { execa: defaultExeca } = require('execa');

class PijulAider {
  constructor(options, execa = defaultExeca) {
    this.options = options;
    this.llm = this.createLlm(options.provider, options.model);
    this.execa = execa;
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

  async handleCommand(command, args) {
    try {
      switch (command) {
        case 'add':
          for (const file of args) {
            await this.backend.add(file);
            const content = await fs.readFile(file, 'utf-8');
            this.codebase += `--- ${file} ---\n${content}\n\n`;
            this.messages.push({ sender: 'system', text: `Added ${file} to the chat.` });
          }
          break;
        case 'drop':
          for (const file of args) {
            const fileRegex = new RegExp(`--- ${file} ---\\n[\\s\\S]*?\\n\\n`);
            if (this.codebase.match(fileRegex)) {
              this.codebase = this.codebase.replace(fileRegex, '');
              this.messages.push({ sender: 'system', text: `Removed ${file} from the chat.` });
            } else {
              this.messages.push({ sender: 'system', text: `File ${file} not found in the chat.` });
            }
          }
          break;
        case 'diff':
          this.diff = await this.backend.diff();
          this.messages.push({ sender: 'system', text: 'Diff updated.' });
          break;
        case 'edit':
          if (args.length > 0) {
            await editFile(args[0]);
            this.diff = await this.backend.diff();
            this.messages.push({ sender: 'system', text: `Finished editing ${args[0]}.` });
          } else {
            this.messages.push({ sender: 'system', text: 'Please specify a file to edit.' });
          }
          break;
        case 'record':
          await this.backend.record(args.join(' '));
          this.messages.push({ sender: 'system', text: 'Changes recorded.' });
          break;
        case 'unrecord':
          if (typeof this.backend.unrecord === 'function') {
            await this.backend.unrecord(args[0]);
            this.messages.push({ sender: 'system', text: `Unrecorded change ${args[0]}` });
          } else {
            this.messages.push({ sender: 'system', text: 'This backend does not support unrecord.' });
          }
          break;
        case 'undo':
          await this.backend.undo();
          this.diff = await this.backend.diff();
          this.messages.push({ sender: 'system', text: 'Undid the last change.' });
          break;
        case 'channel':
          if (typeof this.backend.channel === 'function') {
            const subcommand = args[0];
            const name = args[1];
            if (subcommand === 'new') {
              await this.backend.channel(subcommand, name);
              this.messages.push({ sender: 'system', text: `Created channel ${name}` });
            } else if (subcommand === 'switch') {
              await this.backend.channel(subcommand, name);
              this.messages.push({ sender: 'system', text: `Switched to channel ${name}` });
            } else if (subcommand === 'list') {
              const channels = await this.backend.channel(subcommand);
              this.messages.push({ sender: 'system', text: `Channels:\n${channels}` });
            } else {
              this.messages.push({ sender: 'system', text: 'Usage: /channel [new|switch|list] [name]' });
            }
          } else {
            this.messages.push({ sender: 'system', text: 'This backend does not support channels.' });
          }
          break;
        case 'patch':
          if (typeof this.backend.patch === 'function') {
            const subcommand = args[0];
            const name = args[1];
            if (subcommand === 'list') {
              const patches = await this.backend.patch(subcommand);
              this.messages.push({ sender: 'system', text: `Patches:\n${patches}` });
            } else if (subcommand === 'apply') {
              await this.backend.apply(name);
              this.messages.push({ sender: 'system', text: `Applied patch ${name}` });
            } else {
              this.messages.push({ sender: 'system', text: 'Usage: /patch [list|apply] [hash]' });
            }
          } else {
            this.messages.push({ sender: 'system', text: 'This backend does not support patches.' });
          }
          break;
        case 'conflicts':
          if (typeof this.backend.conflicts === 'function') {
            const conflicts = await this.backend.conflicts();
            try {
              const parsedConflicts = JSON.parse(conflicts);
              if (Array.isArray(parsedConflicts) && parsedConflicts.length > 0) {
                let conflictMessage = 'Conflicts:\n';
                for (const conflict of parsedConflicts) {
                  if (typeof conflict === 'string') {
                    conflictMessage += `- ${conflict}\n`;
                  } else if (typeof conflict === 'object' && conflict.hash) {
                    conflictMessage += `- ${conflict.hash}\n`;
                  }
                }
                this.messages.push({ sender: 'system', text: conflictMessage });
              } else {
                this.messages.push({ sender: 'system', text: 'No conflicts found.' });
              }
            } catch (error) {
              this.messages.push({ sender: 'system', text: conflicts });
            }
          } else {
            this.messages.push({ sender: 'system', text: 'This backend does not support conflicts.' });
          }
          break;
        case 'run':
          const { stdout } = await this.execa(args[0], args.slice(1));
          this.messages.push({ sender: 'system', text: `\`/${command} ${args.join(' ')}\`\n${stdout}` });
          break;
        case 'test':
          try {
            await this.execa('npm', ['test']);
            this.messages.push({ sender: 'system', text: 'All tests passed!' });
          } catch (error) {
            this.messages.push({
              sender: 'system',
              text: `Tests failed. Attempting to fix...\n${error.stdout}`,
            });
            await this.handleQuery(`The tests failed with the following output:\n${error.stdout}\nPlease fix the tests.`);
          }
          break;
        case 'speech':
          this.messages.push({ sender: 'system', text: 'Recording...' });
          await this.handleSpeech();
          break;
        case 'image':
          const [imagePath] = await filePicker({
            type: 'image',
            multiple: false,
          });
          if (imagePath) {
            this.messages.push({ sender: 'user', image: imagePath });
          }
          break;
        case 'help':
          this.messages.push({
            sender: 'system',
            text: `
Available commands:
/add <file>... - Add files to the chat
/drop <file>... - Remove files from the chat
/run <command> - Run a shell command
/undo - Undo the last change
/diff - Show the current diff
/edit <file> - Edit a file
/record <message> - Record a change
/unrecord <hash> - Unrecord a change
/channel [new|switch|list] [name] - Manage channels (Pijul) or branches (Git)
/patch [list|apply] [hash] - Manage patches (Pijul)
/conflicts - List conflicts
/test - Run the test suite
/image - Add an image to the conversation
/help - Show this help message
            `,
          });
          break;
        default:
          this.messages.push({ sender: 'system', text: `Unknown command: ${command}` });
      }
    } catch (error) {
      this.messages.push({ sender: 'system', text: `Error executing command ${command}: ${error.message}` });
    }
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

  async start(files, globFn) {
    try {
      await this.initialize();
      await this.loadFiles(files, globFn);
    } catch (error) {
      // Errors are already pushed to this.messages in the respective methods
      this.rerender();
      return;
    }

    this.onSendMessage = async (query) => {
      this.messages.push({ sender: 'user', text: query });

      if (query.startsWith('/')) {
        const [command, ...args] = query.slice(1).split(' ');
        await this.handleCommand(command, args);
      } else {
        await this.handleQuery(query);
      }

      this.rerender();
    };

    const App = () => (
      <Chat
        messages={this.messages}
        onSendMessage={this.onSendMessage}
        diff={this.diff}
      />
    );

    this.rerender = () => {
      render(React.createElement(App));
    };

    this.rerender();
  }

  async run(files, globFn) {
    await this.start(files, globFn);
  }

  getOnSendMessage() {
    return this.onSendMessage;
  }
}

module.exports = PijulAider;
