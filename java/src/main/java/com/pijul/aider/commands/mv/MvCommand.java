package com.pijul.aider.commands.mv;

import com.pijul.aider.commands.Command;
import com.pijul.aider.Container;
import com.pijul.aider.MessageHandler;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;

public class MvCommand implements Command {
    private final Container container;

    public MvCommand(Container container) {
        this.container = container;
    }

    @Override
    public void execute(String[] args) {
        MessageHandler messageHandler = container.getMessageHandler();
        
        if (args.length < 2) {
            messageHandler.addMessage("system", "Usage: /mv <source> <destination>");
            return;
        }
        
        String source = args[0];
        String destination = args[1];
        
        try {
            Path sourcePath = Paths.get(source);
            Path destinationPath = Paths.get(destination);
            Files.move(sourcePath, destinationPath);
            messageHandler.addMessage("system", "Moved " + source + " to " + destination);
        } catch (IOException e) {
            messageHandler.addMessage("system", "Error: " + e.getMessage());
        }
    }
}