import * as fs from 'fs';
import execa from 'execa';
export class FileBackend {
    constructor() {
        this.files = new Map();
    }
    add(file) {
        if (!this.files.has(file)) {
            const backupFile = `${file}.${Date.now()}.bak`;
            fs.copyFileSync(file, backupFile);
            this.files.set(file, backupFile);
        }
    }
    async commit(message) {
        this.files.clear();
    }
    async revert(file) {
        const backupFile = this.files.get(file);
        if (backupFile) {
            fs.copyFileSync(backupFile, file);
        }
    }
    async diff() {
        let diff = '';
        for (const [file, backupFile] of this.files) {
            const { stdout } = await execa('diff', ['-u', backupFile, file], {
                reject: false,
            });
            diff += stdout;
        }
        return diff;
    }
}
