package com.pijul.aider.commands;

import com.pijul.aider.tui.ChatPanel;
import com.pijul.aider.versioning.VersioningBackend;

import java.io.IOException;
import java.util.Arrays;

public class RecordCommand {
    private final VersioningBackend versioningBackend;
    private final ChatPanel chatPanel;

    public RecordCommand(VersioningBackend versioningBackend, ChatPanel chatPanel) {
        this.versioningBackend = versioningBackend;
        this.chatPanel = chatPanel;
    }

    public void execute(String[] args) {
        if (args.length < 2) {
            chatPanel.addMessage("Usage: /record <message>");
            return;
        }
        String message = String.join(" ", Arrays.copyOfRange(args, 1, args.length));
        try {
            versioningBackend.record(message);
            chatPanel.addMessage("Changes recorded.");
        } catch (IOException e) {
            chatPanel.addMessage("Error recording changes: " + e.getMessage());
        }
    }
}
