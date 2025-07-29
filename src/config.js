const { Command } = require('commander');

function getConfig() {
  const program = new Command();

  program
    .version('0.0.1')
    .description('A terminal-based AI pair programming tool for LLM-driven code editing, feature generation, bug fixing, and change management.')
    .option('--backend <backend>', 'The versioning backend to use (file, git, or pijul)', 'file')
    .option('--provider <provider>', 'The LLM provider to use', 'openai')
    .option('--model <model>', 'The language model to use', 'gpt-4o')
    .option('--auto-commit', 'Automatically commit changes after each edit')
    .argument('<files...>', 'The files to edit');

  program.parse(process.argv);

  return {
    ...program.opts(),
    files: program.args,
  };
}

module.exports = {
  getConfig,
};
