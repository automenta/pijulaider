const { Tool } = require('@langchain/core/tools');

class ApplyDiffTool extends Tool {
  constructor(aider) {
    super();
    this.aider = aider;
    this.name = 'apply_diff';
    this.description = 'Apply a diff to the codebase.';
  }

  async _call(diff) {
    try {
      await this.aider.applyDiff(diff);
      return 'Diff applied successfully.';
    } catch (error) {
      return `Error applying diff: ${error.message}`;
    }
  }
}

class RunTestTool extends Tool {
  constructor(aider) {
    super();
    this.aider = aider;
    this.name = 'run_test';
    this.description = 'Run the test suite.';
  }

  async _call() {
    try {
      await this.aider.execa('npm', ['test']);
      return 'All tests passed!';
    } catch (error) {
      return `Tests failed:\n${error.stdout}`;
    }
  }
}

class AskUserTool extends Tool {
  constructor(aider) {
    super();
    this.aider = aider;
    this.name = 'ask_user';
    this.description = 'Ask the user a question.';
  }

  async _call(question) {
    this.aider.messages.push({ sender: 'ai', text: question });
    this.aider.rerender();
    const { answer } = await this.aider.inquirer.prompt([
      {
        type: 'input',
        name: 'answer',
        message: 'AI Assistant:',
      },
    ]);
    return answer;
  }
}

module.exports = {
  ApplyDiffTool,
  RunTestTool,
  AskUserTool,
};
