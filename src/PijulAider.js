const { ChatOpenAI } = require('@langchain/openai');
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

class PijulAider {
  constructor(options) {
    this.options = options;
    this.llm = new ChatOpenAI({ modelName: options.model });
    this.prompt = ChatPromptTemplate.fromTemplate(
      'You are a helpful AI assistant that helps with coding.'
    );
    this.outputParser = new StringOutputParser();
    this.chain = this.prompt.pipe(this.llm).pipe(this.outputParser);
    this.backend = null;
    this.messages = [];
    this.diff = '';
  }

  async detectBackend() {
    try {
      await execa('pijul', ['status']);
      return 'pijul';
    } catch (error) {
      // Not a pijul repository
    }

    try {
      await execa('git', ['rev-parse', '--is-inside-work-tree']);
      return 'git';
    } catch (error) {
      // Not a git repository
    }

    return 'file';
  }

  async migrate(from, to) {
    if (from === 'git' && to === 'pijul') {
      try {
        await execa('pijul-git', ['--version']);
      } catch (error) {
        console.log('pijul-git is not installed. Please install it by running `cargo install pijul-git`.');
        return;
      }

      try {
        console.log('Importing Git repository to Pijul...');
        await execa('pijul-git', ['import']);
        console.log('Migration successful.');
      } catch (error) {
        console.error('Error migrating from Git to Pijul:', error);
      }
    } else if (from === 'file' && to === 'pijul') {
      try {
        console.log('Initializing Pijul repository...');
        await execa('pijul', ['init']);
        console.log('Pijul repository initialized.');
      } catch (error) {
        console.error('Error initializing Pijul repository:', error);
      }
    } else {
      console.log(`Migration from ${from} to ${to} is not supported.`);
    }
  }

  createBackend(backend) {
    switch (backend) {
      case 'file':
        return new FileBackend();
      case 'git':
        return new GitBackend();
      case 'pijul':
        return new PijulBackend();
      default:
        throw new Error(`Unknown backend: ${backend}`);
    }
  }

  async run(files) {
    const currentBackend = await this.detectBackend();
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
        this.backend = this.createBackend('pijul');
      } else {
        this.backend = this.createBackend(currentBackend);
      }
    } else {
      this.backend = this.createBackend(this.options.backend || currentBackend);
    }

    for (const file of files) {
      this.backend.add(file);
    }

    this.diff = await this.backend.diff();

    const onSendMessage = async (query) => {
      this.messages.push({ sender: 'user', text: query });

      if (query.startsWith('/')) {
        const [command, ...args] = query.slice(1).split(' ');
        switch (command) {
          case 'diff':
            this.diff = await this.backend.diff();
            break;
          case 'edit':
            if (args.length > 0) {
              await editFile(args[0]);
              this.diff = await this.backend.diff();
            } else {
              this.messages.push({ sender: 'system', text: 'Please specify a file to edit.' });
            }
            break;
          case 'record':
            await this.backend.record(args.join(' '));
            break;
          case 'unrecord':
            if (typeof this.backend.unrecord === 'function') {
              await this.backend.unrecord(args[0]);
            } else {
              this.messages.push({ sender: 'system', text: 'This backend does not support unrecord.' });
            }
            break;
          case 'channel':
            if (typeof this.backend.channel === 'function') {
              await this.backend.channel(args[0]);
            } else {
              this.messages.push({ sender: 'system', text: 'This backend does not support channels.' });
            }
            break;
          case 'apply':
            if (typeof this.backend.apply === 'function') {
              await this.backend.apply(args[0]);
            } else {
              this.messages.push({ sender: 'system', text: 'This backend does not support apply.' });
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
          case 'help':
            this.messages.push({
              sender: 'system',
              text: `
Available commands:
/diff - Show the current diff
/edit <file> - Edit a file
/record <message> - Record a change
/unrecord <hash> - Unrecord a change
/channel <name> - Switch to a channel (Pijul) or create a branch (Git)
/apply <patch> - Apply a patch
/conflicts - List conflicts
/help - Show this help message
              `,
            });
            break;
          default:
            this.messages.push({ sender: 'system', text: `Unknown command: ${command}` });
        }
      } else {
        const response = await this.chain.invoke({
          input: query,
          chat_history: this.messages,
        });
        this.messages.push({ sender: 'ai', text: response });

        const parsedDiff = parseDiff(response);
        if (parsedDiff) {
          try {
            await applyDiff(parsedDiff);
            this.diff = await this.backend.diff();
          } catch (error) {
            this.messages.push({
              sender: 'system',
              text: 'Error applying diff. Please check the diff and try again.',
            });
          }
        }
      }
      this.rerender();
    };

    const App = () => (
      <Chat
        messages={this.messages}
        onSendMessage={onSendMessage}
        diff={this.diff}
      />
    );

    this.rerender = () => {
      render(React.createElement(App));
    };

    this.rerender();
  }
}

module.exports = PijulAider;
