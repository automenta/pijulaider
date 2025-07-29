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
    'ink': '<rootDir>/tests/mocks/ink.js',
    '../util': '<rootDir>/tests/mocks/util.js',
  },
  transformIgnorePatterns: [
    "node_modules/(?!(ink|ink-select-input|ink-testing-library|ink-text-input|react-reconciler|ansi-escapes|environment|is-in-ci|auto-bind|patch-console|@sindresorhus/is|escape-string-regexp|slice-ansi|chalk|get-stream|p-event|p-timeout|yocto-queue|@types/react|ink-gradient|ink-big-text)/)",
  ],
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
};
