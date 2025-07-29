import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { parseDiff, applyDiff } from './diffUtils';

class LLMChain {
  constructor(llm, messageHandler, backend, options) {
    this.llm = llm;
    this.messageHandler = messageHandler;
    this.backend = backend;
    this.options = options;
    this.prompt = ChatPromptTemplate.fromTemplate(
      `You are a helpful AI assistant that helps with coding.

Here is the current codebase:
{codebase}

Here is the current diff:
{diff}

Here is the output of the last command:
{lastCommandOutput}

Here is the user's query:
{input}`
    );
    this.outputParser = new StringOutputParser();
    this.chain = this.prompt.pipe(this.llm).pipe(this.outputParser);
  }

  async handleQuery(query, codebase, diff) {
    try {
      const messages = this.messageHandler.getMessages();
      const lastCommandOutput = messages.length > 0 ? messages[messages.length - 1].text : '';
      const response = await this.chain.invoke({
        input: query,
        chat_history: messages,
        codebase,
        diff,
        lastCommandOutput,
      });
      this.messageHandler.addMessage({ sender: 'ai', text: response });

      const parsedDiff = parseDiff(response);
      if (parsedDiff) {
        try {
          await applyDiff(parsedDiff);
          const newDiff = await this.backend.diff();
          this.messageHandler.addMessage({ sender: 'system', text: 'Diff applied successfully.' });
          if (this.options.autoCommit) {
            await this.backend.record('Auto-commit');
            this.messageHandler.addMessage({ sender: 'system', text: 'Changes auto-committed.' });
          }
          return newDiff;
        } catch (error) {
          this.messageHandler.addMessage({
            sender: 'system',
            text: `Error applying diff: ${error.message}`,
          });
        }
      }
    } catch (error) {
      this.messageHandler.addMessage({
        sender: 'system',
        text: `Error invoking LLM: ${error.message}`,
      });
    }
    return diff;
  }
}

export default LLMChain;
