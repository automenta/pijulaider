const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

class LsCommand {
  constructor(dependencies) {
    this.dependencies = dependencies;
  }

  async execute(args) {
    const { addMessage } = this.dependencies;
    const options = this.parseArgs(args);
    const dir = options.dir || '.';

    try {
      if (options.recursive) {
        await this.listRecursive(dir, options, addMessage);
      } else {
        await this.listDirectory(dir, options, addMessage);
      }
    } catch (error) {
      addMessage({ sender: 'system', text: `Error: ${error.message}` });
    }
  }

  parseArgs(args) {
    const options = {
      recursive: false,
      all: false,
      long: false,
      dir: null,
    };

    for (const arg of args) {
      if (arg.startsWith('-')) {
        if (arg.includes('R')) options.recursive = true;
        if (arg.includes('a')) options.all = true;
        if (arg.includes('l')) options.long = true;
      } else {
        options.dir = arg;
      }
    }

    return options;
  }

  async listRecursive(dir, options, addMessage) {
    const pattern = options.all ? `${dir}/**/*` : `${dir}/**/!.*`;
    const files = await glob(pattern, { dot: options.all, mark: true });
    if (options.long) {
      await this.listLong(files, addMessage);
    } else {
      addMessage({ sender: 'system', text: files.join('\n') });
    }
  }

  async listDirectory(dir, options, addMessage) {
    const files = await fs.promises.readdir(dir, { withFileTypes: true });
    let fileList = files;

    if (!options.all) {
      fileList = files.filter(file => !file.name.startsWith('.'));
    }

    if (options.long) {
      const filePaths = fileList.map(file => path.join(dir, file.name));
      await this.listLong(filePaths, addMessage);
    } else {
      const names = fileList.map(file => {
        return file.isDirectory() ? `${file.name}/` : file.name;
      });
      addMessage({ sender: 'system', text: names.join('\n') });
    }
  }

  async listLong(files, addMessage) {
    const promises = files.map(async (file) => {
      try {
        const stats = await fs.promises.stat(file);
        const size = stats.size.toString().padStart(10);
        const mtime = stats.mtime.toISOString();
        return `${stats.mode.toString(8).padStart(6)} ${size} ${mtime} ${file}`;
      } catch (error) {
        // Ignore errors for files that no longer exist
        if (error.code === 'ENOENT') {
          return null;
        }
        throw error;
      }
    });

    const results = (await Promise.all(promises)).filter(Boolean);
    addMessage({ sender: 'system', text: results.join('\n') });
  }
}

module.exports = LsCommand;
