module.exports = {
  glob: (pattern, options, callback) => {
    if (callback) {
      callback(null, []);
    } else {
      return Promise.resolve([]);
    }
  },
};
