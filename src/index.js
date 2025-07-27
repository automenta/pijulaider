#!/usr/bin/env node

const { Command } = require('commander');

const program = new Command();

program
  .version('0.0.1')
  .description('A terminal-based AI pair programming tool for LLM-driven code editing, feature generation, bug fixing, and change management.')
  .option('--backend <backend>', 'The versioning backend to use (file, git, or pijul)', 'file')
  .option('--model <model>', 'The language model to use', 'gpt-4o')
  .argument('<files...>', 'The files to edit')
  .action(async (files, options) => {
    const PijulAider = require('./PijulAider');
    const aider = new PijulAider(options);
    await aider.run(files);
  });

program.parse(process.argv);
