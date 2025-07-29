package com.pijul.aider;

import com.googlecode.lanterna.TerminalSize;
import com.googlecode.lanterna.TextColor;
import com.googlecode.lanterna.gui2.*;
import com.googlecode.lanterna.screen.Screen;
import com.googlecode.lanterna.screen.TerminalScreen;
import com.googlecode.lanterna.terminal.DefaultTerminalFactory;
import com.googlecode.lanterna.terminal.Terminal;
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
        window.setHints(java.util.Arrays.asList(Window.Hint.CENTERED));

        // Create a panel
        Panel panel = new Panel();
        panel.setLayoutManager(new LinearLayout(Direction.VERTICAL));

        // Add a label
        panel.addComponent(new Label("Welcome to Pijul Aider!"));

        // Add a text box for input
        TextBox textBox = new TextBox();
        panel.addComponent(textBox);

        // Add a button to send messages
        Button sendButton = new Button("Send", () -> {
            String userInput = textBox.getText();
            if (userInput != null && !userInput.isEmpty()) {
                // This is a placeholder for the API key.
                // In a real application, this should be handled securely.
                String apiKey = System.getenv("OPENAI_API_KEY");
                if (apiKey == null || apiKey.isEmpty()) {
                    logger.error("OPENAI_API_KEY environment variable not set.");
                    return;
                }
                LLMManager llmManager = new LLMManager(apiKey);
                String response = llmManager.chat(userInput);
                // Display the response in the TUI.
                // For now, we'll just print to the console.
                logger.info("Response: " + response);
            }
        });
        panel.addComponent(sendButton);


        window.setComponent(panel);

        // Create a GUI and add the window
        MultiWindowTextGUI gui = new MultiWindowTextGUI(screen, new DefaultWindowManager(), new EmptySpace(TextColor.ANSI.BLUE));
        gui.addWindowAndWait(window);

        screen.stopScreen();
    }
}
