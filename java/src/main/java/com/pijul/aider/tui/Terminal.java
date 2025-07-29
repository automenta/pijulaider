package com.pijul.aider.tui;

import com.googlecode.lanterna.screen.Screen;
import com.pijul.aider.commands.CommandManager;

public class Terminal {
    private final Screen screen;
    private final CommandManager commandManager;

    public Terminal(Screen screen, CommandManager commandManager) {
        this.screen = screen;
        this.commandManager = commandManager;
    }

    public void run() {
        // TODO: Implement terminal UI event loop
        try {
            screen.clear();
            screen.refresh();
            
            // Main event loop would go here
            // For now, just show a message
            screen.newTextGraphics().putString(10, 10, "Pijul Aider Java TUI");
            screen.refresh();
            
            Thread.sleep(2000);
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            try {
                screen.close();
            } catch (Exception e) {
                // Ignore
            }
        }
    }
}