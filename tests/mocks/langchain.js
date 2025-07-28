module.exports = {
  OpenAI: class {},
  ChatOpenAI: class {},
  ChatPromptTemplate: {
    fromTemplate: () => ({
      pipe: () => ({
        pipe: () => ({
          invoke: () => Promise.resolve(''),
        }),
      }),
    }),
  },
  StringOutputParser: class {},
};
