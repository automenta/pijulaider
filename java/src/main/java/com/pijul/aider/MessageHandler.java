package com.pijul.aider;

public class MessageHandler {
    private Container container;

    public MessageHandler(Container container) {
        this.container = container;
    }

    public void addMessage(String sender, String message) {
        // Add message logic
        System.out.println(sender + ": " + message);
    }

    // Add more methods as needed
}