package com.pijul.aider.commands.clear;

import com.pijul.aider.commands.Command;
import com.pijul.aider.Container;
import com.pijul.aider.CodebaseManager;
import com.pijul.aider.MessageHandler;

public class ClearCommand implements Command {
    private final Container container;

    public ClearCommand(Container container) {
        this.container = container;
    }

    @Override
    public void init() {
        // No initialization needed for ClearCommand
    }

    @Override
    public void execute(String[] args) {
        try {
            CodebaseManager codebaseManager = container.getCodebaseManager();
            MessageHandler messageHandler = container.getMessageHandler();
            
            codebaseManager.setCodebase("");
            messageHandler.addMessage("system", "Codebase cleared.");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void cleanup() {
        // No cleanup needed for ClearCommand
    }
}