import execa from 'execa';
export class PijulBackend {
    add(file) {
        execa('pijul', ['add', file]);
    }
    async commit(message) {
        await execa('pijul', ['record', '-m', message]);
    }
    async revert(hash) {
        await execa('pijul', ['unrecord', hash]);
    }
    async diff() {
        const { stdout } = await execa('pijul', ['diff']);
        return stdout;
    }
    async channel(name) {
        await execa('pijul', ['channel', 'switch', name]);
    }
}
