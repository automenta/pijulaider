package com.pijul.aider.commands.edit;

import com.pijul.aider.commands.Command;
import com.pijul.aider.Container;
import com.pijul.aider.Backend;
import com.pijul.aider.MessageHandler;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

public class EditCommand implements Command {
    private Container container;

    public EditCommand(Container container) {
        this.container = container;
    }

    @Override
    public void execute(String[] args) {
        if (args.length == 0) {
            container.getMessageHandler().addMessage("system", "Please specify a file to edit.");
            return;
        }
        
        String file = args[0];
        try {
            // In a real implementation, this would open an editor
            // For now, we'll just simulate by reading the file
            Path path = Paths.get(file);
            String content = new String(Files.readAllBytes(path));
            
            // Simulate editing by updating the container
            container.getMessageHandler().addMessage("system", "Editing " + file);
            
            // After editing, show diff
            Backend backend = container.getBackend();
            String diff = backend.diff();
            container.setDiff(diff);
            container.getMessageHandler().addMessage("system", "Finished editing " + file);
        } catch (Exception e) {
            container.getMessageHandler().addMessage("system", "Error: " + e.getMessage());
        }
    }
}