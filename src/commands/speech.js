class SpeechCommand {
  constructor(dependencies) {
    this.dependencies = dependencies;
  }

  async execute() {
    const { addMessage, handleSpeech } = this.dependencies;
    addMessage({ sender: 'system', text: 'Recording...' });
    await handleSpeech();
  }
}

module.exports = SpeechCommand;
