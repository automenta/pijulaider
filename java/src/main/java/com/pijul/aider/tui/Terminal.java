package com.pijul.aider.tui;

import com.googlecode.lanterna.screen.Screen;
import com.googlecode.lanterna.screen.TerminalScreen;
import com.googlecode.lanterna.terminal.DefaultTerminalFactory;
import com.googlecode.lanterna.graphics.TextGraphics;
import com.pijul.aider.commands.CommandManager;
import java.io.IOException;

public class Terminal {
    private TerminalScreen screen;
    private CommandManager commandManager;
    private boolean running = true;
    private StringBuilder inputBuffer = new StringBuilder();

    public Terminal(Screen screen, CommandManager commandManager) throws IOException {
        this.screen = (TerminalScreen) screen;
        this.commandManager = commandManager;
        screen.startScreen();
    }

    public void run() {
        // Start command input loop
        commandManager.startListening();
        
        while (running) {
            // Handle terminal input and rendering
            screen.clear();
            TextGraphics tg = screen.newTextGraphics();
            tg.putString(0, 0, "Pijul Aider Terminal");
            tg.putString(0, 2, "> " + inputBuffer.toString()); // Display current input
            try {
                screen.refresh();
            } catch (IOException e) {
                e.printStackTrace();
            }

            // Read input and process commands
            com.googlecode.lanterna.input.KeyStroke keyStroke = null;
            try {
                keyStroke = screen.pollInput();
            } catch (IOException e) {
                e.printStackTrace();
            }

            if (keyStroke != null) {
                switch (keyStroke.getKeyType()) {
                    case Character:
                        inputBuffer.append(keyStroke.getCharacter());
                        break;
                    case Enter:
                        commandManager.processInput(inputBuffer.toString());
                        inputBuffer.setLength(0); // Clear buffer after processing
                        break;
                    case Backspace:
                        if (inputBuffer.length() > 0) {
                            inputBuffer.setLength(inputBuffer.length() - 1);
                        }
                        break;
                    case Escape:
                        running = false; // Exit on Escape
                        break;
                    default:
                        // Ignore other key types for now
                        break;
                }
            }

            try {
                Thread.sleep(50); // Shorter sleep for more responsive input
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                e.printStackTrace();
            }
        }
        
        // Cleanup
        try {
            screen.stopScreen();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public void stop() {
        running = false;
    }
}