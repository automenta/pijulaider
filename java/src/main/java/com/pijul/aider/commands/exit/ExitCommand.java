package com.pijul.aider.commands.exit;

import com.pijul.aider.commands.Command;
import com.pijul.aider.Container;
import com.pijul.aider.tui.Terminal;

public class ExitCommand implements Command {
    private Container container;

    public ExitCommand(Container container) {
        this.container = container;
    }

    @Override
    public void init() {
        // No initialization needed for ExitCommand
    }

    @Override
    public void execute(String[] args) {
        Terminal terminal = container.getTerminal();
        if (terminal != null) {
            terminal.stop();
            container.setTerminal(null);
            container.getMessageHandler().addMessage("system", "Terminal session ended.");
        }
    }

    @Override
    public void cleanup() {
        // No cleanup needed for ExitCommand
    }
}