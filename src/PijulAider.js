const { OpenAI } = require('langchain/llms/openai');
const { ChatPromptTemplate } = require('langchain/prompts');
const { StringOutputParser } = require('langchain/schema/output_parser');
const FileBackend = require('./versioning/FileBackend');
const GitBackend = require('./versioning/GitBackend');
const PijulBackend = require('./versioning/PijulBackend');
const { execa } = require('execa');
const React = require('react');
const { render } = require('ink');
const Chat = require('./tui/Chat');
const { editFile } = require('edit-file');
const inquirer = require('inquirer');

class PijulAider {
  constructor(options) {
    this.options = options;
    this.llm = new OpenAI({ modelName: options.model });
    this.prompt = ChatPromptTemplate.fromTemplate(
      'You are a helpful AI assistant that helps with coding.'
    );
    this.outputParser = new StringOutputParser();
    this.chain = this.prompt.pipe(this.llm).pipe(this.outputParser);
    this.backend = this.createBackend(options.backend);
    this.messages = [];
  }

  async detectBackend() {
    try {
      await execa('git', ['rev-parse', '--is-inside-work-tree']);
      return 'git';
    } catch (error) {
      // Not a git repository
    }

    try {
      const fs = require('fs');
      if (fs.existsSync('.pijul')) {
        return 'pijul';
      }
    } catch (error) {
      // Not a pijul repository
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

    let diff = await this.backend.diff();

    const onSendMessage = async (query) => {
      if (query === '/diff') {
        diff = await this.backend.diff();
        return;
      } else if (query.startsWith('/edit')) {
        const fileToEdit = query.split(' ')[1];
        if (fileToEdit) {
          await editFile(fileToEdit);
          diff = await this.backend.diff();
        } else {
          console.log('Please specify a file to edit.');
        }
        return;
      } else if (query.startsWith('/record')) {
        const message = query.split(' ').slice(1).join(' ');
        await this.backend.record(message);
        return;
      } else if (query.startsWith('/unrecord')) {
        if (typeof this.backend.unrecord !== 'function') {
          this.messages.push({ sender: 'system', text: 'This backend does not support unrecord.' });
          return;
        }
        const hash = query.split(' ')[1];
        await this.backend.unrecord(hash);
        return;
      } else if (query.startsWith('/channel')) {
        if (typeof this.backend.channel !== 'function') {
          this.messages.push({ sender: 'system', text: 'This backend does not support channels.' });
          return;
        }
        const name = query.split(' ')[1];
        await this.backend.channel(name);
        return;
      } else if (query.startsWith('/apply')) {
        if (typeof this.backend.apply !== 'function') {
          this.messages.push({ sender: 'system', text: 'This backend does not support apply.' });
          return;
        }
        const patch = query.split(' ')[1];
        await this.backend.apply(patch);
        return;
      } else if (query.startsWith('/conflicts')) {
        if (typeof this.backend.conflicts !== 'function') {
          this.messages.push({ sender: 'system', text: 'This backend does not support conflicts.' });
          return;
        }
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
        return;
      } else if (query === '/help') {
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
        return;
      }

      this.messages.push({ sender: 'user', text: query });
      const response = await this.chain.invoke({
        input: query,
        chat_history: this.messages,
      });
      this.messages.push({ sender: 'ai', text: response });

      const { parseDiff, applyDiff } = require('./diffUtils');
      const parsedDiff = parseDiff(response);
      if (parsedDiff) {
        try {
          await applyDiff(parsedDiff);
          diff = await this.backend.diff();
        } catch (error) {
          this.messages.push({
            sender: 'system',
            text: 'Error applying diff. Please check the diff and try again.',
          });
        }
      }
    };

    const App = () => (
      <Chat
        messages={this.messages}
        onSendMessage={onSendMessage}
        diff={diff}
      />
    );

    render(React.createElement(App));
  }
}

module.exports = PijulAider;
