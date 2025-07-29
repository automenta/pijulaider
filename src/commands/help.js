const fs = require('fs');
const path = require('path');

class HelpCommand {
  constructor(dependencies) {
    this.dependencies = dependencies;
    this.commandMap = {
      add: 'Add a file to the chat and stage it.',
      clear: 'Clear the current codebase context.',
      codebase: 'Show the current codebase.',
      commit: 'Commit the staged changes.',
      diff: 'Show the current changes.',
      drop: 'Remove a file from the chat.',
      edit: 'Edit a file.',
      help: 'Show this help message.',
      ls: 'List files in the current directory.',
      record: 'Record the current changes with a message (alias for /commit).',
      run: 'Run a shell command.',
      status: 'Show the current status of the repository.',
      test: 'Run the test suite.',
      undo: 'Undo the last change.',
    };
  }

  async execute() {
    const { addMessage } = this.dependencies;
    let helpMessage = 'Available commands:\n';
    for (const [command, description] of Object.entries(this.commandMap)) {
      helpMessage += `  /${command} - ${description}\n`;
    }
    addMessage({ sender: 'system', text: helpMessage });
  }
}

module.exports = HelpCommand;
