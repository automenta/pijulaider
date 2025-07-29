const { applyPatch } = require('diff');
const fs = require('fs');

class ApplyCommand {
  constructor(dependencies) {
    this.dependencies = dependencies;
  }

  async execute(args) {
    const { addMessage, getDiff, setDiff } = this.dependencies;
    const diff = getDiff();

    if (!diff) {
      addMessage({ sender: 'system', text: 'No diff to apply.' });
      return;
    }

    try {
      const parsedDiff = applyPatch(await fs.promises.readFile(args[0], 'utf-8'), diff);
      if (parsedDiff) {
        await fs.promises.writeFile(args[0], parsedDiff);
        addMessage({ sender: 'system', text: `Applied patch to ${args[0]}` });
        setDiff(null);
      } else {
        addMessage({ sender: 'system', text: 'Failed to apply patch.' });
      }
    } catch (error) {
      addMessage({ sender: 'system', text: `Error: ${error.message}` });
    }
  }
}

module.exports = ApplyCommand;
