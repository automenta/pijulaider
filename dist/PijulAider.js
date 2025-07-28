import { OpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { FileBackend } from './versioning/FileBackend';
import { GitBackend } from './versioning/GitBackend';
import { PijulBackend } from './versioning/PijulBackend';
import React from 'react';
import { Chat } from './tui/Chat';
class PijulAider {
    constructor(options) {
        this.messages = [];
        this.options = options;
        this.llm = new OpenAI({ modelName: options.model });
        this.prompt = ChatPromptTemplate.fromTemplate('You are a helpful AI assistant that helps with coding.');
        this.outputParser = new StringOutputParser();
        this.chain = this.prompt.pipe(this.llm).pipe(this.outputParser);
        this.backend = this.createBackend(options.backend);
    }
    createBackend(backend) {
        switch (backend) {
            case 'file':
                return new FileBackend();
            case 'git':
                return new GitBackend();
            case 'pijul':
                return new PijulBackend();
            default:
                throw new Error(`Unknown backend: ${backend}`);
        }
    }
    async run(files) {
        for (const file of files) {
            this.backend.add(file);
        }
        let diff = await this.backend.diff();
        const onSendMessage = async (query) => {
            if (query === '/diff') {
                diff = await this.backend.diff();
                return;
            }
            this.messages.push({ sender: 'user', text: query });
            const response = await this.chain.invoke({
                input: query,
                chat_history: this.messages,
            });
            this.messages.push({ sender: 'ai', text: response });
        };
        const App = () => (React.createElement(Chat, { messages: this.messages, onSendMessage: onSendMessage, diff: diff }));
        const { render } = await import('ink');
        render(React.createElement(App, null));
    }
}
export { PijulAider };
