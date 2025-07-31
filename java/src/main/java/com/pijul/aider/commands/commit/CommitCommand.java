package com.pijul.aider.commands.commit;

import com.pijul.aider.commands.Command;
import com.pijul.aider.Container;
import com.pijul.aider.Backend;
import com.pijul.aider.MessageHandler;

public class CommitCommand implements Command {
    private Container container;

    public CommitCommand(Container container) {
        this.container = container;
    }

    @Override
    public void execute(String[] args) {
        Backend backend = container.getBackend();
        MessageHandler messageHandler = container.getMessageHandler();
        String message = String.join(" ", args);

        if (message.isEmpty()) {
            messageHandler.addMessage("system", "Error: A commit message is required.");
            return;
        }

        backend.record(message)
            .thenAccept(v -> messageHandler.addMessage("system", "Changes committed."))
            .exceptionally(e -> {
                messageHandler.addMessage("system", "Error: " + e.getMessage());
                return null;
            });
    }
}