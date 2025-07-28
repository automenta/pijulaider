module.exports = {
  testEnvironment: 'node',
  moduleNameMapper: {
    '^langchain/llms/openai$': '<rootDir>/tests/mocks/langchain.js',
    '^langchain/prompts$': '<rootDir>/tests/mocks/langchain.js',
    '^langchain/schema/output_parser$': '<rootDir>/tests/mocks/langchain.js',
  },
  transformIgnorePatterns: ['node_modules/(?!.pnpm|ink|react-reconciler|scheduler)'],
};
