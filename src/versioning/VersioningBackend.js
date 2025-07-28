class VersioningBackend {
  add(file) {
    throw new Error('Not implemented');
  }

  commit(message) {
    throw new Error('Not implemented');
  }

  revert(file) {
    throw new Error('Not implemented');
  }

  diff() {
    throw new Error('Not implemented');
  }

  record(message) {
    throw new Error('Not implemented');
  }
}

module.exports = VersioningBackend;
