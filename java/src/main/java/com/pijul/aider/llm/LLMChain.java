package com.pijul.aider.llm;

import com.pijul.aider.Container;
import dev.langchain4j.googleai.gemini.ChatPromptTemplate;
import dev.langchain4j.googleai.gemini.LLM;
import dev.langchain4j.googleai.gemini.LLMChain;
import dev.langchain4j.googleai.gemini.output.OutputParser;
import dev.langchain4j.googleai.gemini.prompts.PromptTemplate;
import dev.langchain4j.googleai.gemini.output_parsers.StringOutputParser;
import java.util.List;
import java.util.concurrent.CompletableFuture;

public class LLMChain {
    private final LLMChain chain;
    private final OutputParser<String> outputParser;
    private final Container container;

    public LLMChain(LLM llm, Container container) {
        this.container = container;
        PromptTemplate prompt = ChatPromptTemplate.fromTemplate(
            "You are a helpful AI assistant that helps with coding.\n\n" +
            "Here is the current codebase: {codebase}\n\n" +
            "Here is the current diff: {diff}\n\n" +
            "Here is the output of the last command: {lastCommandOutput}\n\n" +
            "Here is the user's query: {input}"
        );
        
        this.chain = new LLMChain(prompt, llm, new StringOutputParser());
        this.outputParser = new StringOutputParser();
    }

    public CompletableFuture<String> handleQuery(String query, String codebase, String diff, String lastCommandOutput) {
        return chain.invoke(List.of(
            new PromptTemplate.Input("codebase", codebase),
            new PromptTemplate.Input("diff", diff),
            new PromptTemplate.Input("lastCommandOutput", lastCommandOutput),
            new PromptTemplate.Input("input", query)
        )).thenApply(output -> {
            System.out.println("AI Response: " + output);
            container.addMessage("ai", "Response: " + output);
            
            // Apply diff if present in response
            if (output.contains("diff")) {
                // Implement diff application logic here
                System.out.println("Applying diff from AI response...");
                // TODO: Implement actual diff application
            }
            return output;
        });
    }
}