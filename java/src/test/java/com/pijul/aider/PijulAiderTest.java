package com.pijul.aider;

import org.junit.Test;

import java.io.IOException;

import static org.junit.Assert.assertEquals;

public class PijulAiderTest {

    @Test
    public void testChat() throws IOException {
        LLMManager llmManager = new MockLLMManager();
        String response = llmManager.chat("hello");
        assertEquals("This is a mock response.", response);
    }
}
