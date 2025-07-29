const CommandManager = require('./CommandManager');
const UIManager = require('./UIManager');
const BackendManager = require('./BackendManager');
const LLMManager = require('./LLMManager');
const MessageHandler = require('./MessageHandler');
const FileManager = require('./FileManager');
const LLMChain = require('./LLMChain');
const { execa, fs } = require('./dependencies');

class PijulAider {
  constructor(options) {
    this.options = options;
    this.backend = null;
    this.diff = '';

    this.uiManager = new UIManager(this, this.onSendMessage.bind(this), () => this.diff);
    this.messageHandler = new MessageHandler(this.uiManager);

    const dependencies = {
      execa,
      fs,
      addMessage: this.messageHandler.addMessage.bind(this.messageHandler),
      getBackend: () => this.backend,
      setBackend: (backend) => (this.backend = backend),
      getOptions: () => this.options,
      setDiff: (diff) => (this.diff = diff),
      getCodebase: () => this.fileManager.getCodebase(),
      setCodebase: (codebase) => this.fileManager.setCodebase(codebase),
      handleSpeech: () => this.handleSpeech(),
      handleQuery: (query) => this.handleQuery(query),
    };

    this.backendManager = new BackendManager(dependencies);
    this.commandManager = new CommandManager(dependencies);
  }

  async onSendMessage(query) {
    this.messageHandler.addMessage({ sender: 'user', text: query });

    if (query.startsWith('/')) {
      const [command, ...args] = query.slice(1).split(' ');
      await this.commandManager.handleCommand(command, args);
    } else {
      await this.handleQuery(query);
    }

    if (this.uiManager.rerender) {
      this.uiManager.rerender();
    }
  }

  async initialize() {
    this.backend = await this.backendManager.initialize();
    this.fileManager = new FileManager(this.backend, this.messageHandler);
    const llmManager = new LLMManager();
    const llm = llmManager.createLlm(this.options.provider, this.options.model);
    this.llmChain = new LLMChain(llm, this.messageHandler, this.backend, this.options);
  }

  async handleQuery(query) {
    const codebase = this.fileManager.getCodebase();
    this.diff = await this.llmChain.handleQuery(query, codebase, this.diff);
  }

  async start(files, globFn) {
    try {
      await this.initialize();
      await this.fileManager.loadFiles(files, globFn);
      this.diff = await this.backend.diff();
    } catch (error) {
      // Errors are already pushed to this.messages in the respective methods
      if (this.uiManager.rerender) {
        this.uiManager.rerender();
      }
      return;
    }

    this.uiManager.start(this.messageHandler.getMessages());
  }

  async run(files, globFn) {
    await this.start(files, globFn);
  }

  async handleSpeech() {
    // TODO: Implement speech handling
  }
}

module.exports = PijulAider;
