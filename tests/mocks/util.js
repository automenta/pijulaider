const runCommand = jest.fn(() => Promise.resolve({ stdout: '' }));

module.exports = {
  runCommand,
};
