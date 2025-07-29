const { glob } = require('glob');

class AddCommand {
  constructor(dependencies) {
    this.dependencies = dependencies;
  }

  async execute(args) {
    if (args.includes('.')) {
      await this.addAllTracked();
    } else if (args.includes('-u')) {
      await this.addAllUntracked();
    } else {
      await this.addFiles(args);
    }
  }

  async addFiles(files) {
    const { getBackend, addMessage, fs, getCodebase, setCodebase } = this.dependencies;
    for (const file of files) {
      const filePaths = await glob(file);
      for (const filePath of filePaths) {
        await getBackend().add(filePath);
        const content = await fs.promises.readFile(filePath, 'utf-8');
        let codebase = getCodebase();
        codebase += `--- ${filePath} ---\n${content}\n\n`;
        setCodebase(codebase);
        addMessage({ sender: 'system', text: `Added and staged ${filePath}.` });
      }
    }
  }

  async addAllTracked() {
    const { getBackend } = this.dependencies;
    const trackedFiles = await getBackend().listTrackedFiles();
    await this.addFiles(trackedFiles);
  }

  async addAllUntracked() {
    const { getBackend } = this.dependencies;
    const untrackedFiles = await getBackend().listUntrackedFiles();
    await this.addFiles(untrackedFiles);
  }
}

module.exports = AddCommand;
