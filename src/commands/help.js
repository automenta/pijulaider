class HelpCommand {
  constructor(dependencies) {
    this.dependencies = dependencies;
  }

  execute() {
    this.dependencies.addMessage({
      sender: 'system',
      text: `
Available commands:
/add <file>... - Add files to the chat
/drop <file>... - Remove files from the chat
/run <command> - Run a shell command
/undo - Undo the last change
/diff - Show the current diff
/edit <file> - Edit a file
/record <message> - Record a change
/unrecord <hash> - Unrecord a change
/channel [new|switch|list] [name] - Manage channels (Pijul) or branches (Git)
/patch [list|apply] [hash] - Manage patches (Pijul)
/conflicts - List conflicts
/test - Run the test suite
/image - Add an image to the conversation
/help - Show this help message
      `,
    });
  }
}

module.exports = HelpCommand;
