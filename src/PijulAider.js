class PijulAider {
  constructor(container) {
    this.container = container;
    this.options = container.get('options');
    this.uiManager = container.get('uiManager');
    this.messageHandler = container.get('messageHandler');
    this.commandManager = container.get('commandManager');
    this.fileManager = container.get('fileManager');
    this.llmChain = container.get('llmChain');
    this.backendManager = container.get('backendManager');
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
    const backend = await this.backendManager.initialize();
    this.container.register('backend', backend);
  }

  async handleQuery(query) {
    const codebase = this.fileManager.getCodebase();
    const diff = await this.llmChain.handleQuery(query, codebase, this.container.get('diff'));
    this.container.register('diff', diff);
  }

  async start(files, globFn) {
    try {
      await this.initialize();
      await this.fileManager.loadFiles(files, globFn);
      const diff = await this.container.get('backend').diff();
      this.container.register('diff', diff);
    } catch (error) {
      this.messageHandler.addMessage({ sender: 'system', text: error.message });
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
