class SpeechCommand {
  constructor(aider) {
    this.aider = aider;
  }

  async execute() {
    this.aider.addMessage({ sender: 'system', text: 'Recording...' });
    await this.aider.handleSpeech();
  }
}

module.exports = SpeechCommand;
