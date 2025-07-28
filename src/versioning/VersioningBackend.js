class VersioningBackend {
  add(file) {
    throw new Error('Not implemented');
  }

  record(message) {
    throw new Error('Not implemented');
  }

  unrecord(hash) {
    throw new Error('Not implemented');
  }

  diff() {
    throw new Error('Not implemented');
  }

  channel(name) {
    throw new Error('Not implemented');
  }

  apply(patch) {
    throw new Error('Not implemented');
  }

  conflicts() {
    throw new Error('Not implemented');
  }

  revert(file) {
    throw new Error('Not implemented');
  }
}

module.exports = VersioningBackend;
