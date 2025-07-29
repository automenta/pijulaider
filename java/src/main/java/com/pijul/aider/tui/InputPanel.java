package com.pijul.aider.tui;

import com.googlecode.lanterna.gui2.Button;
import com.googlecode.lanterna.gui2.Panel;
import com.googlecode.lanterna.gui2.TextBox;

import java.util.function.Consumer;

public class InputPanel extends Panel {
    private final TextBox inputBox;
    private final Button sendButton;

    public InputPanel(Consumer<String> onSendMessage) {
        this.inputBox = new TextBox();
        this.sendButton = new Button("Send", () -> {
            onSendMessage.accept(inputBox.getText());
            inputBox.setText("");
        });

        addComponent(inputBox);
        addComponent(sendButton);
    }
}
