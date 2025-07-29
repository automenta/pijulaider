package com.pijul.aider;

import com.pijul.aider.commands.CommandManager;
import com.googlecode.lanterna.screen.Screen;
import com.googlecode.lanterna.screen.TerminalScreen;
import com.googlecode.lanterna.terminal.DefaultTerminalFactory;
import com.pijul.aider.tui.Terminal;
import java.io.IOException;

public class App {
    public static void main(String[] args) {
        try {
            // Initialize container
            Container container = new Container();
            
            // Initialize command manager with container
            CommandManager commandManager = new CommandManager(container);
            
            // Initialize terminal
            DefaultTerminalFactory terminalFactory = new DefaultTerminalFactory();
            Screen screen = new TerminalScreen(terminalFactory.createTerminal());
            screen.startScreen();
            
            // Start terminal UI
            Terminal tui = new Terminal(screen, commandManager);
            tui.run();
        } catch (IOException e) {
            System.err.println("Error initializing application: " + e.getMessage());
            System.exit(1);
        }
    }
}