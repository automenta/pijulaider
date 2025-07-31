package com.pijul.aider.commands.diff;

import com.pijul.aider.commands.Command;
import com.pijul.aider.Container;
import com.pijul.aider.Backend;
import com.pijul.aider.MessageHandler;

public class DiffCommand implements Command {
    private Container container;

    public DiffCommand(Container container) {
        this.container = container;
    }

    @Override
    public void execute(String[] args) {
        Backend backend = container.getBackend();
        MessageHandler messageHandler = container.getMessageHandler();
        
        try {
            String diff = backend.diff();
            container.setDiff(diff);
            messageHandler.addMessage("system", diff);
        } catch (Exception e) {
            messageHandler.addMessage("system", "Error: " + e.getMessage());
        }
    }
}