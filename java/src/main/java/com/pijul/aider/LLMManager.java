package com.pijul.aider;

import dev.langchain4j.model.openai.OpenAiChatModel;
import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.model.chat.ChatLanguageModel;

public class LLMManager {
    private final ChatLanguageModel model;

    public LLMManager(String apiKey) {
        this.model = OpenAiChatModel.withApiKey(apiKey);
    }

    public String chat(String message) {
        UserMessage userMessage = UserMessage.from(message);
        AiMessage aiMessage = model.generate(userMessage).content();
        return aiMessage.text();
    }
}
