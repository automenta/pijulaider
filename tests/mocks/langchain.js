module.exports = {
  OpenAI: jest.fn().mockImplementation(() => ({})),
  ChatPromptTemplate: {
    fromTemplate: jest.fn(),
  },
  StringOutputParser: jest.fn(),
};
