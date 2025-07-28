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
const fs = require('fs').promises;

const { execa: defaultExeca } = require('execa');

class PijulAider {
  constructor(options, execa = defaultExeca) {
    this.options = options;
    this.llm = new ChatOpenAI({ modelName: options.model });
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
        console.log('pijul-git is not installed. Please install it by running `cargo install pijul-git`.');
        return;
      }

      try {
        console.log('Importing Git repository to Pijul...');
        await this.execa('pijul-git', ['import']);
        console.log('Migration successful.');
      } catch (error) {
        console.error('Error migrating from Git to Pijul:', error);
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

  createBackend(backend) {
    switch (backend) {
      case 'file':
        return new FileBackend(this.execa);
      case 'git':
        return new GitBackend(this.execa);
      case 'pijul':
        return new PijulBackend(this.execa);
      default:
        throw new Error(`Unknown backend: ${backend}`);
    }
  }

  async run(files, globFn) {
    const { glob } = globFn ? { glob: globFn } : require('glob');
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

    const allFiles = files.length > 0 ? files : await glob('**/*', { nodir: true });
    for (const file of allFiles) {
      this.backend.add(file);
      try {
        const content = await fs.readFile(file, 'utf-8');
        this.codebase += `--- ${file} ---\n${content}\n\n`;
      } catch (error) {
        // Ignore files that can't be read
      }
    }

    this.diff = await this.backend.diff();

    this.onSendMessage = async (query) => {
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
            try {
              if (typeof this.backend.unrecord === 'function') {
                await this.backend.unrecord(args[0]);
                this.messages.push({ sender: 'system', text: `Unrecorded change ${args[0]}` });
              } else {
                this.messages.push({ sender: 'system', text: 'This backend does not support unrecord.' });
              }
            } catch (error) {
              this.messages.push({ sender: 'system', text: `Error unrecording change: ${error.message}` });
            }
            break;
          case 'channel':
            try {
              if (typeof this.backend.channel === 'function') {
                await this.backend.channel(args[0]);
                this.messages.push({ sender: 'system', text: `Switched to channel ${args[0]}` });
              } else {
                this.messages.push({ sender: 'system', text: 'This backend does not support channels.' });
              }
            } catch (error) {
              this.messages.push({ sender: 'system', text: `Error switching to channel: ${error.message}` });
            }
            break;
          case 'apply':
            try {
              if (typeof this.backend.apply === 'function') {
                await this.backend.apply(args[0]);
                this.messages.push({ sender: 'system', text: `Applied patch ${args[0]}` });
              } else {
                this.messages.push({ sender: 'system', text: 'This backend does not support apply.' });
              }
            } catch (error) {
              this.messages.push({ sender: 'system', text: `Error applying patch: ${error.message}` });
            }
            break;
          case 'conflicts':
            try {
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
            } catch (error) {
              this.messages.push({ sender: 'system', text: `Error getting conflicts: ${error.message}` });
            }
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
              const response = await this.chain.invoke({
                input: `The tests failed with the following output:\n${error.stdout}\nPlease fix the tests.`,
                chat_history: this.messages,
                codebase: this.codebase,
              });
              this.messages.push({ sender: 'ai', text: response });
              const parsedDiff = parseDiff(response);
              if (parsedDiff) {
                try {
                  await applyDiff(parsedDiff);
                  this.diff = await this.backend.diff();
                  if (this.options.autoCommit) {
                    await this.backend.record('Auto-commit');
                  }
                } catch (error) {
                  this.messages.push({
                    sender: 'system',
                    text: 'Error applying diff. Please check the diff and try again.',
                  });
                }
              }
            }
            break;
          case 'image':
            const { imagePath } = await inquirer.prompt([
              {
                type: 'input',
                name: 'imagePath',
                message: 'Enter the path to the image:',
              },
            ]);
            if (imagePath) {
              this.messages.push({ sender: 'user', image: imagePath });
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
/test - Run the test suite
/image - Add an image to the conversation
/help - Show this help message
              `,
            });
            break;
          default:
            this.messages.push({ sender: 'system', text: `Unknown command: ${command}` });
        }
      } else {
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
              if (this.options.autoCommit) {
                await this.backend.record('Auto-commit');
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

  getOnSendMessage() {
    return this.onSendMessage;
  }
}

module.exports = PijulAider;
