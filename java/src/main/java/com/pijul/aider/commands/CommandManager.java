package com.pijul.aider.commands;

import com.pijul.aider.Container;
import java.lang.reflect.Constructor;
import java.util.HashMap;
import java.util.Map;

public class CommandManager {
    private final Map<String, Command> commands = new HashMap<>();
    private final Container container;

    public CommandManager(Container container) {
        this.container = container;
        loadCommands();
    }

    private void loadCommands() {
        // List of command classes to load dynamically
        String[] commandClasses = {
            "com.pijul.aider.commands.add.AddCommand",
            "com.pijul.aider.commands.apply.ApplyCommand",
            // Add more command classes as needed
        };

        for (String className : commandClasses) {
            try {
                Class<?> clazz = Class.forName(className);
                if (Command.class.isAssignableFrom(clazz)) {
                    Constructor<?> constructor = clazz.getDeclaredConstructor();
                    constructor.setAccessible(true);
                    Command command = (Command) constructor.newInstance();
                    String commandName = className.substring(className.lastIndexOf('.') + 1).replace("Command", "").toLowerCase();
                    commands.put(commandName, command);
                }
            } catch (Exception e) {
                System.err.println("Error loading command: " + className);
                e.printStackTrace();
            }
        }
    }

    public void executeCommand(String commandName, String[] args) {
        Command command = commands.get(commandName);
        if (command != null) {
            command.execute(args);
        } else {
            System.out.println("Unknown command: " + commandName);
        }
    }
}