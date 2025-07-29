package com.pijul.aider.tui;

import java.util.ArrayList;
import java.util.List;

public class Chat {
    private final List<String> messages = new ArrayList<>();

    public void addMessage(String message) {
        messages.add(message);
    }

    public List<String> getMessages() {
        return messages;
    }
}
