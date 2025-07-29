const fs = require('fs').promises;
const { editFile } = require('edit-file');
const filePicker = require('file-picker');

class CommandManager {
  constructor(aider) {
    this.aider = aider;
  }

  async handleCommand(command, args) {
    try {
      switch (command) {
        case 'add':
          await this.add(args);
          break;
        case 'drop':
          await this.drop(args);
          break;
        case 'diff':
          await this.diff();
          break;
        case 'edit':
          await this.edit(args);
          break;
        case 'record':
          await this.record(args);
          break;
        case 'unrecord':
          await this.unrecord(args);
          break;
        case 'undo':
          await this.undo();
          break;
        case 'channel':
          await this.channel(args);
          break;
        case 'patch':
          await this.patch(args);
          break;
        case 'conflicts':
          await this.conflicts();
          break;
        case 'run':
          await this.run(args);
          break;
        case 'test':
          await this.test();
          break;
        case 'speech':
          await this.speech();
          break;
        case 'image':
          await this.image();
          break;
        case 'help':
          this.help();
          break;
        default:
          this.aider.addMessage({ sender: 'system', text: `Unknown command: ${command}` });
      }
    } catch (error) {
      this.aider.addMessage({ sender: 'system', text: `Error executing command ${command}: ${error.message}` });
    }
  }

  async add(args) {
    for (const file of args) {
      await this.aider.backend.add(file);
      const content = await fs.readFile(file, 'utf-8');
      this.aider.codebase += `--- ${file} ---\n${content}\n\n`;
      this.aider.addMessage({ sender: 'system', text: `Added ${file} to the chat.` });
    }
  }

  async drop(args) {
    for (const file of args) {
      const fileRegex = new RegExp(`--- ${file} ---\\n[\\s\\S]*?\\n\\n`);
      if (this.aider.codebase.match(fileRegex)) {
        this.aider.codebase = this.aider.codebase.replace(fileRegex, '');
        this.aider.addMessage({ sender: 'system', text: `Removed ${file} from the chat.` });
      } else {
        this.aider.addMessage({ sender: 'system', text: `File ${file} not found in the chat.` });
      }
    }
  }

  async diff() {
    this.aider.diff = await this.aider.backend.diff();
    this.aider.addMessage({ sender: 'system', text: 'Diff updated.' });
  }

  async edit(args) {
    if (args.length > 0) {
      await editFile(args[0]);
      this.aider.diff = await this.aider.backend.diff();
      this.aider.addMessage({ sender: 'system', text: `Finished editing ${args[0]}.` });
    } else {
      this.aider.addMessage({ sender: 'system', text: 'Please specify a file to edit.' });
    }
  }

  async record(args) {
    await this.aider.backend.record(args.join(' '));
    this.aider.addMessage({ sender: 'system', text: 'Changes recorded.' });
  }

  async unrecord(args) {
    if (typeof this.aider.backend.unrecord === 'function') {
      await this.aider.backend.unrecord(args[0]);
      this.aider.addMessage({ sender: 'system', text: `Unrecorded change ${args[0]}` });
    } else {
      this.aider.addMessage({ sender: 'system', text: 'This backend does not support unrecord.' });
    }
  }

  async undo() {
    await this.aider.backend.undo();
    this.aider.diff = await this.aider.backend.diff();
    this.aider.addMessage({ sender: 'system', text: 'Undid the last change.' });
  }

  async channel(args) {
    if (typeof this.aider.backend.channel === 'function') {
      const subcommand = args[0];
      const name = args[1];
      if (subcommand === 'new') {
        await this.aider.backend.channel(subcommand, name);
        this.aider.addMessage({ sender: 'system', text: `Created channel ${name}` });
      } else if (subcommand === 'switch') {
        await this.aider.backend.channel(subcommand, name);
        this.aider.addMessage({ sender: 'system', text: `Switched to channel ${name}` });
      } else if (subcommand === 'list') {
        const channels = await this.aider.backend.channel(subcommand);
        this.aider.addMessage({ sender: 'system', text: `Channels:\n${channels}` });
      } else {
        this.aider.addMessage({ sender: 'system', text: 'Usage: /channel [new|switch|list] [name]' });
      }
    } else {
      this.aider.addMessage({ sender: 'system', text: 'This backend does not support channels.' });
    }
  }

  async patch(args) {
    if (typeof this.aider.backend.patch === 'function') {
      const subcommand = args[0];
      const name = args[1];
      if (subcommand === 'list') {
        const patches = await this.aider.backend.patch(subcommand);
        this.aider.addMessage({ sender: 'system', text: `Patches:\n${patches}` });
      } else if (subcommand === 'apply') {
        await this.aider.backend.apply(name);
        this.aider.addMessage({ sender: 'system', text: `Applied patch ${name}` });
      } else {
        this.aider.addMessage({ sender: 'system', text: 'Usage: /patch [list|apply] [hash]' });
      }
    } else {
      this.aider.addMessage({ sender: 'system', text: 'This backend does not support patches.' });
    }
  }

  async conflicts() {
    if (typeof this.aider.backend.conflicts === 'function') {
      const conflicts = await this.aider.backend.conflicts();
      try {
        const parsedConflicts = JSON.parse(conflicts);
        if (Array.isArray(parsedConflicts) && parsedConflicts.length > 0) {
          let conflictMessage = 'Conflicts:\n';
          for (const conflict of parsedConflicts) {
            if (typeof conflict === 'string') {
              conflictMessage += `- ${conflict}\n`;
            } else if (typeof conflict === 'object' && conflict.hash) {
              conflictMessage += `- ${conflict.hash}\n`;
            }
          }
          this.aider.addMessage({ sender: 'system', text: conflictMessage });
        } else {
          this.aider.addMessage({ sender: 'system', text: 'No conflicts found.' });
        }
      } catch (error) {
        this.aider.addMessage({ sender: 'system', text: conflicts });
      }
    } else {
      this.aider.addMessage({ sender: 'system', text: 'This backend does not support conflicts.' });
    }
  }

  async run(args) {
    const { stdout } = await this.aider.execa(args[0], args.slice(1));
    this.aider.addMessage({ sender: 'system', text: `\`/${command} ${args.join(' ')}\`\n${stdout}` });
  }

  async test() {
    try {
      await this.aider.execa('npm', ['test']);
      this.aider.addMessage({ sender: 'system', text: 'All tests passed!' });
    } catch (error) {
      this.aider.addMessage({
        sender: 'system',
        text: `Tests failed. Attempting to fix...\n${error.stdout}`,
      });
      await this.aider.handleQuery(`The tests failed with the following output:\n${error.stdout}\nPlease fix the tests.`);
    }
  }

  async speech() {
    this.aider.addMessage({ sender: 'system', text: 'Recording...' });
    await this.aider.handleSpeech();
  }

  async image() {
    const [imagePath] = await filePicker({
      type: 'image',
      multiple: false,
    });
    if (imagePath) {
      this.aider.addMessage({ sender: 'user', image: imagePath });
    }
  }

  help() {
    this.aider.addMessage({
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

module.exports = CommandManager;
