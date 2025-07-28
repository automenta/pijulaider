module.exports = {
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  moduleNameMapper: {
    ink: '<rootDir>/tests/mocks/ink.js',
    '@langchain/openai': '<rootDir>/tests/mocks/langchain.js',
    '@langchain/core/prompts': '<rootDir>/tests/mocks/langchain.js',
    '@langchain/core/output_parsers': '<rootDir>/tests/mocks/langchain.js',
  },
};
