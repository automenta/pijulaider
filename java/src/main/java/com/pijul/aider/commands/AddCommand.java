package com.pijul.aider.commands;

import com.pijul.aider.FileManager;
import com.pijul.aider.tui.ChatPanel;

import java.io.IOException;

public class AddCommand {
    private final FileManager fileManager;
    private final ChatPanel chatPanel;

    public AddCommand(FileManager fileManager, ChatPanel chatPanel) {
        this.fileManager = fileManager;
        this.chatPanel = chatPanel;
    }

    public void execute(String[] args) {
        if (args.length < 2) {
            chatPanel.addMessage("Usage: /add <file>");
            return;
        }
        String file = args[1];
        try {
            String content = fileManager.readFile(file);
            chatPanel.addMessage("File " + file + " added to chat:\n" + content);
        } catch (IOException e) {
            chatPanel.addMessage("Error reading file " + file + ": " + e.getMessage());
        }
    }
}
