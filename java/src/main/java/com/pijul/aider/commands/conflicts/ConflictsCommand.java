package com.pijul.aider.commands.conflicts;

import com.pijul.aider.commands.Command;
import com.pijul.aider.Container;
import com.pijul.aider.Backend;
import com.pijul.aider.MessageHandler;

public class ConflictsCommand implements Command {
    private Container container;

    public ConflictsCommand(Container container) {
        this.container = container;
    }

    @Override
    public void execute(String[] args) {
        Backend backend = container.getBackend();
        MessageHandler messageHandler = container.getMessageHandler();

        try {
            if (backend.conflicts() != null) {
                String conflicts = backend.conflicts();
                try {
                    // Attempt to parse as JSON array
                    conflicts = conflicts.replace("[", "").replace("]", "").replace("\"", "");
                    String[] conflictArray = conflicts.split(",");
                    if (conflictArray.length > 0) {
                        StringBuilder conflictMessage = new StringBuilder("Conflicts:\n");
                        for (String conflict : conflictArray) {
                            conflictMessage.append("- ").append(conflict.trim()).append("\n");
                        }
                        messageHandler.addMessage("system", conflictMessage.toString());
                    } else {
                        messageHandler.addMessage("system", "No conflicts found.");
                    }
                } catch (Exception e) {
                    // If parsing fails, just show the raw output
                    messageHandler.addMessage("system", conflicts);
                }
            } else {
                messageHandler.addMessage("system", "This backend does not support conflicts.");
            }
        } catch (Exception e) {
            messageHandler.addMessage("system", "Error: " + e.getMessage());
        }
    }
}