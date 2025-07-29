import fs from 'fs/promises';
import { applyPatch, parsePatch } from 'diff';

function parseDiff(diffStr) {
  const files = parsePatch(diffStr);
  const diffs = {};
  for (const file of files) {
    diffs[file.oldFileName.split('/').slice(1).join('/')] = file.hunks;
  }
  return diffs;
}

async function applyDiff(parsedDiff) {
  for (const [file, hunks] of Object.entries(parsedDiff)) {
    const original = await fs.readFile(file, 'utf-8');
    const patched = applyPatch(original, { hunks: hunks });
    if (patched === false) {
      throw new Error(`Failed to apply patch to ${file}`);
    }
    await fs.writeFile(file, patched);
  }
}

export { parseDiff, applyDiff };
