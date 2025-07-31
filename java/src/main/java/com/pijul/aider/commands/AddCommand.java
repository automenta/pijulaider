package com.pijul.aider.commands;

import com.pijul.aider.Container;
import com.pijul.aider.MessageHandler;

public class AddCommand {
    private Container container;
    private MessageHandler messageHandler;

    public AddCommand(Container container) {
        this.container = container;
        this.messageHandler = container.getMessageHandler();
    }

    public void init() {
        // Initialization logic for AddCommand
    }

    public void cleanup() {
        // Cleanup logic for AddCommand
    }

    public void execute() {
        // Add command execution logic
        messageHandler.addMessage("system", "Add command executed");
    }
}