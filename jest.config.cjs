module.exports = {
  transform: {
    '^.+\.(js|jsx)$': 'babel-jest',
  },
  moduleNameMapper: {
    '@langchain/openai': '<rootDir>/tests/mocks/langchain.js',
    '@langchain/core/prompts': '<rootDir>/tests/mocks/langchain.js',
    '@langchain/core/output_parsers': '<rootDir>/tests/mocks/langchain.js',
    '@langchain/anthropic': '<rootDir>/tests/mocks/langchain.js',
    '@langchain/google-genai': '<rootDir>/tests/mocks/langchain.js',
    'yoga-layout': '<rootDir>/tests/mocks/yoga-layout.js',
    'ink': '<rootDir>/tests/mocks/ink.js',
    '../util': '<rootDir>/src/util',
    'execa': '<rootDir>/tests/mocks/execa.js',
    'glob': '<rootDir>/tests/mocks/glob.js',
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/src/commands/test.js',
  ],
  transformIgnorePatterns: [
    '/node_modules/', // Ignore all node_modules by default
  ],
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
  forceExit: true,
};