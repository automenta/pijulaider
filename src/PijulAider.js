const { ChatPromptTemplate } = require('@langchain/core/prompts');
const { StringOutputParser } = require('@langchain/core/output_parsers');
const { parseDiff, applyDiff } = require('./diffUtils');
const CommandManager = require('./CommandManager');
const UIManager = require('./UIManager');
const BackendManager = require('./BackendManager');
const LLMManager = require('./LLMManager');
const { execa, fs } = require('./dependencies');

class PijulAider {
  constructor(options) {
    this.options = options;
    this.llmManager = new LLMManager();
    this.llm = this.llmManager.createLlm(options.provider, options.model);
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

    const dependencies = {
      execa,
      fs,
      addMessage: this.addMessage.bind(this),
      getBackend: () => this.backend,
      setBackend: (backend) => (this.backend = backend),
      getOptions: () => this.options,
      setDiff: (diff) => (this.diff = diff),
      getCodebase: () => this.codebase,
      setCodebase: (codebase) => (this.codebase = codebase),
      handleSpeech: () => this.handleSpeech(),
      handleQuery: (query) => this.handleQuery(query),
    };

    this.commandManager = new CommandManager(dependencies);
    this.uiManager = new UIManager(this, this.onSendMessage.bind(this), () => this.diff);
    this.backendManager = new BackendManager(dependencies);
  }

  async onSendMessage(query) {
    this.addMessage({ sender: 'user', text: query });

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
        this.addMessage({ sender: 'system', text: `Error loading file ${file}: ${error.message}` });
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

  async handleSpeech() {
    // TODO: Implement speech handling
  }
}

module.exports = PijulAider;
