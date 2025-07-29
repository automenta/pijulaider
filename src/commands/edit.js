const { editFile } = require('edit-file');

class EditCommand {
  constructor(aider) {
    this.aider = aider;
  }

  async execute(args) {
    if (args.length > 0) {
      await editFile(args[0]);
      this.aider.diff = await this.aider.backend.diff();
      this.aider.addMessage({ sender: 'system', text: `Finished editing ${args[0]}.` });
    } else {
      this.aider.addMessage({ sender: 'system', text: 'Please specify a file to edit.' });
    }
  }
}

module.exports = EditCommand;
