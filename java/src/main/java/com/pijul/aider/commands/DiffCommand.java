package com.pijul.aider.commands;

import com.pijul.aider.tui.ChatPanel;
import com.pijul.aider.versioning.VersioningBackend;

import java.io.IOException;

public class DiffCommand {
    private final VersioningBackend versioningBackend;
    private final ChatPanel chatPanel;

    public DiffCommand(VersioningBackend versioningBackend, ChatPanel chatPanel) {
        this.versioningBackend = versioningBackend;
        this.chatPanel = chatPanel;
    }

    public void execute(String[] args) {
        try {
            String diff = versioningBackend.getDiff();
            chatPanel.addMessage("Diff:\n" + diff);
        } catch (IOException e) {
            chatPanel.addMessage("Error getting diff: " + e.getMessage());
        }
    }
}
