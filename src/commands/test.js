const { runCommand } = require('../util');

class TestCommand {
  constructor(dependencies) {
    this.dependencies = dependencies;
  }

  async execute(args) {
    const { addMessage, handleQuery } = this.dependencies;
    try {
      addMessage({ sender: 'system', text: 'Running tests...' });
      const { stdout, stderr } = await runCommand('npm', ['test', '--', ...args]);
      addMessage({ sender: 'system', text: stdout });
      if (stderr) {
        addMessage({
          sender: 'system',
          text: `Tests failed. Attempting to fix...\n${stderr}`,
        });
        await handleQuery(`The tests failed with the following output:\n${stderr}\nPlease fix the tests.`);
      } else {
        addMessage({ sender: 'system', text: 'All tests passed!' });
      }
    } catch (error) {
      addMessage({
        sender: 'system',
        text: `Tests failed. Attempting to fix...\n${error.stdout}`,
      });
      await handleQuery(`The tests failed with the following output:\n${error.stdout}\nPlease fix the tests.`);
    }
  }
}

module.exports = TestCommand;
