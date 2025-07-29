package com.pijul.aider;

import com.googlecode.lanterna.TextColor;
import com.googlecode.lanterna.gui2.*;
import com.googlecode.lanterna.screen.Screen;
import com.googlecode.lanterna.screen.TerminalScreen;
import com.googlecode.lanterna.terminal.DefaultTerminalFactory;
import com.googlecode.lanterna.terminal.Terminal;
import com.pijul.aider.commands.*;
import com.pijul.aider.tui.ChatPanel;
import com.pijul.aider.tui.InputPanel;
import com.pijul.aider.tui.StatusPanel;
import com.pijul.aider.versioning.VersioningBackend;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;

public class PijulAider {

    private static final Logger logger = LoggerFactory.getLogger(PijulAider.class);

    public static void main(String[] args) throws IOException {
        logger.info("Starting Pijul Aider");
        Terminal terminal = new DefaultTerminalFactory().createTerminal();
        Screen screen = new TerminalScreen(terminal);
        screen.startScreen();

        // Create a window
        BasicWindow window = new BasicWindow("Pijul Aider");
        window.setHints(java.util.Arrays.asList(Window.Hint.CENTERED, Window.Hint.FULL_SCREEN));

        // Create a panel
        Panel panel = new Panel();
        panel.setLayoutManager(new LinearLayout(Direction.VERTICAL));

        // Create TUI components
        ChatPanel chatPanel = new ChatPanel();
        StatusPanel statusPanel = new StatusPanel();

        // Create core components
        FileManager fileManager = new FileManager();
        VersioningBackend versioningBackend = BackendManager.getBackend();
        CommandManager commandManager = new CommandManager();
        LLMManager llmManager = new LLMManager(System.getenv("OPENAI_API_KEY"));
        InputHandler inputHandler = new InputHandler(commandManager, llmManager, chatPanel);
        InputPanel inputPanel = new InputPanel(inputHandler::handle);


        panel.addComponent(chatPanel);
        panel.addComponent(inputPanel);
        panel.addComponent(statusPanel);


        // Register commands
        commandManager.registerCommand("/add", new AddCommand(fileManager, chatPanel)::execute);
        commandManager.registerCommand("/diff", new DiffCommand(versioningBackend, chatPanel)::execute);
        commandManager.registerCommand("/record", new RecordCommand(versioningBackend, chatPanel)::execute);
        commandManager.registerCommand("/help", new HelpCommand(chatPanel)::execute);


        // Set the main component of the window
        window.setComponent(panel);

        // Create a GUI and add the window
        MultiWindowTextGUI gui = new MultiWindowTextGUI(screen, new DefaultWindowManager(), new EmptySpace(TextColor.ANSI.BLUE));
        gui.addWindowAndWait(window);

        screen.stopScreen();
    }
}
