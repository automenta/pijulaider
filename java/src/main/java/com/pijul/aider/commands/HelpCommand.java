package com.pijul.aider.commands;

import com.pijul.aider.tui.ChatPanel;

public class HelpCommand {
    private final ChatPanel chatPanel;

    public HelpCommand(ChatPanel chatPanel) {
        this.chatPanel = chatPanel;
    }

    public void execute(String[] args) {
        chatPanel.addMessage("Available commands:\n" +
                "/add <file> - Add a file to the chat\n" +
                "/diff - Show the current changes\n" +
                "/record <message> - Record the current changes\n" +
                "/help - Show this help message");
    }
}
