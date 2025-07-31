package com.pijul.aider.commands.create;

import com.pijul.aider.commands.Command;
import com.pijul.aider.Container;
import com.pijul.aider.MessageHandler;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

public class CreateCommand implements Command {
    private Container container;

    public CreateCommand(Container container) {
        this.container = container;
    }

    @Override
    public void execute(String[] args) {
        MessageHandler messageHandler = container.getMessageHandler();
        if (args.length == 0) {
            messageHandler.addMessage("system", "Usage: /create <file>");
            return;
        }
        
        String file = args[0];
        try {
            Path path = Paths.get(file);
            Files.createFile(path);
            messageHandler.addMessage("system", "Created file: " + file);
        } catch (Exception e) {
            messageHandler.addMessage("system", "Error: " + e.getMessage());
        }
    }
}