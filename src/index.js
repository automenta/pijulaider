#!/usr/bin/env node

const { getConfig } = require('./config');
const bootstrap = require('./bootstrap');

async function main() {
  const config = getConfig();
  const container = bootstrap(config);
  const aider = container.get('aider');
  await aider.run(config.files, require('glob'));
}

main();
