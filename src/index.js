#!/usr/bin/env node

import { getConfig } from './config';
import bootstrap from './bootstrap';
import { glob } from 'glob';

async function main() {
  const config = getConfig();
  const container = bootstrap(config);
  const aider = container.get('aider');
  await aider.run(config.files, glob);
}

main();
