/**
 * @interface
 */
class VersioningBackend {
  /**
   * @param {string} file
   */
  add(file) {}

  /**
   * @param {string} message
   */
  commit(message) {}

  /**
   * @param {string} file
   */
  revert(file) {}

  /**
   * @returns {string}
   */
  diff() {}
}

module.exports = VersioningBackend;
