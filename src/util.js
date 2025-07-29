import { execa } from 'execa';

async function runCommand(command, args, options) {
  try {
    const result = await execa(command, args, options);
    return result;
  } catch (error) {
    throw new Error(`Command failed: ${command} ${args.join(' ')}
${error.stderr}`);
  }
}

export {
  runCommand,
};
