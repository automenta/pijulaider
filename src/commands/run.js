class RunCommand {
  constructor(dependencies) {
    this.dependencies = dependencies;
  }

  async execute(args) {
    const { execa, addMessage } = this.dependencies;
    const command = args[0];
    const commandArgs = args.slice(1);
    const { stdout } = await execa(command, commandArgs);
    addMessage({ sender: 'system', text: `\`/${command} ${args.join(' ')}\`\n${stdout}` });
  }
}

module.exports = RunCommand;
