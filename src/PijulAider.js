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
      // How to detect a pijul repo?
      // For now, we'll just check for a .pijul directory
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
      console.log('To migrate from Git to Pijul, please run the following commands:');
      console.log('1. Install pijul-git: `cargo install pijul-git`');
      console.log('2. Run `pijul-git import` in your Git repository.');
    } else {
      // TODO: Implement migration
      console.log(`Migrating from ${from} to ${to}...`);
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
      }

      this.messages.push({ sender: 'user', text: query });
      const response = await this.chain.invoke({
        input: query,
        chat_history: this.messages,
      });
      this.messages.push({ sender: 'ai', text: response });

      // TODO: Extract the diff from the response and apply it
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
