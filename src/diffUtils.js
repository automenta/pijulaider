const { execa } = require('execa');

async function applyDiff(diff) {
  try {
    await execa('patch', ['-p1'], { input: diff });
  } catch (error) {
    console.error('Error applying diff:', error);
    throw error;
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
