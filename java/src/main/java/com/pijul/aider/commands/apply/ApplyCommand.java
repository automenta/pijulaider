package com.pijul.aider.commands.apply;

import com.pijul.aider.commands.Command;
import com.pijul.aider.Container;
import com.pijul.aider.DiffUtils;
import com.pijul.aider.MessageHandler;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

public class ApplyCommand implements Command {
    private final Container container;

    public ApplyCommand(Container container) {
        this.container = container;
    }

    @Override
    public void init() {
        // No initialization needed for ApplyCommand
    }

    @Override
    public void execute(String[] args) {
        try {
            MessageHandler messageHandler = container.getMessageHandler();
            String currentDiff = container.getDiff(); // Assuming Container has getDiff() method

            if (currentDiff == null || currentDiff.isEmpty()) {
                messageHandler.addMessage("system", "No diff to apply.");
                return;
            }

            if (args.length == 0) {
                messageHandler.addMessage("system", "Please provide a file path to apply the patch to.");
                return;
            }

            String filePath = args[0];
            String fileContent = new String(Files.readAllBytes(Paths.get(filePath)));
            
            String result = DiffUtils.applyPatch(fileContent, currentDiff);
            if (result != null) {
                Files.write(Paths.get(filePath), result.getBytes());
                messageHandler.addMessage("system", "Applied patch to " + filePath);
                container.setDiff(null); // Clear the diff after application
            } else {
                messageHandler.addMessage("system", "Failed to apply patch.");
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void cleanup() {
        // No cleanup needed for ApplyCommand
    }
}