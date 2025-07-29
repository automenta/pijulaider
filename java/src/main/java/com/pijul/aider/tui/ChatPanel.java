package com.pijul.aider.tui;

import com.googlecode.lanterna.gui2.Panel;
import com.googlecode.lanterna.gui2.TextBox;

public class ChatPanel extends Panel {
    private final TextBox chatBox;

    public ChatPanel() {
        this.chatBox = new TextBox();
        this.chatBox.setReadOnly(true);
        addComponent(chatBox);
    }

    public void addMessage(String message) {
        chatBox.setText(chatBox.getText() + message + "\n");
    }
}
