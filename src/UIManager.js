const React = require('react');
const { render } = require('ink');
const Chat = require('./tui/Chat');

class UIManager {
  constructor(aider, onSendMessage, getDiff) {
    this.aider = aider;
    this.onSendMessage = onSendMessage;
    this.getDiff = getDiff;
    this.rerender = null;
  }

  start(messages) {
    const App = () => (
      <Chat
        messages={messages}
        onSendMessage={this.onSendMessage}
        diff={this.getDiff()}
      />
    );

    this.rerender = () => {
      render(React.createElement(App));
    };

    this.rerender();
  }
}

module.exports = UIManager;
