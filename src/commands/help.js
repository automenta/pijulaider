class HelpCommand {
  constructor(dependencies) {
    this.dependencies = dependencies;
    this.commandMap = {
      add: 'Add a file to the chat and stage it.',
      clear: 'Clear the current codebase context.',
      codebase: 'Show the current codebase.',
      commit: 'Commit the staged changes.',
      create: 'Create a new file.',
      diff: 'Show the current changes.',
      drop: 'Remove a file from the chat.',
      edit: 'Edit a file.',
      exit: 'Exit the interactive terminal.',
      help: 'Show this help message.',
      ls: 'List files in the current or specified directory.',
      mv: 'Move or rename a file.',
      grep: 'Search for a pattern in files.',
      apply: 'Apply a patch from the chat.',
      record: 'Record the current changes with a message (alias for /commit).',
      rm: 'Remove a file.',
      run: 'Run a shell command or start an interactive terminal.',
      status: 'Show the current status of the repository.',
      test: 'Run the test suite.',
      undo: 'Undo changes to a file or the entire project.',
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
