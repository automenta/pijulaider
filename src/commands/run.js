class RunCommand {
  constructor(aider) {
    this.aider = aider;
  }

  async execute(args) {
    const { stdout } = await this.aider.execa(args[0], args.slice(1));
    this.aider.addMessage({ sender: 'system', text: `\`/${command} ${args.join(' ')}\`\n${stdout}` });
  }
}

module.exports = RunCommand;
