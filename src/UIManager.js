import React from 'react';
import Chat from './tui/Chat';

class UIManager {
  constructor(aider, onSendMessage, getDiff) {
    this.aider = aider;
    this.onSendMessage = onSendMessage;
    this.getDiff = getDiff;
    this.rerender = null;
    this.render = null;
  }

  async start(messages) {
    const { render } = await import('ink');
    this.render = render;

    const App = () => (
      <Chat
        messages={messages}
        onSendMessage={this.onSendMessage}
        diff={this.getDiff()}
      />
    );

    this.rerender = () => {
      this.render(React.createElement(App));
    };

    this.rerender();
  }
}

export default UIManager;
