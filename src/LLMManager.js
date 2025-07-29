const { ChatOpenAI } = require('@langchain/openai');
const { ChatAnthropic } = require('@langchain/anthropic');
const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');

class LLMManager {
  createLlm(provider, model) {
    switch (provider) {
      case 'openai':
        return new ChatOpenAI({ modelName: model });
      case 'anthropic':
        return new ChatAnthropic({ modelName: model });
      case 'google':
        return new ChatGoogleGenerativeAI({ modelName: model });
      default:
        throw new Error(`Unknown LLM provider: ${provider}`);
    }
  }
}

module.exports = LLMManager;
