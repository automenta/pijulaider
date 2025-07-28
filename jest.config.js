module.exports = {
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  moduleNameMapper: {
    '@langchain/openai': '<rootDir>/tests/mocks/langchain.js',
    '@langchain/core/prompts': '<rootDir>/tests/mocks/langchain.js',
    '@langchain/core/output_parsers': '<rootDir>/tests/mocks/langchain.js',
    '@langchain/anthropic': '<rootDir>/tests/mocks/langchain.js',
    '@langchain/google-genai': '<rootDir>/tests/mocks/langchain.js',
    'yoga-layout': '<rootDir>/tests/mocks/yoga-layout.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(ink|ink-testing-library|react-reconciler)/)',
  ],
};
