package com.pijul.aider.commands.help;

import com.pijul.aider.Container;
import com.pijul.aider.commands.Command;
import com.pijul.aider.MessageHandler;
import java.util.HashMap;
import java.util.Map;

public class HelpCommand implements Command {
    private final Container container;
    private final Map<String, String> commandMap;

    public HelpCommand(Container container) {
        this.container = container;
        this.commandMap = new HashMap<>();
        initializeCommandMap();
    }

    private void initializeCommandMap() {
        commandMap.put("add", "Add a file to the chat and stage it.");
        commandMap.put("clear", "Clear the current codebase context.");
        commandMap.put("codebase", "Show the current codebase.");
        commandMap.put("commit", "Commit the staged changes.");
        commandMap.put("create", "Create a new file.");
        commandMap.put("diff", "Show the current changes.");
        commandMap.put("drop", "Remove a file from the chat.");
        commandMap.put("edit", "Edit a file.");
        commandMap.put("exit", "Exit the interactive terminal.");
        commandMap.put("help", "Show this help message.");
        commandMap.put("ls", "List files in the current or specified directory.");
        commandMap.put("mv", "Move or rename a file.");
        commandMap.put("grep", "Search for a pattern in files.");
        commandMap.put("apply", "Apply a patch from the chat.");
        commandMap.put("record", "Record the current changes with a message (alias for /commit).");
        commandMap.put("rm", "Remove a file.");
        commandMap.put("run", "Run a shell command or start an interactive terminal.");
        commandMap.put("status", "Show the current status of the repository.");
        commandMap.put("test", "Run the test suite.");
        commandMap.put("undo", "Undo changes to a file or the entire project.");
    }
@Override
public void init() {
    // No initialization needed for HelpCommand
}

@Override
public void execute(String[] args) {
    MessageHandler messageHandler = container.getMessageHandler();
    StringBuilder helpMessage = new StringBuilder("Available commands:\n");
    for (Map.Entry<String, String> entry : commandMap.entrySet()) {
        helpMessage.append("  /")
                  .append(entry.getKey())
                  .append(" - ")
                  .append(entry.getValue())
                  .append("\n");
    }
    messageHandler.addMessage("system", helpMessage.toString());
}

@Override
public void cleanup() {
    // No cleanup needed for HelpCommand
}
    }