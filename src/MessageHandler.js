class MessageHandler {
  constructor(uiManager) {
    this.messages = [];
    this.uiManager = uiManager;
  }

  addMessage(message) {
    this.messages.push(message);
    if (this.uiManager && this.uiManager.rerender) {
      this.uiManager.rerender();
    }
  }

  getMessages() {
    return this.messages;
  }
}

export default MessageHandler;
