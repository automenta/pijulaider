import execa from 'execa';
export class GitBackend {
    add(file) {
        execa('git', ['add', file]);
    }
    async commit(message) {
        await execa('git', ['commit', '-m', message]);
    }
    async revert(file) {
        await execa('git', ['checkout', 'HEAD', '--', file]);
    }
    async diff() {
        const { stdout } = await execa('git', ['diff']);
        return stdout;
    }
}
