const Container = require('./Container');
const CommandManager = require('./CommandManager');
const UIManager = require('./UIManager');
const BackendManager = require('./BackendManager');
const LLMManager = require('./LLMManager');
const MessageHandler = require('./MessageHandler');
const FileManager = require('./FileManager');
const LLMChain = require('./LLMChain');
const PijulAider = require('./PijulAider');
const { execa, fs } = require('./dependencies');

function bootstrap(options) {
  const container = new Container();

  container.register('options', options);
  container.register('backend', null);
  container.register('diff', '');

  container.register('uiManager', (c) => {
    const aider = c.get('aider');
    return new UIManager(aider, aider.onSendMessage.bind(aider), () => c.get('diff'));
  });

  container.register('messageHandler', (c) => {
    return new MessageHandler(c.get('uiManager'));
  });

  container.register('backendManager', (c) => {
    const dependencies = {
      execa,
      fs,
      addMessage: c.get('messageHandler').addMessage.bind(c.get('messageHandler')),
      getBackend: () => c.get('backend'),
      setBackend: (backend) => c.register('backend', backend),
      getOptions: () => c.get('options'),
    };
    return new BackendManager(dependencies);
  });

  container.register('fileManager', (c) => {
    return new FileManager(c.get('backend'), c.get('messageHandler'));
  });

  container.register('llmManager', () => new LLMManager());

  container.register('llmChain', (c) => {
    const llmManager = c.get('llmManager');
    const llm = llmManager.createLlm(c.get('options').provider, c.get('options').model);
    return new LLMChain(llm, c.get('messageHandler'), c.get('backend'), c.get('options'));
  });

  container.register('commandManager', (c) => {
    const dependencies = {
      execa,
      fs,
      addMessage: c.get('messageHandler').addMessage.bind(c.get('messageHandler')),
      getBackend: () => c.get('backend'),
      setBackend: (backend) => c.register('backend', backend),
      getOptions: () => c.get('options'),
      setDiff: (diff) => c.register('diff', diff),
      getCodebase: () => c.get('fileManager').getCodebase(),
      setCodebase: (codebase) => c.get('fileManager').setCodebase(codebase),
      handleSpeech: () => c.get('aider').handleSpeech(),
      handleQuery: (query) => c.get('aider').handleQuery(query),
      getTerminal: () => c.get('aider').terminal,
      setTerminal: (terminal) => {
        const aider = c.get('aider');
        aider.terminal = terminal;
      },
    };
    return new CommandManager(dependencies);
  });

  container.register('aider', (c) => new PijulAider(c));

  return container;
}

module.exports = bootstrap;
