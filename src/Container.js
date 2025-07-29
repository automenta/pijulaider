class Container {
  constructor() {
    this.dependencies = {};
  }

  register(name, dependency) {
    this.dependencies[name] = dependency;
  }

  get(name) {
    if (!this.dependencies[name]) {
      throw new Error(`Dependency not found: ${name}`);
    }
    return this.dependencies[name];
  }
}

module.exports = Container;
