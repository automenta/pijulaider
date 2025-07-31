package com.pijul.aider.commands;

import com.pijul.aider.Container;
import com.pijul.aider.MessageHandler;
import com.pijul.aider.commands.exit.ExitCommand;
import com.pijul.aider.commands.help.HelpCommand;
import java.util.HashMap;
import java.util.Map;

public class CommandManager {
    private final MessageHandler messageHandler;
    private final Map<String, Command> commands;

    public CommandManager(Container container) {
        this.messageHandler = container.getMessageHandler();
        this.commands = new HashMap<>();
        registerCommand("help", new HelpCommand(container));
        registerCommand("exit", new ExitCommand(container));
    }

    public void registerCommand(String name, Command command) {
        commands.put(name, command);
    }

    public void processInput(String input) {
        if (input == null || input.trim().isEmpty()) {
            return;
        }

        String[] parts = input.trim().split(" ", 2);
        String commandName = parts[0].toLowerCase();
        String[] args = parts.length > 1 ? parts[1].split(" ") : new String[0];

        Command command = commands.get(commandName);
        if (command != null) {
            command.execute(args);
        } else {
            messageHandler.addMessage("system", "Unknown command: " + commandName);
        }
    }

    public void startListening() {
        for (Command command : commands.values()) {
            command.init();
        }
        System.out.println("All commands initialized and listening.");
    }

    public void stopListening() {
        for (Command command : commands.values()) {
            command.cleanup();
        }
        System.out.println("All commands stopped.");
    }
}