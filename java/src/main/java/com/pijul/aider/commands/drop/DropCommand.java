package com.pijul.aider.commands.drop;

import com.pijul.aider.commands.Command;
import com.pijul.aider.Container;
import com.pijul.aider.CodebaseManager;
import com.pijul.aider.MessageHandler;

public class DropCommand implements Command {
    private Container container;

    public DropCommand(Container container) {
        this.container = container;
    }

    @Override
    public void init() {
        // No initialization needed for DropCommand
    }

    @Override
    public void execute(String[] args) {
        CodebaseManager codebaseManager = container.getCodebaseManager();
        MessageHandler messageHandler = container.getMessageHandler();
        String codebase = codebaseManager.getCodebase();
        
        for (String file : args) {
            String fileRegex = "--- " + file + " ---\\n[\\s\\S]*?\\n\\n";
            if (codebase.contains("--- " + file + " ---")) {
                codebase = codebase.replaceAll(fileRegex, "");
                messageHandler.addMessage("system", "Removed " + file + " from the chat.");
            } else {
                messageHandler.addMessage("system", "File " + file + " not found in the chat.");
            }
        }
        codebaseManager.setCodebase(codebase);
    }

    @Override
    public void cleanup() {
        // No cleanup needed for DropCommand
    }
}