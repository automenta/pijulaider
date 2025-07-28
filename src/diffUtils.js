const { execa } = require('execa');
const PijulBackend = require('./versioning/PijulBackend');

async function applyDiff(diff, backend) {
  if (backend instanceof PijulBackend) {
    // For Pijul, we can't just apply a standard diff.
    // We need to create a patch and then apply it.
    // This is a simplified approach. A more robust solution
    // would involve creating a temporary patch file.
    console.warn(
      'Applying diffs with Pijul is not fully supported and may not work as expected.'
    );
    await execa('pijul', ['apply', '--patch', '-'], { input: diff });
  } else {
    await execa('patch', ['-p1'], { input: diff });
  }
}

function parseDiff(response) {
  const diffRegex = /```diff\n([\s\S]*?)```/;
  const match = response.match(diffRegex);
  if (match) {
    return match[1];
  }
  return null;
}

module.exports = {
  applyDiff,
  parseDiff,
};
