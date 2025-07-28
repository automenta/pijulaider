const { applyPatch } = require('apply-diff');
const { parse } = require('diff');

const parseDiff = (diff) => {
  try {
    return parse(diff);
  } catch (error) {
    return null;
  }
};

const applyDiff = async (parsedDiff) => {
  for (const file of parsedDiff) {
    await applyPatch(process.cwd(), file);
  }
};

module.exports = {
  parseDiff,
  applyDiff,
};
