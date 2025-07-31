package com.pijul.aider;

import com.googlecode.lanterna.screen.Screen;
import com.googlecode.lanterna.screen.TerminalScreen;
import com.googlecode.lanterna.terminal.DefaultTerminalFactory;
import com.pijul.aider.commands.CommandManager;
import com.pijul.aider.tui.Terminal;
import java.io.IOException;

public class App {
    public static void main(String[] args) {
        try {
            // Initialize container for dependency injection
            Container container = new Container();
            
            // Initialize terminal
            DefaultTerminalFactory terminalFactory = new DefaultTerminalFactory();
            Screen screen = new TerminalScreen(terminalFactory.createTerminal());
            screen.startScreen();
            
            // Start terminal UI with command manager
            Terminal tui = new Terminal(screen, container.getCommandManager());
            container.setTerminal(tui); // Set the terminal in the container
            tui.run();
        } catch (IOException e) {
            System.err.println("Error initializing application: " + e.getMessage());
            System.exit(1);
        }
    }
}