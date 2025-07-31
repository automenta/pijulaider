package com.piul.aider;

import com.piul.aider.commands.Command;
import java.util.HashMap;
import java.util.Map;
import java.util.Scanner;

/**
 * Manages command registration and execution
 */
public class CommandManager {
    private Map<String, Command> commands = new HashMap<>();
    private boolean listening = false;
    private Scanner scanner;

    /**
     * Register a command with the manager
     * @param name Command name (without parameters)
     * @param command Command implementation
     */
    public void registerCommand(String name, Command command) {
        commands.put(name, command);
    }

    /**
     * Start listening for commands from standard input
     */
    public void startListening() {
        if (listening) return;
        listening = true;
        scanner = new Scanner(System.in);
        System.out.println("Command listener started. Type 'help' for available commands.");
        
        new Thread(() -> {
            while (listening) {
                System.out.print("> ");
                if (scanner.hasNextLine()) {
                    String line = scanner.nextLine();
                    if (line.isEmpty()) continue;
                    String[] parts = line.split(" ", 2);
                    String cmdName = parts[0].toLowerCase();
                    String[] args = parts.length > 1 ? parts[1].split(" ") : new String[0];
                    
                    if (cmdName.equals("exit")) {
                        stopListening();
                        break;
                    }
                    
                    Command cmd = commands.get(cmdName);
                    if (cmd != null) {
                        cmd.execute(args);
                    } else {
                        System.out.println("Error: Unknown command '" + cmdName + "'. Type 'help' for available commands.");
                    }
                }
            }
        }).start();
    }

    /**
     * Stop listening for commands
     */
    public void stopListening() {
        listening = false;
        if (scanner != null) {
            scanner.close();
        }
    }

    /**
     * Get registered command count
     */
    public int getCommandCount() {
        return commands.size();
    }
}