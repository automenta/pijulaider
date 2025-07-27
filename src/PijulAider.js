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
    for (const file of files) {
      this.backend.add(file);
    }

    let diff = await this.backend.diff();

    const onSendMessage = async (query) => {
      if (query === '/diff') {
        diff = await this.backend.diff();
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
