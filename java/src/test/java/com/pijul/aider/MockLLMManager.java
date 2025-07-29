package com.pijul.aider;

public class MockLLMManager extends LLMManager {
    public MockLLMManager() {
        super("test");
    }

    @Override
    public String chat(String message) {
        return "This is a mock response.";
    }
}
