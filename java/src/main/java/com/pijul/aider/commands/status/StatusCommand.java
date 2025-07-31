package com.pijul.aider.commands.status;

import com.pijul.aider.Container;
import com.pijul.aider.commands.Command;
import com.pijul.aider.versioning.VersioningBackend;
import java.util.concurrent.CompletableFuture;

public class StatusCommand implements Command {
    private final Container container;

    public StatusCommand(Container container) {
        this.container = container;
    }

    @Override
    public void execute(String[] args) {
        VersioningBackend backend = container.getBackend();
        CompletableFuture<String> statusFuture = backend.status();
        
        statusFuture.thenAccept(status -> {
            container.getMessageHandler().addMessage("system", status);
        }).exceptionally(error -> {
            container.getMessageHandler().addMessage("system", "Error: " + error.getMessage());
            return null;
        });
    }
}