const { editFile } = require('edit-file');

class EditCommand {
  constructor(dependencies) {
    this.dependencies = dependencies;
  }

  async execute(args) {
    const { getBackend, addMessage, setDiff } = this.dependencies;
    if (args.length > 0) {
      await editFile(args[0]);
      const diff = await getBackend().diff();
      setDiff(diff);
      addMessage({ sender: 'system', text: `Finished editing ${args[0]}.` });
    } else {
      addMessage({ sender: 'system', text: 'Please specify a file to edit.' });
    }
  }
}

module.exports = EditCommand;
