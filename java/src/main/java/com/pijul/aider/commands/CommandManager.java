package com.pijul.aider.commands;

import java.util.HashMap;
import java.util.Map;
import java.util.function.Consumer;

public class CommandManager {
    private final Map<String, Consumer<String[]>> commands = new HashMap<>();

    public void registerCommand(String name, Consumer<String[]> handler) {
        commands.put(name, handler);
    }

    public void executeCommand(String input) {
        String[] parts = input.split("\\s+");
        String commandName = parts[0];
        if (commands.containsKey(commandName)) {
            commands.get(commandName).accept(parts);
        }
    }
}
