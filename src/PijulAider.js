const { OpenAI } = require('langchain/llms/openai');
const { ChatPromptTemplate } = require('langchain/prompts');
const { StringOutputParser } = require('langchain/schema/output_parser');
const FileBackend = require('./versioning/FileBackend');
const GitBackend = require('./versioning/GitBackend');
const PijulBackend = require('./versioning/PijulBackend');

const React = require('react');
const { render } = require('ink');
const Chat = require('./tui/Chat');

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
    // TODO: Implement backend detection
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
    if (currentBackend !== 'pijul' && this.options.backend !== 'pijul') {
      console.log('Pijul is the recommended versioning backend. Would you like to switch to Pijul? (y/n)');
      // TODO: Get user input
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
        // TODO: Implement in-file edits
        console.log('In-file edits are not supported yet.');
        return;
      }

      this.messages.push({ sender: 'user', text: query });
      const response = await this.chain.invoke({
        input: query,
        chat_history: this.messages,
      });
      this.messages.push({ sender: 'ai', text: response });
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
