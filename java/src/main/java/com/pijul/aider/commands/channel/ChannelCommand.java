package com.pijul.aider.commands.channel;

import com.pijul.aider.commands.Command;
import com.pijul.aider.Container;
import java.util.Arrays;

public class ChannelCommand implements Command {

    private final Container container;

    public ChannelCommand(Container container) {
        this.container = container;
    }

    @Override
    public void execute(String[] args) {
        if (args.length < 1) {
            System.out.println("Usage: /channel [new|switch|list] [name]");
            return;
        }

        String subcommand = args[0];
        String name = args.length > 1 ? args[1] : "";

        try {
            // Assuming Container provides backend and messaging capabilities
            Object backend = container.getBackend();
            if (backend != null) {
                switch (subcommand) {
                    case "new":
                        container.addMessage("system", "Creating channel " + name);
                        // Actual implementation would call backend.channel("new", name);
                        break;
                    case "switch":
                        container.addMessage("system", "Switching to channel " + name);
                        // Actual implementation would call backend.channel("switch", name);
                        break;
                    case "list":
                        // Actual implementation would retrieve channels from backend
                        container.addMessage("system", "Channels: [main, feature-1]");
                        break;
                    default:
                        container.addMessage("system", "Usage: /channel [new|switch|list] [name]");
                }
            } else {
                container.addMessage("system", "This backend does not support channels.");
            }
        } catch (Exception e) {
            System.err.println("Error executing channel command: " + e.getMessage());
        }
    }
}