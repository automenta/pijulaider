const React = require('react');
const { render } = require('ink');
const Chat = require('./tui/Chat');

class UIManager {
  constructor(aider) {
    this.aider = aider;
    this.rerender = null;
  }

  start() {
    this.aider.onSendMessage = async (query) => {
      this.aider.addMessage({ sender: 'user', text: query });

      if (query.startsWith('/')) {
        const [command, ...args] = query.slice(1).split(' ');
        await this.aider.commandManager.handleCommand(command, args);
      } else {
        await this.aider.handleQuery(query);
      }

      this.rerender();
    };

    const App = () => (
      <Chat
        messages={this.aider.messages}
        onSendMessage={this.aider.onSendMessage}
        diff={this.aider.diff}
      />
    );

    this.rerender = () => {
      render(React.createElement(App));
    };

    this.rerender();
  }
}

module.exports = UIManager;
