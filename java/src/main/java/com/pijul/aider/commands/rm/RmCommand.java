package com.pijul.aider.commands.rm;

import com.pijul.aider.commands.Command;
import com.pijul.aider.Container;
import com.pijul.aider.MessageHandler;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;

public class RmCommand implements Command {
    private final Container container;

    public RmCommand(Container container) {
        this.container = container;
    }

    @Override
    public void execute(String[] args) {
        MessageHandler messageHandler = container.getMessageHandler();
        
        if (args.length < 1) {
            messageHandler.addMessage("system", "Usage: /rm <file1> [file2...]");
            return;
        }
        
        try {
            for (String filePath : args) {
                Path path = Paths.get(filePath);
                Files.delete(path);
                messageHandler.addMessage("system", "Removed " + filePath);
            }
        } catch (IOException e) {
            messageHandler.addMessage("system", "Error: " + e.getMessage());
        }
    }
}