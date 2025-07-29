const { execa } = require('execa');

async function runCommand(command, args, options) {
  try {
    const result = await execa(command, args, options);
    return result;
  } catch (error) {
    throw new Error(`Command failed: ${command} ${args.join(' ')}\n${error.stderr}`);
  }
}

module.exports = {
  runCommand,
};
