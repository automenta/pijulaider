package com.pijul.aider;

import com.pijul.aider.commands.CommandManager;
import com.pijul.aider.tui.ChatPanel;

public class InputHandler {
    private final CommandManager commandManager;
    private final LLMManager llmManager;
    private final ChatPanel chatPanel;

    public InputHandler(CommandManager commandManager, LLMManager llmManager, ChatPanel chatPanel) {
        this.commandManager = commandManager;
        this.llmManager = llmManager;
        this.chatPanel = chatPanel;
    }

    public void handle(String input) {
        if (input.startsWith("/")) {
            commandManager.executeCommand(input);
        } else {
            String response = llmManager.chat(input);
            chatPanel.addMessage("You: " + input);
            chatPanel.addMessage("AI: " + response);
        }
    }
}
