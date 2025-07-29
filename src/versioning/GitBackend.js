import { runCommand } from '../util';
import VersioningBackend from './VersioningBackend';

class GitBackend extends VersioningBackend {
  async add(file) {
    await runCommand('git', ['add', file]);
  }

  async record(message) {
    await runCommand('git', ['commit', '-m', message]);
  }

  async unrecord() {
    await runCommand('git', ['reset', 'HEAD~']);
  }

  async channel(subcommand, name) {
    if (subcommand === 'new') {
      await runCommand('git', ['checkout', '-b', name]);
    } else if (subcommand === 'switch') {
      const { stdout } = await runCommand('git', ['branch', '--list', name]);
      if (stdout.trim() === '') {
        await runCommand('git', ['checkout', '-b', name]);
      } else {
        await runCommand('git', ['checkout', name]);
      }
    } else if (subcommand === 'list') {
      const { stdout } = await runCommand('git', ['branch']);
      return stdout;
    }
  }

  async patch(subcommand, name) {
    if (subcommand === 'list') {
      const { stdout } = await runCommand('git', ['log', '--oneline']);
      return stdout;
    } else if (subcommand === 'apply') {
      const { stdout } = await runCommand('git', ['show', name]);
      await this.apply(stdout);
    }
  }

  async apply(patch) {
    await runCommand('git', ['apply', '--check'], { input: patch });
    await runCommand('git', ['apply'], { input: patch });
  }

  async conflicts() {
    const { stdout } = await runCommand('git', ['status', '--porcelain']);
    const conflicts = stdout
      .split('\n')
      .filter((line) => line.startsWith('U'))
      .map((line) => line.split(' ')[1]);
    return JSON.stringify(conflicts, null, 2);
  }

  async revert(file) {
    await runCommand('git', ['checkout', 'HEAD', '--', file]);
  }

  async revertAll() {
    await runCommand('git', ['reset', '--hard', 'HEAD']);
  }

  async diff() {
    const { stdout } = await runCommand('git', ['diff']);
    return stdout;
  }

  async status() {
    const { stdout: branch } = await runCommand('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
    const { stdout: status } = await runCommand('git', ['status', '--porcelain']);
    const files = status.split('\n').filter(line => line.trim() !== '').map(line => {
      const parts = line.trim().split(' ');
      return {
        status: parts[0],
        file: parts.slice(1).join(' '),
      };
    });
    return JSON.stringify({
      branch: branch.trim(),
      files,
    }, null, 2);
  }

  async undo() {
    await this.unrecord();
  }

  async listTrackedFiles() {
    const { stdout } = await runCommand('git', ['ls-files']);
    return stdout.split('\n').filter(Boolean);
  }

  async listUntrackedFiles() {
    const { stdout } = await runCommand('git', ['ls-files', '--others', '--exclude-standard']);
    return stdout.split('\n').filter(Boolean);
  }
}

export default GitBackend;
